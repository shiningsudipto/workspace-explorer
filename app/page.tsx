"use client";

import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import { useWorkspaceStore } from "@/lib/workspace-store";

export default function Home() {
  const hasHydrated = useWorkspaceStore((s) => s.hasHydrated);

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
      <main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Main panel coming in Phase 5.
      </main>
    </div>
  );
}
