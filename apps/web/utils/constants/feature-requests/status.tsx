import React from "react";

export interface FeatureRequestStatus {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IconProps {
  className?: string;
}

export const PendingIcon: React.FC<IconProps> = ({ className }) => {
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
    </svg>
  );
};

export const UnderReviewIcon: React.FC<IconProps> = ({ className }) => {
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

export const ApprovedIcon: React.FC<IconProps> = ({ className }) => {
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

export const RejectedIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M5 5L9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 5L5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ImplementedIcon: React.FC<IconProps> = ({ className }) => {
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
        fill="currentColor"
        strokeWidth="4"
        transform="rotate(-90 7 7)"
      ></circle>
    </svg>
  );
};

export const featureRequestStatuses: FeatureRequestStatus[] = [
  {
    id: "pending",
    name: "Pending",
    color: "#f97316",
    colorClass: "text-orange-500",
    icon: PendingIcon,
  },
  {
    id: "under_review",
    name: "Under Review",
    color: "#3b82f6",
    colorClass: "text-blue-500",
    icon: UnderReviewIcon,
  },
  {
    id: "approved",
    name: "Approved",
    color: "#22c55e",
    colorClass: "text-green-500",
    icon: ApprovedIcon,
  },
  {
    id: "rejected",
    name: "Rejected",
    color: "#ef4444",
    colorClass: "text-red-500",
    icon: RejectedIcon,
  },
  {
    id: "implemented",
    name: "Implemented",
    color: "#8b5cf6",
    colorClass: "text-purple-500",
    icon: ImplementedIcon,
  },
];
