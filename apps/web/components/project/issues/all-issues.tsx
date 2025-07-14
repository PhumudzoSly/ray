"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IssuesFilters } from "./issue-filters";
import { Button } from "@workspace/ui/components/button";
import { LayoutGrid, List } from "lucide-react";
import React from "react";
import { IssuesKanban } from "@/components/project/issues/issue-kanbab";
import {
  IssuesGroupedList,
  IssueGroup,
  IssueItem,
} from "./issues-grouped-list";

// Use any type for now to avoid type conflicts
type CustomIssue = any;

type ViewMode = "list" | "kanban";

// Status colors and labels
const statusConfig = {
  BACKLOG: { color: "#64748b", label: "Backlog" },
  IN_PROGRESS: { color: "#3b82f6", label: "In Progress" },
  REVIEW: { color: "#f59e0b", label: "Review" },
  DONE: { color: "#10b981", label: "Done" },
  BLOCKED: { color: "#ef4444", label: "Blocked" },
  CANCELLED: { color: "#6b7280", label: "Cancelled" },
};

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

  // Group issues by status
  const groupedIssues = React.useMemo(() => {
    const groups: IssueGroup[] = [];

    // Group issues by status
    const issuesByStatus = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.status]) {
          acc[issue.status] = [];
        }
        acc[issue.status].push(issue);
        return acc;
      },
      {} as Record<string, CustomIssue[]>
    );

    // Create groups in a specific order
    const statusOrder: (keyof typeof statusConfig)[] = [
      "BACKLOG",
      "IN_PROGRESS",
      "REVIEW",
      "BLOCKED",
      "DONE",
      "CANCELLED",
    ];

    statusOrder.forEach((status) => {
      const statusIssues = issuesByStatus[status] || [];
      if (statusIssues.length > 0) {
        const items: IssueItem[] = statusIssues.map((issue: any) => ({
          _id: issue._id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          label: issue.label,
          dueDate: issue.dueDate,
          assignedTo: issue.assignedTo,
          project: issue.project,
        }));

        groups.push({
          id: status,
          title: statusConfig[status].label,
          color: statusConfig[status].color,
          items,
          count: statusIssues.length,
        });
      }
    });

    return groups;
  }, [issues]);

  const handleIssueClick = (item: IssueItem) => {
    router.push(`/issues/${item._id}`);
  };

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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 p-2 bg-background z-50 border-b sticky top-[50px]">
        <IssuesFilters />
        <div className="flex items-center gap-2">
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

      {viewMode === "kanban" ? (
        <div>
          <IssuesKanban issues={issues} showProject={true} />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="w-full">
            <IssuesGroupedList
              groups={groupedIssues}
              onItemClick={handleIssueClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllIssues;
