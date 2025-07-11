"use client";

import { useSearchParams } from "next/navigation";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function IssuesSkeleton() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "list";

  if (view === "kanban") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[350px] flex-shrink-0 flex flex-col gap-3 bg-muted/30 p-3 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-6" />
              </div>

              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="bg-card rounded-lg border p-3 space-y-2"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[80%]" />
                      <Skeleton className="h-3 w-[60%]" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="hidden md:flex items-center px-4 py-2 border-b text-sm text-muted-foreground">
          <div className="flex-1">Title</div>
          <div className="w-28">Status</div>
          <div className="w-28">Priority</div>
          <div className="w-28">Label</div>
          <div className="w-28">Assignee</div>
          <div className="w-28">Due Date</div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row md:items-center px-4 py-3 gap-4 md:gap-0"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-[60%]" />
                <Skeleton className="h-4 w-[80%] md:hidden" />
              </div>
              <div className="grid grid-cols-2 md:flex gap-4 md:gap-0">
                <div className="w-full md:w-28">
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="w-full md:w-28">
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="w-full md:w-28">
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="w-full md:w-28">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="w-full md:w-28">
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
