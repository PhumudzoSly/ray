import React from "react";

export interface MilestoneStatus {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IconProps {
  className?: string;
}

export const NotStartedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="1.4 1.74"
        strokeDashoffset="0.65"
      ></circle>
      <circle
        cx="7"
        cy="7"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="0 100"
        strokeDashoffset="0"
        transform="rotate(-90 7 7)"
      ></circle>
    </svg>
  );
};

export const InProgressIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <circle
        className="progress"
        cx="7"
        cy="7"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="2.0839231268812295 100"
        strokeDashoffset="0"
        transform="rotate(-90 7 7)"
      ></circle>
    </svg>
  );
};

export const AtRiskIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <path
        d="M7 3L8.5 5.5L11 6L8.5 6.5L7 9L5.5 6.5L3 6L5.5 5.5L7 3Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const CompletedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <path
        d="M4.5 7L6.5 9L9.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const DelayedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <path
        d="M7 3.5V7L9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const status: MilestoneStatus[] = [
  {
    id: "not-started",
    name: "Not Started",
    color: "#6b7280",
    colorClass: "text-gray-500",
    icon: NotStartedIcon,
  },
  {
    id: "in-progress",
    name: "In Progress",
    color: "#facc15",
    colorClass: "text-yellow-400",
    icon: InProgressIcon,
  },
  {
    id: "at-risk",
    name: "At Risk",
    color: "#f97316",
    colorClass: "text-orange-500",
    icon: AtRiskIcon,
  },
  {
    id: "completed",
    name: "Completed",
    color: "#22c55e",
    colorClass: "text-green-500",
    icon: CompletedIcon,
  },
  {
    id: "delayed",
    name: "Delayed",
    color: "#ef4444",
    colorClass: "text-red-500",
    icon: DelayedIcon,
  },
];

export const getMilestoneStatus = (
  statusId: string
): MilestoneStatus | undefined => {
  return status.find((s) => s.id === statusId);
};

export const MilestoneStatusIcon: React.FC<{
  statusId: string;
  className?: string;
}> = ({ statusId, className }) => {
  const statusItem = getMilestoneStatus(statusId);

  if (!statusItem) {
    return (
      <div
        className={`size-4 rounded-full border border-dashed border-muted-foreground/30 ${className}`}
      />
    );
  }

  const Icon = statusItem.icon;
  return <Icon className={`size-4 ${statusItem.colorClass} ${className}`} />;
};
