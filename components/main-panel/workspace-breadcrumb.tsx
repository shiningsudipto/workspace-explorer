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
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId);

  const path = getPath(items, selectedFolderId);

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        {path.map((folder, index) => {
          const isLast = index === path.length - 1;
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
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
