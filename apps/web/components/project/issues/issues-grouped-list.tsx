"use client";

import React from "react";
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
  REVIEW: {
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
}: {
  item: IssueItem;
  onItemClick?: (item: IssueItem) => void;
  className?: string;
}) {
  //
  const queryClient = useQueryClient();

  // Optimistic update mutation for issue
  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, updates }: { issueId: string; updates: any }) => {
      // Call the server action
      return await issueActions.updateIssue(issueId, updates);
    },
    // Optimistic update
    onMutate: async ({ issueId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });
      const previousIssues = queryClient.getQueryData<IssueItem[]>(["issues"]);
      queryClient.setQueryData<IssueItem[]>(["issues"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === issueId ? { ...i, ...updates } : i
        );
      });
      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues"], context.previousIssues);
      }
      toast.error("Failed to update issue");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "group flex justify-between w-full items-center gap-3 py-2 px-3 hover:bg-accent/50 cursor-pointer transition-colors duration-150",
        className
      )}
      onClick={() => onItemClick?.(item)}
    >
      <div className="flex items-center gap-2">
        <div onClick={handleInteractiveClick}>
          <PrioritySelector
            onChange={async (e) => {
              updateIssueMutation.mutate({
                issueId: item.id,
                updates: {
                  priority: e as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
                },
              });
            }}
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
            onChange={async (e) => {
              updateIssueMutation.mutate({
                issueId: item.id,
                updates: {
                  status: e as
                    | "BACKLOG"
                    | "IN_PROGRESS"
                    | "REVIEW"
                    | "DONE"
                    | "BLOCKED"
                    | "CANCELLED",
                },
              });
            }}
            iconOnly
            status={item.status}
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
        <IssueLabelField issueId={item.id} value={item?.label} />
        <AssigneeSelector
          onChange={async (e) => {
            updateIssueMutation.mutate({
              issueId: item.id,
              updates: {
                assignedTo: e as any,
              },
            });
          }}
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
}: {
  group: IssueGroup;
  onItemClick?: (item: IssueItem) => void;
  className?: string;
}) {
  const statusInfo = statusConfig[group.id as keyof typeof statusConfig] || {
    icon: Circle,
    label: group.title,
    iconColor: "text-muted-foreground",
  };

  const StatusIcon = statusInfo.icon;

  return (
    <div className={cn("border-t", className)}>
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
          <NewIssue size="sm" defaultStatus={group.id} />
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
}: IssuesGroupedListProps) {
  return (
    <div className={cn(className)}>
      {groups.map((group) => (
        <IssueGroupComponent
          key={group.id}
          group={group}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}

export type { IssueItem, IssueGroup };
