"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSystemItem, ROOT_ID } from "@/lib/types";
import { getPath } from "@/lib/workspace-helpers";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { TreeNode } from "./tree-node";

interface WorkspaceSidebarProps {
  onRename: (item: FileSystemItem) => void;
  onDelete: (item: FileSystemItem) => void;
  /** Called after a folder is selected — used on mobile to close the drawer. */
  onNavigate?: () => void;
}

export function WorkspaceSidebar({
  onRename,
  onDelete,
  onNavigate,
}: WorkspaceSidebarProps) {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId);

  // Local (not persisted) expand/collapse state — the root starts expanded
  // so the tree isn't empty on first load.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([ROOT_ID])
  );

  // Auto-expand the path to the selected folder whenever it changes from
  // *outside* the tree (breadcrumb, search, a main-panel row, sidebar
  // delete-recovery) — otherwise navigating there via any of those leaves
  // its ancestors collapsed and it simply isn't visible/highlighted in the
  // tree at all. Adjusts state during render (React's documented pattern
  // for "state derived from a changed prop") rather than in an effect, so
  // it doesn't cost an extra render pass.
  const [lastSelectedFolderId, setLastSelectedFolderId] = useState(selectedFolderId);
  if (selectedFolderId !== lastSelectedFolderId) {
    setLastSelectedFolderId(selectedFolderId);
    const ancestorIds = getPath(items, selectedFolderId).map((f) => f.id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestorIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelect = (id: string) => {
    setSelectedFolderId(id);
    onNavigate?.();
  };

  return (
    <nav
      aria-label="Workspace folders"
      className="flex h-full flex-col self-stretch border-r"
    >
      <ScrollArea className="flex-1">
        <div role="tree" className="px-2 py-2">
          <TreeNode
            folderId={ROOT_ID}
            depth={0}
            items={items}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpanded}
            selectedFolderId={selectedFolderId}
            onSelect={handleSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      </ScrollArea>
    </nav>
  );
}
