"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IssuesFilters } from "./issue-filters";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, List } from "lucide-react";
import React from "react";
import { IssuesKanban } from "@/components/project/issues/issue-kanbab";
import { IssueCard } from "@/components/project/issues/issue-card";
import { CustomIssue } from "@/types/project";
import { Separator } from "@workspace/ui/components/separator";

type ViewMode = "list" | "kanban";

const AllIssues = ({ issues }: { issues: CustomIssue[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  if (!issues.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-semibold">No issues found</h2>
          <p className="text-muted-foreground">
            Get started by creating your first issue. Issues help you track
            tasks, bugs, and feature requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-2">
        <IssuesFilters />
        <div className="flex items-center gap-2 ">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />

      {viewMode === "kanban" ? (
        <div className="p-2">
          <IssuesKanban issues={issues} showProject={true} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[100px]">Label</TableHead>
                  <TableHead className="w-[100px]">Assigned</TableHead>
                  <TableHead className="w-[100px] whitespace-nowrap">
                    Due Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue, index) => (
                  <IssueCard
                    index={index + 1}
                    key={issue?._id}
                    issue={issue}
                    showProject={true}
                  />
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" className="h-3" />
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default AllIssues;
