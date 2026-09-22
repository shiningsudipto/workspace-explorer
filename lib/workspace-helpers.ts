import { FileSystemItem, ROOT_ID, WorkspaceItems } from "./types";

/**
 * Direct children of a folder, sorted folders-first then alphabetically
 * (case-insensitive) — the explicit sort rule shared by the sidebar tree
 * and the main panel.
 */
export function getChildren(
  items: WorkspaceItems,
  folderId: string
): FileSystemItem[] {
  return Object.values(items)
    .filter((item) => item.parentId === folderId)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}

/** Items from the root folder down to `id`, inclusive — feeds the breadcrumb. */
export function getPath(items: WorkspaceItems, id: string): FileSystemItem[] {
  const path: FileSystemItem[] = [];
  let current: string | null = id;
  while (current) {
    const item: FileSystemItem | undefined = items[current];
    if (!item) break;
    path.unshift(item);
    current = item.parentId;
  }
  return path;
}

/** All descendant ids of a folder, not including the folder itself. */
export function getDescendantIds(
  items: WorkspaceItems,
  id: string
): string[] {
  const descendants: string[] = [];
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const item of Object.values(items)) {
      if (item.parentId === current) {
        descendants.push(item.id);
        stack.push(item.id);
      }
    }
  }
  return descendants;
}

/** Case-insensitive sibling name collision check, for create/rename validation. */
export function isDuplicateName(
  items: WorkspaceItems,
  parentId: string,
  name: string,
  excludeId?: string
): boolean {
  const normalized = name.trim().toLowerCase();
  return Object.values(items).some(
    (item) =>
      item.parentId === parentId &&
      item.id !== excludeId &&
      item.name.toLowerCase() === normalized
  );
}

export interface SearchResult {
  item: FileSystemItem;
  path: FileSystemItem[];
}

/**
 * Case-insensitive substring match over item names, across the entire
 * workspace (not just the current folder). The root folder itself is
 * excluded since it isn't a meaningful, navigable search result.
 */
export function searchItems(
  items: WorkspaceItems,
  query: string
): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return Object.values(items)
    .filter(
      (item) => item.id !== ROOT_ID && item.name.toLowerCase().includes(normalized)
    )
    .map((item) => ({
      item,
      path: getPath(items, item.parentId ?? ROOT_ID),
    }));
}
