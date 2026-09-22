"use client";

import { MainPanel } from "@/components/main-panel/main-panel";
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
      <MainPanel folderId={selectedFolderId} />
    </div>
  );
}
