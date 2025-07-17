// Use a string union type for MilestoneStatus for Record key compatibility
type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "at-risk"
  | "completed"
  | "delayed";
import { Badge } from "@workspace/ui/components/badge";

interface MilestoneStatusBadgeProps {
  status: MilestoneStatus;
  className?: string;
}

const statusConfig: Record<
  MilestoneStatus,
  {
    label: string;
    variant: "secondary" | "default" | "destructive";
    className: string;
  }
> = {
  "not-started": {
    label: "Not Started",
    variant: "secondary",
    className: "bg-muted text-muted-foreground border-border",
  },
  "in-progress": {
    label: "In Progress",
    variant: "default",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  "at-risk": {
    label: "At Risk",
    variant: "destructive",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
  completed: {
    label: "Completed",
    variant: "default",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  delayed: {
    label: "Delayed",
    variant: "destructive",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

export function MilestoneStatusBadge({
  status,
  className,
}: MilestoneStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
