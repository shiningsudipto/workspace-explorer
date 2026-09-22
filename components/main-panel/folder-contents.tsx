"use client";

import { FileSystemItem } from "@/lib/types";
import { getChildren } from "@/lib/workspace-helpers";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { ItemRow } from "./item-row";

interface FolderContentsProps {
  folderId: string;
  onRename: (item: FileSystemItem) => void;
  onDelete: (item: FileSystemItem) => void;
}

export function FolderContents({
  folderId,
  onRename,
  onDelete,
}: FolderContentsProps) {
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
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
