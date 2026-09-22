"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROOT_ID } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { TreeNode } from "./tree-node";

export function WorkspaceSidebar() {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId);

  // Local (not persisted) expand/collapse state — the root starts expanded
  // so the tree isn't empty on first load.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([ROOT_ID])
  );

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

  return (
    <nav
      aria-label="Workspace folders"
      className="flex h-full w-64 shrink-0 flex-col border-r"
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
            onSelect={setSelectedFolderId}
          />
        </div>
      </ScrollArea>
    </nav>
  );
}
