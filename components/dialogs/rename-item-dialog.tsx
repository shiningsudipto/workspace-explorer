"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSystemItem } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";

interface RenameItemDialogProps {
  // The dialog is open exactly when `item` is non-null — avoids a separate
  // `open` flag getting out of sync with which item is being renamed.
  item: FileSystemItem | null;
  onOpenChange: (open: boolean) => void;
}

export function RenameItemDialog({ item, onOpenChange }: RenameItemDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Rename {item?.type === "folder" ? "folder" : "file"}
          </DialogTitle>
        </DialogHeader>
        {/* Only mounted while an item is targeted, so each open starts
            from that item's current name instead of a stale draft. */}
        {item && <RenameItemForm item={item} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function RenameItemForm({
  item,
  onOpenChange,
}: {
  item: FileSystemItem;
  onOpenChange: (open: boolean) => void;
}) {
  const renameItem = useWorkspaceStore((s) => s.renameItem);
  const [name, setName] = useState(item.name);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = renameItem(item.id, name);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rename-item-name">Name</Label>
        <Input
          id="rename-item-name"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
