"use client";

import { FolderContents } from "@/components/main-panel/folder-contents";
import { WorkspaceBreadcrumb } from "@/components/main-panel/workspace-breadcrumb";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import { useWorkspaceStore } from "@/lib/workspace-store";

export default function Home() {
  const hasHydrated = useWorkspaceStore((s) => s.hasHydrated);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <WorkspaceSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-4 py-3">
          <WorkspaceBreadcrumb />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <FolderContents folderId={selectedFolderId} />
        </div>
      </main>
    </div>
  );
}
