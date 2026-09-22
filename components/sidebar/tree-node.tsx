"use client";

import { ChevronRight, Folder, FolderOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FileSystemItem, ROOT_ID, WorkspaceItems } from "@/lib/types";
import { getChildren } from "@/lib/workspace-helpers";

interface TreeNodeProps {
  folderId: string;
  depth: number;
  items: WorkspaceItems;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  selectedFolderId: string;
  onSelect: (id: string) => void;
  onRename: (item: FileSystemItem) => void;
  onDelete: (item: FileSystemItem) => void;
}

// Sidebar shows folders only (files live in the main panel) — matches the
// instructions' example, which lists only folders under "Sidebar - Tree View".
export function TreeNode({
  folderId,
  depth,
  items,
  expandedIds,
  onToggleExpand,
  selectedFolderId,
  onSelect,
  onRename,
  onDelete,
}: TreeNodeProps) {
  const folder = items[folderId];
  if (!folder) return null;

  const childFolders = getChildren(items, folderId).filter(
    (item) => item.type === "folder"
  );
  const isExpanded = expandedIds.has(folderId);
  const isSelected = folderId === selectedFolderId;
  const hasChildren = childFolders.length > 0;
  // The root ("Workspace") is the fixed container — it can't be renamed or
  // deleted, so it gets no actions menu at all (the store also guards
  // against deleting it, but this avoids showing an action that would
  // always fail for rename).
  const isRoot = folderId === ROOT_ID;

  return (
    <div>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        tabIndex={0}
        onClick={() => onSelect(folderId)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(folderId);
          }
        }}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-md py-1.5 pr-1 text-sm select-none outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(folderId);
          }}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-muted",
            !hasChildren && "invisible"
          )}
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          tabIndex={hasChildren ? 0 : -1}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </button>
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
        {!isRoot && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
                  aria-label={`Actions for ${folder.name}`}
                />
              }
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            {/* See ItemRow for why DropdownMenuContent also needs its own
                stopPropagation — portal clicks still bubble through the
                React tree into this row's onClick otherwise. */}
            <DropdownMenuContent
              align="end"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => onRename(folder)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(folder)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div role="group">
          {childFolders.map((child) => (
            <TreeNode
              key={child.id}
              folderId={child.id}
              depth={depth + 1}
              items={items}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
