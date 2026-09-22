"use client";

import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getPath } from "@/lib/workspace-helpers";
import { useWorkspaceStore } from "@/lib/workspace-store";

export function WorkspaceBreadcrumb() {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const selectedFileId = useWorkspaceStore((s) => s.selectedFileId);
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId);

  const path = getPath(items, selectedFolderId);
  // While a file is open, it gets its own trailing (non-clickable) segment,
  // so every folder segment before it becomes a clickable link.
  const openFileName = selectedFileId ? items[selectedFileId]?.name : undefined;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        {path.map((folder, index) => {
          const isLastFolder = index === path.length - 1;
          const isLast = isLastFolder && !openFileName;
          return (
            <Fragment key={folder.id}>
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate">
                    {folder.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <button
                        type="button"
                        onClick={() => setSelectedFolderId(folder.id)}
                      />
                    }
                    className="truncate"
                  >
                    {folder.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {(!isLastFolder || openFileName) && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
        {openFileName && (
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{openFileName}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
