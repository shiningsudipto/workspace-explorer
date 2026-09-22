"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileSystemItem } from "@/lib/types";
import { getDescendantIds } from "@/lib/workspace-helpers";
import { useWorkspaceStore } from "@/lib/workspace-store";

interface DeleteItemDialogProps {
  // The dialog is open exactly when `item` is non-null.
  item: FileSystemItem | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteItemDialog({ item, onOpenChange }: DeleteItemDialogProps) {
  const items = useWorkspaceStore((s) => s.items);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const descendantCount = item ? getDescendantIds(items, item.id).length : 0;

  const handleConfirm = () => {
    if (!item) return;
    deleteItem(item.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{item?.name}&quot;?</DialogTitle>
          <DialogDescription>
            {descendantCount > 0
              ? `This will also delete ${descendantCount} nested item${
                  descendantCount === 1 ? "" : "s"
                } inside it. This can't be undone.`
              : "This can't be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
