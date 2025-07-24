"use client";

import React, { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import {
  Plus,
  CircleDot,
  Circle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { IssueLabelField } from "@/components/ui/issue-fields/issue-label-field";
import { AssigneeSelector } from "@/components/ui/selectors/assignee-selector";
import { StatusSelector } from "@/components/ui/selectors/status-selector";
import { NewIssue } from "./new-issue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as issueActions from "@/actions/issue";
import { useSession } from "@/context/session-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  IssueLabel,
  IssueStatus,
} from "@workspace/backend/prisma/generated/client/client";
import { DateSelector } from "@/components/ui/selectors";

interface IssueItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  label: string;
  dueDate?: string;
  assignedTo?: any;
  project?: {
    id: string;
    name: string;
  };
}

interface IssueGroup {
  id: string;
  title: string;
  color: string;
  items: IssueItem[];
  count: number;
}

interface IssuesGroupedListProps {
  groups: IssueGroup[];
  onItemClick?: (item: IssueItem) => void;
  className?: string;
  hideAddButton?: boolean;
}

const statusConfig = {
  BACKLOG: {
    icon: Circle,
    label: "Backlog",
    iconColor: "text-muted-foreground",
    background: "bg-muted-foreground/5",
  },
  IN_PROGRESS: {
    icon: CircleDot,
    label: "In Progress",
    iconColor: "text-yellow-500",
    background: "bg-yellow-500/5",
  },
  IN_REVIEW: {
    icon: AlertCircle,
    label: "Technical Review",
    iconColor: "text-blue-500",
    background: "bg-blue-500/5",
  },
  DONE: {
    icon: CheckCircle2,
    label: "Completed",
    iconColor: "text-green-500",
    background: "bg-green-500/5",
  },
  BLOCKED: {
    icon: XCircle,
    label: "Blocked",
    iconColor: "text-red-500",
    background: "bg-red-500/5",
  },
  CANCELLED: {
    icon: XCircle,
    label: "Cancelled",
    iconColor: "text-muted-foreground",
    background: "bg-muted-500/5",
  },
};

function IssueItemComponent({
  item,
  onItemClick,
  className,
  hideAddButton = false,
}: {
  item: IssueItem;
  onItemClick?: (item: IssueItem) => void;
  className?: string;
  hideAddButton?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Optimistic update mutation for issue
  const updateIssueMutation = useMutation({
    mutationFn: async ({
      issueId,
      updates,
    }: {
      issueId: string;
      updates: any;
    }) => {
      return await issueActions.updateIssue(issueId, updates);
    },
    onMutate: async ({ issueId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      await queryClient.cancelQueries({ queryKey: ["issues-grouped"] });

      // Snapshot the previous value
      const previousIssues = queryClient.getQueryData(["issues"]);
      const previousGroupedIssues = queryClient.getQueryData([
        "issues-grouped",
      ]);

      // Set loading state
      setIsUpdating(issueId);

      // Optimistically update the grouped issues structure
      queryClient.setQueryData(
        ["issues-grouped"],
        (old: IssueGroup[] | undefined) => {
          if (!old) return old;
          return old.map((group) => ({
            ...group,
            items: group.items.map((issue) =>
              issue.id === issueId ? { ...issue, ...updates } : issue
            ),
            count: group.items.length, // Recalculate count if needed
          }));
        }
      );

      // Also update the flat issues array if it exists
      queryClient.setQueryData(["issues"], (old: IssueItem[] | undefined) => {
        if (!old) return old;
        return old.map((issue) =>
          issue.id === issueId ? { ...issue, ...updates } : issue
        );
      });

      return { previousIssues, previousGroupedIssues };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      if (context?.previousGroupedIssues) {
        queryClient.setQueryData(
          ["issues-grouped"],
          context.previousGroupedIssues
        );
      }
      setIsUpdating(null);

      console.error("Failed to update issue:", err);
      toast.error("Failed to update issue");
    },
    onSuccess: (data, variables) => {
      // Clear loading state
      setIsUpdating(null);

      // Show success message
      toast.success("Issue updated successfully");

      // Refresh the route to get the latest data
      router.refresh();

      // Invalidate and refetch issues
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues-grouped"] });
    },
    onSettled: () => {
      // Always clear loading state
      setIsUpdating(null);
    },
  });

  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      await updateIssueMutation.mutateAsync({
        issueId: item.id,
        updates: {
          priority: priority as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        },
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Priority update failed:", error);
    }
  };

  const handleStatusChange = async (status: IssueStatus) => {
    try {
      await updateIssueMutation.mutateAsync({
        issueId: item.id,
        updates: {
          status: status as
            | "BACKLOG"
            | "IN_PROGRESS"
            | "IN_REVIEW"
            | "DONE"
            | "BLOCKED"
            | "CANCELLED",
        },
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Status update failed:", error);
    }
  };

  const handleAssigneeChange = async (assignee: any) => {
    try {
      await updateIssueMutation.mutateAsync({
        issueId: item.id,
        updates: {
          assignedToId: assignee,
        },
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Assignee update failed:", error);
    }
  };

  const handleDateChange = async (date: Date | null) => {
    try {
      await updateIssueMutation.mutateAsync({
        issueId: item.id,
        updates: { dueDate: date ? date.toISOString() : null },
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Date update failed:", error);
    }
  };

  return (
    <div
      className={cn(
        "group flex justify-between overflow-x-auto w-full items-center gap-3 py-2 px-3 hover:bg-accent/50 cursor-pointer transition-colors duration-150",
        isUpdating === item.id && "opacity-50 pointer-events-none",
        className
      )}
      onClick={() => onItemClick?.(item)}
    >
      <div className="flex items-center gap-2">
        <div onClick={handleInteractiveClick}>
          <PrioritySelector
            onChange={handlePriorityChange}
            iconOnly={true}
            priority={item.priority}
          />
        </div>

        {/* Issue ID */}
        <div className="hidden md:block text-sm text-muted-foreground font-medium min-w-[80px]">
          {item.id.slice(-6).toUpperCase()}
        </div>
        <div onClick={handleInteractiveClick}>
          <StatusSelector
            onChange={handleStatusChange}
            iconOnly
            status={item.status as IssueStatus}
          />
        </div>
        <div className="flex-1 min-w-0 max-w-lg">
          <span className="text-sm whitespace-nowrap font-medium text-foreground truncate block">
            {item.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={handleInteractiveClick}>
        <Badge variant="neutral">{item.project?.name}</Badge>
        <DateSelector
          onChange={(date) => handleDateChange(date)}
          value={item.dueDate ? new Date(item.dueDate) : null}
        />
        <IssueLabelField issueId={item.id} value={item?.label as IssueLabel} />
        <AssigneeSelector
          onChange={handleAssigneeChange}
          assignee={item.assignedTo}
          iconOnly
        />
      </div>
    </div>
  );
}

function IssueGroupComponent({
  group,
  onItemClick,
  className,
  hideAddButton = false,
}: {
  group: IssueGroup;
  onItemClick?: (item: IssueItem) => void;
  className?: string;
  hideAddButton?: boolean;
}) {
  const statusInfo = statusConfig[group.id as keyof typeof statusConfig] || {
    icon: Circle,
    label: group.title,
    iconColor: "text-muted-foreground",
  };

  const StatusIcon = statusInfo.icon;

  return (
    <div className={cn("border-t overflow-x-auto", className)}>
      {/* Linear-style group header */}
      <div
        className={cn(
          "sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b py-3 px-3",
          statusInfo.background
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", statusInfo.iconColor)} />
            <span className="text-sm font-medium text-foreground">
              {statusInfo.label}
            </span>
            <Badge variant="secondary" className="text-xs">
              {group.count}
            </Badge>
          </div>
          {!hideAddButton && (
            <NewIssue size="sm" defaultStatus={group.id as IssueStatus} />
          )}
        </div>
      </div>

      {/* Issues list */}
      <div className="w-full overflow-x-auto">
        <div className="space-y-0 min-w-max">
          {group.items.map((item) => (
            <IssueItemComponent
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              hideAddButton={hideAddButton}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function IssuesGroupedList({
  groups,
  onItemClick,
  className,
  hideAddButton = false,
}: IssuesGroupedListProps) {
  return (
    <div className={cn(className, "overflow-x-auto")}>
      {groups.map((group) => (
        <IssueGroupComponent
          key={group.id}
          group={group}
          onItemClick={onItemClick}
          hideAddButton={hideAddButton}
        />
      ))}
    </div>
  );
}

export type { IssueItem, IssueGroup };
