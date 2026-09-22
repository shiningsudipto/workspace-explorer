import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./id";
import { createSeedData } from "./seed-data";
import { FileSystemItem, OperationResult, ROOT_ID, WorkspaceItems } from "./types";
import { getDescendantIds, isDuplicateName } from "./workspace-helpers";

interface WorkspaceState {
  items: WorkspaceItems;
  selectedFolderId: string;
  selectedFileId: string | null;
  /**
   * Flips to true once localStorage rehydration has run (see
   * `skipHydration` below and `rehydrateWorkspaceStore`). UI that needs to
   * avoid a flash of pre-hydration state should gate on this.
   */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  createItem: (
    parentId: string,
    name: string,
    type: FileSystemItem["type"]
  ) => OperationResult;
  renameItem: (id: string, name: string) => OperationResult;
  deleteItem: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  setSelectedFolderId: (id: string) => void;
  setSelectedFileId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      items: createSeedData(),
      selectedFolderId: ROOT_ID,
      selectedFileId: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      createItem: (parentId, rawName, type) => {
        const name = rawName.trim();
        if (!name) {
          return { ok: false, error: "Name cannot be empty." };
        }

        const { items } = get();
        if (isDuplicateName(items, parentId, name)) {
          return { ok: false, error: `"${name}" already exists in this folder.` };
        }

        const id = generateId();
        const now = Date.now();
        const newItem: FileSystemItem = {
          id,
          name,
          type,
          parentId,
          ...(type === "file" ? { content: "" } : {}),
          createdAt: now,
          updatedAt: now,
        };

        set({ items: { ...items, [id]: newItem } });
        return { ok: true };
      },

      renameItem: (id, rawName) => {
        const name = rawName.trim();
        if (!name) {
          return { ok: false, error: "Name cannot be empty." };
        }

        const { items } = get();
        const item = items[id];
        if (!item) {
          return { ok: false, error: "This item no longer exists." };
        }
        if (
          item.parentId !== null &&
          isDuplicateName(items, item.parentId, name, id)
        ) {
          return { ok: false, error: `"${name}" already exists in this folder.` };
        }

        set({
          items: {
            ...items,
            [id]: { ...item, name, updatedAt: Date.now() },
          },
        });
        return { ok: true };
      },

      deleteItem: (id) => {
        if (id === ROOT_ID) return;

        const { items, selectedFolderId, selectedFileId } = get();
        if (!items[id]) return;

        const idsToDelete = new Set([id, ...getDescendantIds(items, id)]);
        const nextItems = { ...items };
        idsToDelete.forEach((deletedId) => delete nextItems[deletedId]);

        // Walk up the (pre-delete) parent chain until we hit an item that
        // survived the cascade, or fall back to the root.
        const nearestSurvivingAncestor = (startId: string): string => {
          let current: string | null = startId;
          while (current && !nextItems[current]) {
            current = items[current]?.parentId ?? null;
          }
          return current ?? ROOT_ID;
        };

        const nextSelectedFolderId = idsToDelete.has(selectedFolderId)
          ? nearestSurvivingAncestor(items[selectedFolderId]?.parentId ?? ROOT_ID)
          : selectedFolderId;

        const nextSelectedFileId =
          selectedFileId && idsToDelete.has(selectedFileId) ? null : selectedFileId;

        set({
          items: nextItems,
          selectedFolderId: nextSelectedFolderId,
          selectedFileId: nextSelectedFileId,
        });
      },

      updateFileContent: (id, content) => {
        const { items } = get();
        const item = items[id];
        if (!item || item.type !== "file") return;

        set({
          items: {
            ...items,
            [id]: { ...item, content, updatedAt: Date.now() },
          },
        });
      },

      setSelectedFolderId: (id) => set({ selectedFolderId: id }),
      setSelectedFileId: (id) => set({ selectedFileId: id }),
    }),
    {
      name: "workspace-explorer",
      version: 1,
      // Only the actual filesystem data + current folder need to survive a
      // refresh. `selectedFileId` is intentionally left as runtime-only UI
      // state, so reloading the app never re-opens the editor.
      partialize: (state) => ({
        items: state.items,
        selectedFolderId: state.selectedFolderId,
      }),
      // This module is imported from a server-rendered layout, where
      // `localStorage` doesn't exist — persist manually via
      // `rehydrateWorkspaceStore()` from a client-only component instead of
      // rehydrating automatically on store creation.
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate workspace store:", error);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Triggers localStorage rehydration. Call once from a client-only component
 * mounted in the root layout (persist's `skipHydration: true` means this
 * doesn't happen automatically).
 */
export function rehydrateWorkspaceStore() {
  void useWorkspaceStore.persist.rehydrate();
}
