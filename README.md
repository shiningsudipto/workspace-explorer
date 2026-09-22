# Mini Workspace Explorer

A browser-based file manager built for the Webbly Media frontend developer assessment. Users
can create, navigate, search, edit, rename, and delete folders and text files, entirely
client-side with no backend — all data persists to `localStorage`.

## Features

- Recursive sidebar tree view with expand/collapse, drag-to-resize, and a mobile drawer
- Breadcrumb navigation, folders-first alphabetical sorting
- Create / rename / delete with validation (empty names, case-insensitive duplicates) and
  cascading delete with a nested-item-count confirmation
- Text file editor with an explicit Save action, a dirty/unsaved indicator, and
  autosave-on-navigate-away so edits are never silently lost
- Debounced workspace-wide search (folders and files, by name)
- File download to the local device from the file's action menu
- Light/dark theme toggle
- Responsive layout (resizable split on desktop, a Sheet/drawer sidebar on mobile)

## Getting Started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The workspace comes pre-seeded with an
example folder tree (matching the assessment's example) on first load; after that, everything
you create, rename, or edit persists in your browser's `localStorage`.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project Structure

```
app/
  layout.tsx              Root layout: theme provider, tooltip provider, toast host, hydration
  page.tsx                Top-level layout: desktop resizable split vs. mobile drawer
  globals.css             Tailwind v4 + shadcn theme tokens (light/dark CSS variables)

components/
  sidebar/
    workspace-sidebar.tsx   Sidebar shell: scroll area, expand/collapse state, auto-expand-to-selection
    tree-node.tsx           Recursive folder row (expand chevron, selection highlight, rename/delete menu)
  main-panel/
    main-panel.tsx          Toolbar (breadcrumb, search, theme toggle, New) + folder view / editor switch
    workspace-breadcrumb.tsx
    workspace-search.tsx    Debounced workspace-wide search with a results dropdown
    folder-contents.tsx     Lists a folder's direct children
    item-row.tsx            One file/folder row + its rename/download/delete menu
    file-editor.tsx         Textarea editor: local draft state, dirty tracking, autosave-on-unmount
  dialogs/
    create-item-dialog.tsx  Name + folder/file toggle, validated against the store
    rename-item-dialog.tsx
    delete-item-dialog.tsx  Shows nested-item count for non-empty folders
  theme-provider.tsx / theme-toggle.tsx
  workspace-hydration.tsx   Client-only trigger for localStorage rehydration (see below)
  ui/                       shadcn primitives (button, dialog, dropdown-menu, sheet, resizable, …)

lib/
  types.ts                 FileSystemItem, WorkspaceItems, ROOT_ID, OperationResult
  seed-data.ts              Initial example tree (fixed timestamps, for SSR/hydration consistency)
  id.ts                     generateId()
  workspace-store.ts        Zustand store: state + create/rename/delete/updateFileContent/navigation
  workspace-helpers.ts      Pure selectors: getChildren, getPath, getDescendantIds, isDuplicateName, searchItems
  use-debounced-value.ts / use-is-mobile.ts / download-text-file.ts / utils.ts
```

## State Management

[Zustand](https://github.com/pmndrs/zustand) (`lib/workspace-store.ts`), wrapped in its
`persist` middleware for `localStorage`.

**Why Zustand over Context/Redux:** the app needs one shared, frequently-mutated piece of state
(the whole file tree) read from many unrelated components (sidebar, breadcrumb, main panel,
search, dialogs). Context would re-render every consumer on every keystroke-driven update unless
carefully split and memoized; Zustand's selector-based subscriptions (`useWorkspaceStore(s =>
s.items)`) let each component subscribe to only the slice it needs, with no provider tree to
wire up. It also ships a `persist` middleware that handles the localStorage read/write/versioning
boilerplate directly, which would otherwise be hand-rolled with Context.

**Persistence details:** only `items` and `selectedFolderId` are persisted (via `partialize`);
`selectedFileId` is intentionally left as runtime-only state, so reloading the app never
re-opens whatever file happened to be open. Rehydration is manual (`skipHydration: true` +
`rehydrateWorkspaceStore()` called from a client-only `WorkspaceHydration` component) because the
store module is imported by the server-rendered root layout, where `localStorage` doesn't exist.
A `hasHydrated` flag gates the initial render so there's no flash of pre-hydration seed data.

## File-System Data Structure

A **flat map keyed by id** (`Record<string, FileSystemItem>`), not a nested tree of objects:

```ts
interface FileSystemItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;       // files only
  createdAt: number;
  updatedAt: number;
}
```

A single fixed root (`ROOT_ID = "root"`, `parentId: null`, named "Workspace") is the top of the
tree, so breadcrumb/path logic never needs a special case for "no parent."

**Why flat, not nested:** with nested objects (each folder holding a `children` array), renaming
or deleting a deeply nested item means finding it by walking the tree, then reconstructing every
ancestor object on the path back to the root to keep the update immutable — awkward and easy to
get subtly wrong. With a flat map, every operation is a single `id` lookup: rename is
`{ ...items, [id]: { ...items[id], name } }`; cascading delete is "collect this id and its
descendant ids, then delete those keys." The tree/children view is never stored — it's derived on
demand via `getChildren(items, folderId)` (`lib/workspace-helpers.ts`), so there's no separate
"children array" that could ever drift out of sync with the `parentId` fields.

## Notable Implementation Decisions

- **Duplicate/empty-name validation** lives in the store (`createItem`/`renameItem`), not the
  dialogs, so it can't be bypassed by a future second entry point. Duplicate checks are
  case-insensitive (`"Notes.txt"` and `"notes.txt"` conflict) — chosen because most real
  filesystems users are used to (Windows, macOS) are case-insensitive too, and allowing
  case-only duplicates side by side is more likely to be a mistake than an intent.
- **Sort order** everywhere (sidebar, main panel) is folders-first, then alphabetical,
  case-insensitive — an explicit, consistent rule rather than insertion order or per-view
  differences.
- **Cascading delete** shows the exact nested-item count before confirming
  (`getDescendantIds`), and **selection recovery** walks up `parentId` until it finds a
  surviving ancestor (or the root) if the deleted item was, or contained, whatever was currently
  selected/open. This is store-level logic (unit-verified early on), but it's only reachable
  through the UI from the **sidebar's** own rename/delete menu — the main panel's row actions
  alone can never trigger it, because deleting an item there always requires first navigating to
  its *parent*, which already changes the selection away from that item before the delete can
  fire. The sidebar stays visible and expanded to the current selection regardless of what the
  main panel is browsing, so it's the only place you can delete a folder you're *currently
  inside*. (This gap was found and closed by testing the edge case directly, not assumed away.)
- **Unsaved file changes: autosave-on-navigate-away**, not a blocking "discard changes?"
  dialog. Navigation that would leave the editor can originate from three independent places
  (sidebar, breadcrumb, a main-panel row/search result); centralizing a confirmation guard across
  all of them added real complexity for little benefit here. Instead, the editor flushes its
  dirty draft to the store when it unmounts — and every navigation path already closes the editor
  by clearing `selectedFileId`, so "unmount" is a single, reliable point to hook. The explicit
  Save button plus a visible "Unsaved changes" badge cover the common case; autosave is the
  safety net for the rest. Tradeoff: there's no way to deliberately discard an edit by navigating
  away — accepted, since silently losing typed text felt like the worse failure mode for a
  simple text file manager.
- **Search** (`searchItems`) is a case-insensitive substring match over the *entire* flat map,
  not just the current folder, debounced at 200ms. Results show name, type icon, and full path;
  selecting a file result navigates to its parent folder and opens it in one step.
- **Responsive layout**: the sidebar is a resizable panel on desktop
  (`react-resizable-panels`) and a `Sheet` drawer below the `md` breakpoint (a
  `useSyncExternalStore`-based `useIsMobile` hook keeps the initial SSR render on the desktop
  layout to avoid a hydration mismatch). Selecting a folder from the mobile drawer closes it
  automatically.
- **Root folder** ("Workspace") can't be renamed or deleted — it has no actions menu at all in
  the sidebar, rather than showing actions that would always fail.

## Known, Deliberate Constraints

- The main panel's row menu can't delete the folder currently being browsed (see above) — use
  the sidebar for that. This follows directly from "you delete an item from its parent's
  listing," which is how most file managers work.
- Persistence is `localStorage` only — clearing site data or using a different browser/device
  starts from the seed data again. No account system or backend was in scope.
