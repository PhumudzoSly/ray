import React from "react";

export interface Activity {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IconProps {
  className?: string;
}

// Activity Icons
export const CreatedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M7 2.33334V11.6667M2.33333 7H11.6667"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const UpdatedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M13.0303 3.96967C13.3232 4.26256 13.3232 4.73744 13.0303 5.03033L5.53033 12.5303C5.23744 12.8232 4.76256 12.8232 4.46967 12.5303L0.96967 9.03033C0.676777 8.73744 0.676777 8.26256 0.96967 7.96967C1.26256 7.67678 1.73744 7.67678 2.03033 7.96967L5 10.9393L11.9697 3.96967C12.2626 3.67678 12.7374 3.67678 13.0303 3.96967Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const DeletedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M2.33333 3.5H11.6667M5.83333 6.41667V9.91667M8.16667 6.41667V9.91667M3.5 3.5H10.5L9.91667 11.0833C9.91667 11.4614 9.76607 11.8241 9.49727 12.0929C9.22847 12.3617 8.86577 12.5123 8.48767 12.5123H5.51233C5.13423 12.5123 4.77153 12.3617 4.50273 12.0929C4.23393 11.8241 4.08333 11.4614 4.08333 11.0833L3.5 3.5ZM5.25 3.5V2.33333C5.25 2.11232 5.33781 1.90036 5.49409 1.74408C5.65037 1.5878 5.86232 1.5 6.08333 1.5H7.91667C8.13768 1.5 8.34964 1.5878 8.50592 1.74408C8.66219 1.90036 8.75 2.11232 8.75 2.33333V3.5H5.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const AssignedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M9.33333 12.25V11.0833C9.33333 10.4645 9.08839 9.87089 8.65268 9.43518C8.21697 8.99947 7.62337 8.75453 7.00453 8.75453H3.82547C3.20663 8.75453 2.61303 8.99947 2.17732 9.43518C1.74161 9.87089 1.49667 10.4645 1.49667 11.0833V12.25M11.6667 4.08333V7.58333M13.4167 5.83333H9.91667M7.29167 3.5C7.29167 4.78866 6.24533 5.83333 4.95833 5.83333C3.67134 5.83333 2.625 4.78866 2.625 3.5C2.625 2.21134 3.67134 1.16667 4.95833 1.16667C6.24533 1.16667 7.29167 2.21134 7.29167 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CommentedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M12.25 6.41667C12.2532 7.21226 12.0649 7.99798 11.6992 8.70833C11.2781 9.54091 10.6451 10.2479 9.86304 10.7497C9.08097 11.2515 8.17889 11.5258 7.25833 11.5417C6.46274 11.5449 5.67702 11.3566 4.96667 10.9908L1.75 12.25L3.00917 9.03333C2.64338 8.32298 2.45513 7.53726 2.45833 6.74167C2.47425 5.82111 2.74852 4.91903 3.25033 4.13696C3.75213 3.35489 4.45909 2.72194 5.29167 2.30083C6.00202 1.93505 6.78774 1.74679 7.58333 1.75H7.875C9.07569 1.82321 10.2015 2.35503 11.0288 3.24122C11.856 4.1274 12.3191 5.28612 12.25 6.41667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const StatusChangedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M13.4167 3.5L8.16667 8.75L5.83333 6.41667L0.583333 11.6667M13.4167 3.5H9.91667M13.4167 3.5V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const UploadedIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M7 11.6667V2.33334M7 2.33334L3.5 5.83334M7 2.33334L10.5 5.83334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Activity Type Constants
export const activityTypes = [
  {
    id: "PROJECT",
    name: "Project",
    color: "#22c55e",
    colorClass: "text-green-500",
    icon: CreatedIcon,
  },
  {
    id: "FEATURE",
    name: "Feature",
    color: "#3b82f6",
    colorClass: "text-blue-500",
    icon: CreatedIcon,
  },
  {
    id: "ISSUE",
    name: "Issue",
    color: "#f97316",
    colorClass: "text-orange-500",
    icon: CreatedIcon,
  },
  {
    id: "COMMENT",
    name: "Comment",
    color: "#64748b",
    colorClass: "text-slate-500",
    icon: CommentedIcon,
  },
];

// Activity Action Constants
export const activityActions = [
  {
    id: "CREATED",
    name: "Created",
    color: "#22c55e",
    colorClass: "text-green-500",
    icon: CreatedIcon,
  },
  {
    id: "UPDATED",
    name: "Updated",
    color: "#3b82f6",
    colorClass: "text-blue-500",
    icon: UpdatedIcon,
  },
  {
    id: "DELETED",
    name: "Deleted",
    color: "#ef4444",
    colorClass: "text-red-500",
    icon: DeletedIcon,
  },
  {
    id: "ASSIGNED",
    name: "Assigned",
    color: "#8b5cf6",
    colorClass: "text-purple-500",
    icon: AssignedIcon,
  },
  {
    id: "UNASSIGNED",
    name: "Unassigned",
    color: "#64748b",
    colorClass: "text-slate-500",
    icon: AssignedIcon,
  },
  {
    id: "STARTED",
    name: "Started",
    color: "#0ea5e9",
    colorClass: "text-sky-500",
    icon: StatusChangedIcon,
  },
  {
    id: "COMPLETED",
    name: "Completed",
    color: "#22c55e",
    colorClass: "text-green-500",
    icon: StatusChangedIcon,
  },
  {
    id: "CANCELLED",
    name: "Cancelled",
    color: "#ef4444",
    colorClass: "text-red-500",
    icon: StatusChangedIcon,
  },
  {
    id: "COMMENTED",
    name: "Commented",
    color: "#64748b",
    colorClass: "text-slate-500",
    icon: CommentedIcon,
  },
  {
    id: "UPLOADED",
    name: "Uploaded",
    color: "#0ea5e9",
    colorClass: "text-sky-500",
    icon: UploadedIcon,
  },
  {
    id: "DOWNLOADED",
    name: "Downloaded",
    color: "#8b5cf6",
    colorClass: "text-purple-500",
    icon: UploadedIcon,
  },
  {
    id: "STATUS_CHANGED",
    name: "Status Changed",
    color: "#f97316",
    colorClass: "text-orange-500",
    icon: StatusChangedIcon,
  },
  {
    id: "PRIORITY_CHANGED",
    name: "Priority Changed",
    color: "#f97316",
    colorClass: "text-orange-500",
    icon: StatusChangedIcon,
  },
];

// Helper function to get activity type details
export const getActivityType = (typeId: string) => {
  return activityTypes.find((type) => type.id === typeId);
};

// Helper function to get activity action details
export const getActivityAction = (actionId: string) => {
  return activityActions.find((action) => action.id === actionId);
};

// Activity Icon Component
export const ActivityIcon: React.FC<{
  typeId: string;
  actionId: string;
  className?: string;
}> = ({ typeId, actionId, className }) => {
  const action = getActivityAction(actionId);
  if (action) {
    const IconComponent = action.icon;
    return <IconComponent className={className} />;
  }
  const type = getActivityType(typeId);
  if (type) {
    const IconComponent = type.icon;
    return <IconComponent className={className} />;
  }
  return null;
};
