import { useSyncExternalStore } from "react";

// Matches Tailwind's `md` breakpoint — below it, the sidebar becomes a
// Sheet/drawer instead of a fixed resizable panel.
const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

// useSyncExternalStore requires the server snapshot to be pre-hydration
// stable, so it renders the desktop layout on the server/first paint and
// switches (without a hydration mismatch) once the client can read
// matchMedia — the same technique as theme-toggle.tsx's mount detection.
function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
