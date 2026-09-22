"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSystemItem } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  parentId,
}: CreateItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>
            Create a new folder or text file in the current folder.
          </DialogDescription>
        </DialogHeader>
        {/* Only mounted while open, so each open starts from a clean
            default instead of the previous attempt's name/error/type. */}
        {open && (
          <CreateItemForm parentId={parentId} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateItemForm({
  parentId,
  onOpenChange,
}: {
  parentId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const createItem = useWorkspaceStore((s) => s.createItem);
  const [type, setType] = useState<FileSystemItem["type"]>("folder");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createItem(parentId, name, type);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2" role="radiogroup" aria-label="Item type">
        <Button
          type="button"
          variant={type === "folder" ? "secondary" : "outline"}
          aria-pressed={type === "folder"}
          onClick={() => setType("folder")}
          className="flex-1"
        >
          Folder
        </Button>
        <Button
          type="button"
          variant={type === "file" ? "secondary" : "outline"}
          aria-pressed={type === "file"}
          onClick={() => setType("file")}
          className="flex-1"
        >
          Text file
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-item-name">Name</Label>
        <Input
          id="create-item-name"
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
        <Button type="submit">Create</Button>
      </DialogFooter>
    </form>
  );
}
