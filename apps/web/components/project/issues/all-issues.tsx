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
import { useQuery } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";

// Use any type for now to avoid type conflicts
type CustomIssue = any;

type ViewMode = "list" | "kanban";

// Status colors and labels
const statusConfig = {
  BACKLOG: { color: "text-muted-foreground", label: "Backlog" },
  IN_PROGRESS: { color: "text-yellow-500", label: "In Progress" },
  IN_REVIEW: { color: "text-blue-500", label: "Technical Review" },
  DONE: { color: "text-green-500", label: "Completed" },
  BLOCKED: { color: "text-red-500", label: "Blocked" },
  CANCELLED: { color: "text-muted-foreground", label: "Cancelled" },
};

const AllIssues = () => {
  const { data: issues, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const res = await issueActions.getAllIssues();
      return res?.data || [];
    },
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  // Client-side filtering logic
  const filteredIssues = React.useMemo(() => {
    let filtered = [...(issues || [])];

    // Filter by search query
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title?.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query) ||
          issue.status?.toLowerCase().includes(query) ||
          issue.priority?.toLowerCase().includes(query) ||
          issue.label?.toLowerCase().includes(query) ||
          issue.assignedTo?.name?.toLowerCase().includes(query) ||
          issue.project?.name?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    const statusFilter = searchParams.get("status");
    if (statusFilter) {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    // Filter by priority
    const priorityFilter = searchParams.get("priority");
    if (priorityFilter) {
      filtered = filtered.filter((issue) => issue.priority === priorityFilter);
    }

    // Filter by label
    const labelFilter = searchParams.get("label");
    if (labelFilter) {
      filtered = filtered.filter((issue) => issue.label === labelFilter);
    }

    // Filter by assignee
    const assigneeFilter = searchParams.get("assignee");
    if (assigneeFilter) {
      if (assigneeFilter === "unassigned") {
        filtered = filtered.filter((issue) => !issue.assignedTo);
      } else {
        filtered = filtered.filter(
          (issue) => issue.assignedTo?.id === assigneeFilter
        );
      }
    }

    // Filter by due date
    const dueDateFilter = searchParams.get("dueDate");
    if (dueDateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      );

      filtered = filtered.filter((issue) => {
        if (!issue.dueDate) {
          return dueDateFilter === "noDate";
        }

        const dueDate = new Date(issue.dueDate);

        switch (dueDateFilter) {
          case "overdue":
            return dueDate < today;
          case "thisWeek":
            return dueDate >= today && dueDate < nextWeek;
          case "nextWeek":
            return (
              dueDate >= nextWeek &&
              dueDate < new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
            );
          case "thisMonth":
            return dueDate >= today && dueDate < nextMonth;
          case "noDate":
            return false;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [issues, searchParams]);

  // Group issues by status
  const groupedIssues = React.useMemo(() => {
    const groups: IssueGroup[] = [];

    // Group issues by status
    const issuesByStatus = filteredIssues.reduce(
      (acc, issue) => {
        if (!acc[issue.status]) {
          acc[issue.status] = [];
        }
        acc[issue?.status || "BACKLOG"]?.push(issue);
        return acc;
      },
      {} as Record<string, CustomIssue[]>
    );

    // Create groups in a specific order
    const statusOrder: (keyof typeof statusConfig)[] = [
      "BACKLOG",
      "IN_PROGRESS",
      "IN_REVIEW",
      "BLOCKED",
      "DONE",
      "CANCELLED",
    ];

    statusOrder.forEach((status) => {
      const statusIssues = issuesByStatus[status] || [];
      if (statusIssues.length > 0) {
        const items: IssueItem[] = statusIssues.map((issue: any) => ({
          id: issue.id,
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
  }, [filteredIssues]);

  const handleIssueClick = (item: IssueItem) => {
    router.push(`/issues/${item.id}`);
  };

  // Show filtered results message if filters are applied
  const hasActiveFilters = searchParams.toString().length > 0;
  const filteredCount = filteredIssues.length;
  const totalCount = issues?.length;

  if (!issues?.length) {
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

  // Show no results message when filters are applied but no issues match
  if (hasActiveFilters && filteredIssues.length === 0) {
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

        {/* Filter results indicator */}
        <div className="px-4 py-2 bg-muted/50 border-b">
          <p className="text-sm text-muted-foreground">
            Showing 0 of {totalCount} issues
            {searchParams.get("search") && (
              <span> matching "{searchParams.get("search")}"</span>
            )}
          </p>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-semibold">
              No issues match your filters
            </h2>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing some filters to see
              more results.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                router.push(pathname);
              }}
            >
              Clear all filters
            </Button>
          </div>
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

      {/* Filter results indicator */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-muted/50 border-b">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} issues
            {searchParams.get("search") && (
              <span> matching "{searchParams.get("search")}"</span>
            )}
          </p>
        </div>
      )}

      {viewMode === "kanban" ? (
        <div>
          <IssuesKanban issues={filteredIssues} showProject={true} />
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
