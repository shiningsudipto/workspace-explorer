"use client";

import { useState } from "react";
import { DeleteItemDialog } from "@/components/dialogs/delete-item-dialog";
import { RenameItemDialog } from "@/components/dialogs/rename-item-dialog";
import { MainPanel } from "@/components/main-panel/main-panel";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/lib/use-is-mobile";
import { FileSystemItem } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";

export default function Home() {
  const hasHydrated = useWorkspaceStore((s) => s.hasHydrated);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const isMobile = useIsMobile();

  // Rename/delete are triggered from both the sidebar tree and the main
  // panel's rows, so the dialogs (and their target) live here, one level
  // above both, instead of being duplicated in each.
  const [renameTarget, setRenameTarget] = useState<FileSystemItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileSystemItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const dialogs = (
    <>
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
    </>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 gap-0 p-0">
            <SheetTitle className="sr-only">Workspace folders</SheetTitle>
            <WorkspaceSidebar
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <MainPanel
          folderId={selectedFolderId}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />
        {dialogs}
      </>
    );
  }

  return (
    <>
      {/* The group's default `h-full w-full` assumes a definite-height ancestor;
          this page's own height instead comes from `flex-1` in a flex-col chain
          (see WorkspaceSidebar's `self-stretch` for the same underlying reason),
          so `h-auto` cancels that default and `flex-1` grows to fill instead. */}
      <ResizablePanelGroup orientation="horizontal" className="h-auto flex-1">
        <ResizablePanel
          id="sidebar-panel"
          defaultSize={240}
          minSize={180}
          maxSize={480}
        >
          <WorkspaceSidebar
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="main-panel">
          <MainPanel
            folderId={selectedFolderId}
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {dialogs}
    </>
  );
}
