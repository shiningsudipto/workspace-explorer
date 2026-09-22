"use client";

import { FileText, Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSystemItem } from "@/lib/types";

interface ItemRowProps {
  item: FileSystemItem;
  onOpen: (item: FileSystemItem) => void;
  onRename: (item: FileSystemItem) => void;
  onDelete: (item: FileSystemItem) => void;
}

export function ItemRow({ item, onOpen, onRename, onDelete }: ItemRowProps) {
  const Icon = item.type === "folder" ? Folder : FileText;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{item.name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
              aria-label={`Actions for ${item.name}`}
            />
          }
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRename(item)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
