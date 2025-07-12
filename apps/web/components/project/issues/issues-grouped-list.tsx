"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import {
  Calendar,
  Plus,
  MoreHorizontal,
  CircleDot,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";

interface IssueItem {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  label: string;
  dueDate?: string;
  assignedTo?: any;
  project?: {
    _id: string;
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

// Linear's actual status icons using shadcn colors
const statusConfig = {
  BACKLOG: {
    icon: Circle,
    label: "Backlog",
    iconColor: "text-muted-foreground",
  },
  IN_PROGRESS: {
    icon: CircleDot,
    label: "In Progress",
    iconColor: "text-yellow-500",
  },
  REVIEW: {
    icon: AlertCircle,
    label: "Technical Review",
    iconColor: "text-blue-500",
  },
  DONE: {
    icon: CheckCircle2,
    label: "Completed",
    iconColor: "text-green-500",
  },
  BLOCKED: {
    icon: XCircle,
    label: "Blocked",
    iconColor: "text-red-500",
  },
  CANCELLED: {
    icon: XCircle,
    label: "Cancelled",
    iconColor: "text-muted-foreground",
  },
};

// Linear's label colors using shadcn colors
const labelConfig = {
  BUG: { color: "text-red-500" },
  FEATURE: { color: "text-blue-500" },
  UI: { color: "text-purple-500" },
  DOCUMENTATION: { color: "text-cyan-500" },
  REFACTOR: { color: "text-orange-500" },
  PERFORMANCE: { color: "text-orange-500" },
  DESIGN: { color: "text-pink-500" },
  SECURITY: { color: "text-red-500" },
  ACCESSIBILITY: { color: "text-purple-500" },
  TESTING: { color: "text-green-500" },
  INTERNATIONALIZATION: { color: "text-cyan-500" },
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
  const labelColor = labelConfig[item.label as keyof typeof labelConfig] || {
    color: "text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2 px-3 hover:bg-accent/50 cursor-pointer transition-colors duration-150",
        className
      )}
      onClick={() => onItemClick?.(item)}
    >
      {/* Priority indicator - small dot */}
      <div className="flex-shrink-0">
        <PrioritySelector
          iconOnly={true}
          disabled={true}
          priority={item.priority}
        />
      </div>

      {/* Issue ID */}
      <div className="flex-shrink-0 text-sm text-muted-foreground font-medium min-w-[80px]">
        {item._id.slice(-8).toUpperCase()}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">
          {item.title}
        </span>
      </div>

      {/* Label */}
      <div className="flex-shrink-0">
        <span className={cn("text-xs font-medium", labelColor.color)}>
          {item.label.charAt(0).toUpperCase() +
            item.label.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Project */}
      {item.project && (
        <div className="flex-shrink-0 text-xs text-muted-foreground min-w-[120px] text-right">
          {item.project.name}
        </div>
      )}

      {/* Due date */}
      {item.dueDate && (
        <div className="flex-shrink-0 text-xs text-muted-foreground min-w-[60px] text-right">
          {format(new Date(item.dueDate), "MMM dd")}
        </div>
      )}

      {/* Assignee */}
      <div className="flex-shrink-0">
        {item.assignedTo ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.assignedTo?.image} />
            <AvatarFallback className="text-xs">
              {item.assignedTo?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted border" />
        )}
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
    <div className={cn("", className)}>
      {/* Linear-style group header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b py-3 px-3  mb-2">
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
          <Plus className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-0">
        {group.items.map((item) => (
          <IssueItemComponent
            key={item._id}
            item={item}
            onItemClick={onItemClick}
          />
        ))}
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
    <div className={cn("space-y-8", className)}>
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
