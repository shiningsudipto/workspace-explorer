"use client";

import { useState } from "react";
import { FileText, Folder, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { ROOT_ID } from "@/lib/types";
import { searchItems, SearchResult } from "@/lib/workspace-helpers";
import { useWorkspaceStore } from "@/lib/workspace-store";

export function WorkspaceSearch() {
  const items = useWorkspaceStore((s) => s.items);
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId);
  const setSelectedFileId = useWorkspaceStore((s) => s.setSelectedFileId);

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // Debounced so fast typing doesn't re-filter the whole workspace on
  // every keystroke.
  const debouncedQuery = useDebouncedValue(query, 200);

  const trimmed = debouncedQuery.trim();
  const results: SearchResult[] = trimmed ? searchItems(items, trimmed) : [];
  const showDropdown = isFocused && trimmed.length > 0;

  const handleSelect = (result: SearchResult) => {
    if (result.item.type === "folder") {
      setSelectedFolderId(result.item.id);
    } else {
      // Non-root items always have a parentId.
      setSelectedFolderId(result.item.parentId ?? ROOT_ID);
      setSelectedFileId(result.item.id);
    }
    setQuery("");
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-xs">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Delay so a click on a result registers before the list unmounts.
          setTimeout(() => setIsFocused(false), 150);
        }}
        placeholder="Search files and folders…"
        className="pl-8"
        aria-label="Search workspace"
      />
      {showDropdown && (
        <div className="absolute top-full z-40 mt-1 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
          {results.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {results.map((result) => {
                const Icon = result.item.type === "folder" ? Folder : FileText;
                const fullPath = [...result.path, result.item]
                  .map((i) => i.name)
                  .join(" / ");
                return (
                  <li key={result.item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(result)}
                      className="flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {result.item.name}
                      </span>
                      <span className="w-full truncate text-xs text-muted-foreground">
                        {fullPath}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
