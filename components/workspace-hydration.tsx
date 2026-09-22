"use client";

import { useEffect } from "react";
import { rehydrateWorkspaceStore } from "@/lib/workspace-store";

/**
 * Triggers localStorage rehydration once on mount. The store uses
 * `skipHydration: true` because it's imported by the server-rendered
 * layout, so this client-only effect is what actually loads persisted
 * data instead of it happening automatically on store creation.
 */
export function WorkspaceHydration() {
  useEffect(() => {
    rehydrateWorkspaceStore();
  }, []);

  return null;
}
