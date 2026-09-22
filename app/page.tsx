"use client";

import { MainPanel } from "@/components/main-panel/main-panel";
import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
    // The group's default `h-full w-full` assumes a definite-height ancestor;
    // this page's own height instead comes from `flex-1` in a flex-col chain
    // (see WorkspaceSidebar's `self-stretch` for the same underlying reason),
    // so `h-auto` cancels that default and `flex-1` grows to fill instead.
    <ResizablePanelGroup orientation="horizontal" className="h-auto flex-1">
      <ResizablePanel
        id="sidebar-panel"
        defaultSize={240}
        minSize={180}
        maxSize={480}
      >
        <WorkspaceSidebar />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="main-panel">
        <MainPanel folderId={selectedFolderId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
