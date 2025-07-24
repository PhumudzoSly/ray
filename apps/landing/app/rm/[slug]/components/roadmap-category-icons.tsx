import React from "react";

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

export const BugIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M7 13C3.5 13 2.5 10.5 2.5 8.5V5.5C2.5 3.5 3.5 1 7 1C10.5 1 11.5 3.5 11.5 5.5V8.5C11.5 10.5 10.5 13 7 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 3.5L2 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 3.5L12 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 7H11.5"
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

export const DocumentationIcon: React.FC<IconProps> = ({ className }) => {
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

export const RefactorIcon: React.FC<IconProps> = ({ className }) => {
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

export const DesignIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M2 4C2 2.89543 2.89543 2 4 2H10C11.1046 2 12 2.89543 12 4V10C12 11.1046 11.1046 12 10 12H4C2.89543 12 2 11.1046 2 10V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 5H4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 5H12"
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

export const AccessibilityIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <circle cx="7" cy="4" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 8C4 8 4.5 12 7 12C9.5 12 10 8 10 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2 8H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const TestingIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M3 1.5L3 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 1.5L11 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 4L11 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 10L11 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.5 7L8.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const InternationalizationIcon: React.FC<IconProps> = ({
  className,
}) => {
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
        d="M1.5 7H12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 1.5C8.5 3.5 9 5.5 9 7C9 8.5 8.5 10.5 7 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 1.5C5.5 3.5 5 5.5 5 7C5 8.5 5.5 10.5 7 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ImprovementIcon: React.FC<IconProps> = ({ className }) => {
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
      <path
        d="M3 3L11 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 3L3 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const TaskIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M2 3.5C2 2.67157 2.67157 2 3.5 2H10.5C11.3284 2 12 2.67157 12 3.5V10.5C12 11.3284 11.3284 12 10.5 12H3.5C2.67157 12 2 11.3284 2 10.5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.5 5.5H9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 7.5H9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 9.5H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Category configuration with colors and icons
export const categoryConfig = {
  UI: {
    icon: UIIcon,
    label: "UI Enhancement",
    colorClass: "text-purple-500",
  },
  BUG: {
    icon: BugIcon,
    label: "Bug",
    colorClass: "text-red-500",
  },
  FEATURE: {
    icon: FeatureIcon,
    label: "Feature",
    colorClass: "text-green-500",
  },
  IMPROVEMENT: {
    icon: ImprovementIcon,
    label: "Improvement",
    colorClass: "text-emerald-500",
  },
  TASK: {
    icon: TaskIcon,
    label: "Task",
    colorClass: "text-amber-500",
  },
  DOCUMENTATION: {
    icon: DocumentationIcon,
    label: "Documentation",
    colorClass: "text-blue-500",
  },
  REFACTOR: {
    icon: RefactorIcon,
    label: "Refactor",
    colorClass: "text-yellow-400",
  },
  PERFORMANCE: {
    icon: PerformanceIcon,
    label: "Performance",
    colorClass: "text-orange-500",
  },
  DESIGN: {
    icon: DesignIcon,
    label: "Design",
    colorClass: "text-pink-500",
  },
  SECURITY: {
    icon: SecurityIcon,
    label: "Security",
    colorClass: "text-slate-500",
  },
  ACCESSIBILITY: {
    icon: AccessibilityIcon,
    label: "Accessibility",
    colorClass: "text-indigo-500",
  },
  TESTING: {
    icon: TestingIcon,
    label: "Testing",
    colorClass: "text-teal-500",
  },
  INTERNATIONALIZATION: {
    icon: InternationalizationIcon,
    label: "Internationalization",
    colorClass: "text-cyan-500",
  },
};

export const CategoryIcon: React.FC<{
  categoryId: string;
  className?: string;
}> = ({ categoryId, className }) => {
  const category = categoryConfig[categoryId as keyof typeof categoryConfig];
  if (!category) return null;
  const Icon = category.icon;
  return <Icon className={className} />;
};
