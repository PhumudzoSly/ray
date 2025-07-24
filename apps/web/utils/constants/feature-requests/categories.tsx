import React from "react";

export interface FeatureRequestCategory {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface IconProps {
  className?: string;
}

export const UIIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 5.5H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 8.5H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const FeatureIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M7 1V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M1 7H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};

export const IntegrationIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M2 4C2 2.89543 2.89543 2 4 2H6C7.10457 2 8 2.89543 8 4V6C8 7.10457 7.10457 8 6 8H4C2.89543 8 2 7.10457 2 6V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8C8 6.89543 8.89543 6 10 6H12C13.1046 6 14 6.89543 14 8V10C14 11.1046 13.1046 12 12 12H10C8.89543 12 8 11.1046 8 10V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 6L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const APIIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M2 3H12C12.5523 3 13 3.44772 13 4V10C13 10.5523 12.5523 11 12 11H2C1.44772 11 1 10.5523 1 10V4C1 3.44772 1.44772 3 2 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 6L6 8L4 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const PerformanceIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M1 12H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 12V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 12V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 12V2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const SecurityIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M7 13C7 13 12 10.5 12 7V3L7 1L2 3V7C2 10.5 7 13 7 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 7L6.5 8.5L9 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const MobileIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <rect
        x="3"
        y="1"
        width="8"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 11H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AnalyticsIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 3L7 7L10 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const AutomationIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M2 7C2 4.23858 4.23858 2 7 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 7C12 9.76142 9.76142 12 7 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M9.5 4.5L7 2L9.5 4.5Z" fill="currentColor" />
      <path
        d="M9.5 4.5L7 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4.5 9.5L7 12L4.5 9.5Z" fill="currentColor" />
      <path
        d="M4.5 9.5L7 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ReportingIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M3 1H11C11.5523 1 12 1.44772 12 2V12C12 12.5523 11.5523 13 11 13H3C2.44772 13 2 12.5523 2 12V2C2 1.44772 2.44772 1 3 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.5 4H9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 7H9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 10H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const featureRequestCategories: FeatureRequestCategory[] = [
  {
    id: "ui-ux",
    name: "UI/UX",
    color: "#8b5cf6",
    colorClass: "text-purple-500",
    icon: UIIcon,
  },
  {
    id: "feature",
    name: "New Feature",
    color: "#22c55e",
    colorClass: "text-green-500",
    icon: FeatureIcon,
  },
  {
    id: "integration",
    name: "Integration",
    color: "#3b82f6",
    colorClass: "text-blue-500",
    icon: IntegrationIcon,
  },
  {
    id: "api",
    name: "API",
    color: "#f59e0b",
    colorClass: "text-amber-500",
    icon: APIIcon,
  },
  {
    id: "performance",
    name: "Performance",
    color: "#f97316",
    colorClass: "text-orange-500",
    icon: PerformanceIcon,
  },
  {
    id: "security",
    name: "Security",
    color: "#64748b",
    colorClass: "text-slate-500",
    icon: SecurityIcon,
  },
  {
    id: "mobile",
    name: "Mobile",
    color: "#ec4899",
    colorClass: "text-pink-500",
    icon: MobileIcon,
  },
  {
    id: "analytics",
    name: "Analytics",
    color: "#14b8a6",
    colorClass: "text-teal-500",
    icon: AnalyticsIcon,
  },
  {
    id: "automation",
    name: "Automation",
    color: "#6366f1",
    colorClass: "text-indigo-500",
    icon: AutomationIcon,
  },
  {
    id: "reporting",
    name: "Reporting",
    color: "#06b6d4",
    colorClass: "text-cyan-500",
    icon: ReportingIcon,
  },
];
