export type FileSystemItemType = "folder" | "file";

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileSystemItemType;
  parentId: string | null;
  /** Only meaningful for files. */
  content?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Flat map keyed by id, rather than a nested tree object — gives O(1)
 * rename/delete/move lookups and avoids deep-clone pain. The tree/children
 * view is derived with selectors (see lib/workspace-helpers.ts), not stored.
 */
export type WorkspaceItems = Record<string, FileSystemItem>;

/**
 * Single root folder, parentId: null. Having one fixed root means
 * breadcrumb/path logic never needs a special case for "no parent folder".
 */
export const ROOT_ID = "root";

/**
 * Result of a mutating store action that can fail validation (create/rename),
 * so callers (dialogs) can show an inline error instead of the store
 * throwing or silently no-op'ing.
 */
export type OperationResult = { ok: true } | { ok: false; error: string };
