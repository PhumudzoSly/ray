"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import {
  IssuesGroupedList,
  IssueGroup,
  IssueItem,
} from "@/components/project/issues/issues-grouped-list";

// Use any type for now to avoid type conflicts
type CustomIssue = any;

// Status colors and labels
const statusConfig = {
  BACKLOG: { color: "text-muted-foreground", label: "Backlog" },
  IN_PROGRESS: { color: "text-yellow-500", label: "In Progress" },
  IN_REVIEW: { color: "text-blue-500", label: "Technical Review" },
  DONE: { color: "text-green-500", label: "Completed" },
  BLOCKED: { color: "text-red-500", label: "Blocked" },
  CANCELLED: { color: "text-muted-foreground", label: "Cancelled" },
};

const UpcomingDealines = ({ projectId }: { projectId: string }) => {
  const { data: issues } = useQuery({
    queryKey: ["upcoming-deadlines", projectId],
    queryFn: async () => {
      const res = await issueActions.getUpcomingDeadlines(projectId);
      return res?.data || [];
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();

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

  if (!issues?.length) return null;

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="border border-border p-2">
        <h2 className="text-lg font-semibold">Upcoming deadlines</h2>
        <p className="text-sm text-muted-foreground">
          {issues?.length} issues due in the next 7 days
        </p>
      </div>
      <IssuesGroupedList
        hideAddButton={true}
        groups={groupedIssues}
        onItemClick={handleIssueClick}
      />
    </div>
  );
};

export default UpcomingDealines;
