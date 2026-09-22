"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { CreateItemDialog } from "@/components/dialogs/create-item-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileSystemItem } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { FileEditor } from "./file-editor";
import { FolderContents } from "./folder-contents";
import { WorkspaceBreadcrumb } from "./workspace-breadcrumb";
import { WorkspaceSearch } from "./workspace-search";

interface MainPanelProps {
  folderId: string;
  onRename: (item: FileSystemItem) => void;
  onDelete: (item: FileSystemItem) => void;
  /** Only passed on mobile, where the sidebar lives in a Sheet/drawer. */
  onOpenSidebar?: () => void;
}

export function MainPanel({
  folderId,
  onRename,
  onDelete,
  onOpenSidebar,
}: MainPanelProps) {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFileId = useWorkspaceStore((s) => s.selectedFileId);
  const openFile =
    selectedFileId && items[selectedFileId]?.type === "file"
      ? items[selectedFileId]
      : null;

  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="flex h-full flex-col self-stretch overflow-hidden">
      <div className="flex items-center gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
        {onOpenSidebar && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label="Open sidebar"
            onClick={onOpenSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <WorkspaceBreadcrumb />
        </div>
        <WorkspaceSearch />
        <ThemeToggle />
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
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
      </div>

      <CreateItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentId={folderId}
      />
    </main>
  );
}
