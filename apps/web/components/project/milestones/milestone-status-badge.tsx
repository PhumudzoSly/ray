
import { MilestoneStatus } from "@workspace/backend/prisma/generated/client/client";
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
  [MilestoneStatus.NOT_STARTED]: {
    label: "Not Started",
    variant: "secondary",
    className: "bg-muted text-muted-foreground border-border",
  },
  [MilestoneStatus.IN_PROGRESS]: {
    label: "In Progress",
    variant: "default",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  [MilestoneStatus.AT_RISK]: {
    label: "At Risk",
    variant: "destructive",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
  [MilestoneStatus.COMPLETED]: {
    label: "Completed",
    variant: "default",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  [MilestoneStatus.DELAYED]: {
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

  // Fallback for unknown status values
  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        {status || "Unknown"}
      </Badge>
    );
  }

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
