import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@/lib/utils";
import { status as issueStatuses } from "@/utils/constants/issues/status";
import { priorities } from "@/utils/constants/issues/priority";
import { labels } from "@/utils/constants/issues/labels";

// Status Badge Component
type IssueStatusBadgeProps = {
  status: any;
};

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  const statusData = issueStatuses.find((s) => s.id === status);
  if (!statusData) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  const Icon = statusData.icon;
  return (
    <Badge className={cn("gap-1.5", statusData.colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      {statusData.name}
    </Badge>
  );
}

// Priority Badge Component
type IssuePriorityBadgeProps = {
  priority: any;
};

export function IssuePriorityBadge({ priority }: IssuePriorityBadgeProps) {
  const priorityData = priorities.find((p) => p.id === priority);
  if (!priorityData) {
    return <Badge variant="secondary">{priority}</Badge>;
  }

  const Icon = priorityData.icon;
  return (
    <Badge className={cn("gap-1.5", priorityData.colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      {priorityData.name}
    </Badge>
  );
}

// Label Badge Component
type IssueLabelBadgeProps = {
  label: any;
};

export function IssueLabelBadge({ label }: IssueLabelBadgeProps) {
  const labelData = labels.find((l) => l.id === label);
  if (!labelData) {
    return <Badge variant="secondary">{label}</Badge>;
  }

  const Icon = labelData.icon;
  return (
    <Badge className={cn("gap-1.5", labelData.colorClass)}>
      <Icon className="h-3.5 w-3.5" />
      {labelData.name}
    </Badge>
  );
}
