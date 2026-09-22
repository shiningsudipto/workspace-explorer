"use client";

import { useState } from "react";
import { CreateItemDialog } from "@/components/dialogs/create-item-dialog";
import { DeleteItemDialog } from "@/components/dialogs/delete-item-dialog";
import { RenameItemDialog } from "@/components/dialogs/rename-item-dialog";
import { Button } from "@/components/ui/button";
import { FileSystemItem } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { FileEditor } from "./file-editor";
import { FolderContents } from "./folder-contents";
import { WorkspaceBreadcrumb } from "./workspace-breadcrumb";
import { WorkspaceSearch } from "./workspace-search";

interface MainPanelProps {
  folderId: string;
}

export function MainPanel({ folderId }: MainPanelProps) {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFileId = useWorkspaceStore((s) => s.selectedFileId);
  const openFile =
    selectedFileId && items[selectedFileId]?.type === "file"
      ? items[selectedFileId]
      : null;

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileSystemItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileSystemItem | null>(null);

  return (
    <main className="flex h-full flex-col self-stretch overflow-hidden">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <WorkspaceBreadcrumb />
        </div>
        <WorkspaceSearch />
        {/* Creating always targets the folder being browsed, which isn't
            meaningful while a file editor has replaced that view. */}
        {!openFile && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            New
          </Button>
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        {openFile ? (
          // Keyed by id so switching between two files unmounts/remounts
          // the editor instead of reusing the instance (see FileEditor's
          // unmount-time autosave).
          <FileEditor key={openFile.id} file={openFile} />
        ) : (
          <FolderContents
            folderId={folderId}
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <CreateItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentId={folderId}
      />
      <RenameItemDialog
        item={renameTarget}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      />
      <DeleteItemDialog
        item={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </main>
  );
}
