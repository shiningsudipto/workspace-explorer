"use client";

import { toast } from "sonner";
import { FileSystemItem } from "@/lib/types";
import { getChildren } from "@/lib/workspace-helpers";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { ItemRow } from "./item-row";

interface FolderContentsProps {
  folderId: string;
}

export function FolderContents({ folderId }: FolderContentsProps) {
  const items = useWorkspaceStore((s) => s.items);
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId);
  const setSelectedFileId = useWorkspaceStore((s) => s.setSelectedFileId);

  const children = getChildren(items, folderId);

  const handleOpen = (item: FileSystemItem) => {
    if (item.type === "folder") {
      setSelectedFolderId(item.id);
    } else {
      setSelectedFileId(item.id);
    }
  };

  // Create/rename/delete dialogs land in Phase 6 — these affordances are
  // wired up now so the surrounding UI (row, menu, empty state) doesn't
  // need to change shape once they do.
  const handleRename = (item: FileSystemItem) => {
    toast.info(`Rename "${item.name}" — coming in Phase 6.`);
  };

  const handleDelete = (item: FileSystemItem) => {
    toast.info(`Delete "${item.name}" — coming in Phase 6.`);
  };

  if (children.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        This folder is empty.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {children.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onOpen={handleOpen}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
