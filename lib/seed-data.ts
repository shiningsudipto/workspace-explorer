import { FileSystemItem, ROOT_ID, WorkspaceItems } from "./types";

// Fixed timestamp so server and client renders match before persisted
// state (Phase 2) hydrates from localStorage.
const SEED_TIMESTAMP = new Date("2026-01-01T00:00:00.000Z").getTime();

function makeItem(
  id: string,
  name: string,
  type: FileSystemItem["type"],
  parentId: string | null,
  content?: string
): FileSystemItem {
  return {
    id,
    name,
    type,
    parentId,
    ...(type === "file" ? { content: content ?? "" } : {}),
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  };
}

/**
 * Seed dataset matching the example tree from instructions.md:
 *
 * Workspace
 * ├── Projects
 * │   ├── Webbly
 * │   │   ├── notes.txt
 * │   │   └── tasks.txt
 * │   └── Personal
 * ├── Documents
 * └── README.txt
 */
export function createSeedData(): WorkspaceItems {
  const items: FileSystemItem[] = [
    makeItem(ROOT_ID, "Workspace", "folder", null),
    makeItem("projects", "Projects", "folder", ROOT_ID),
    makeItem("webbly", "Webbly", "folder", "projects"),
    makeItem(
      "notes-txt",
      "notes.txt",
      "file",
      "webbly",
      "Notes for the Webbly project.\n"
    ),
    makeItem(
      "tasks-txt",
      "tasks.txt",
      "file",
      "webbly",
      "- [ ] Task 1\n- [ ] Task 2\n"
    ),
    makeItem("personal", "Personal", "folder", "projects"),
    makeItem("documents", "Documents", "folder", ROOT_ID),
    makeItem(
      "readme-txt",
      "README.txt",
      "file",
      ROOT_ID,
      "Welcome to the Mini Workspace Explorer.\n"
    ),
  ];

  return Object.fromEntries(items.map((i) => [i.id, i]));
}
