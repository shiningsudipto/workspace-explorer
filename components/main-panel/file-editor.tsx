"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileSystemItem } from "@/lib/types";
import { useWorkspaceStore } from "@/lib/workspace-store";

interface FileEditorProps {
  file: FileSystemItem;
}

// Mounted keyed by file.id (see MainPanel) so switching files always
// unmounts/remounts this component rather than reusing the instance.
export function FileEditor({ file }: FileEditorProps) {
  const updateFileContent = useWorkspaceStore((s) => s.updateFileContent);
  const [draft, setDraft] = useState(file.content ?? "");
  const isDirty = draft !== (file.content ?? "");

  // Refs so the mount-once unmount effect below always sees the latest
  // draft/dirty state without needing to re-run (and re-register its
  // cleanup) on every keystroke.
  const draftRef = useRef(draft);
  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    draftRef.current = draft;
    isDirtyRef.current = isDirty;
  });

  useEffect(() => {
    return () => {
      // Autosave-on-navigate-away: this editor is about to unmount because
      // the user navigated elsewhere (sidebar, breadcrumb, another file).
      // Flushing any unsaved draft here means navigating away never
      // silently discards edits, without needing every navigation call
      // site (spread across several components) to know about dirty state.
      if (isDirtyRef.current) {
        useWorkspaceStore.getState().updateFileContent(file.id, draftRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    updateFileContent(file.id, draft);
  };

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{file.name}</span>
          {isDirty && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              Unsaved changes
            </span>
          )}
        </div>
        <Button size="sm" onClick={handleSave} disabled={!isDirty}>
          Save
        </Button>
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-full flex-1 resize-none field-sizing-fixed font-mono text-sm"
        spellCheck={false}
        aria-label={`Editing ${file.name}`}
      />
    </div>
  );
}
