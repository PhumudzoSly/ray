import React from "react";

// Define the icon components with className prop
export const WebAppFrontendIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M2 2H12C12.5523 2 13 2.44772 13 3V11C13 11.5523 12.5523 12 12 12H2C1.44772 12 1 11.5523 1 11V3C1 2.44772 1.44772 2 2 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="3" y="4" width="8" height="4" rx="1" fill="currentColor" />
  </svg>
);

export const WebAppBackendIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
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
      rx="1"
      stroke="#28A745"
      strokeWidth="1.5"
    />
    <path d="M5 5H9V9H5V5Z" fill="#28A745" />
  </svg>
);

export const FullstackAppIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M2 2H12C12.5523 2 13 2.44772 13 3V11C13 11.5523 12.5523 12 12 12H2C1.44772 12 1 11.5523 1 11V3C1 2.44772 1.44772 2 2 2Z"
      stroke="#007BFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="3" y="4" width="8" height="4" rx="1" fill="#007BFF" />
    <rect
      x="2"
      y="2"
      width="10"
      height="10"
      rx="1"
      stroke="#28A745"
      strokeWidth="1.5"
    />
  </svg>
);

export const MobileAppIOSIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M4 1H10C10.5523 1 11 1.44772 11 2V12C11 12.5523 10.5523 13 10 13H4C3.44772 13 3 12.5523 3 12V2C3 1.44772 3.44772 1 4 1Z"
      stroke="#DC3545"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 3V11"
      stroke="#DC3545"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MobileAppAndroidIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M4 1H10C10.5523 1 11 1.44772 11 2V12C11 12.5523 10.5523 13 10 13H4C3.44772 13 3 12.5523 3 12V2C3 1.44772 3.44772 1 4 1Z"
      stroke="#FFC107"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 3V11"
      stroke="#FFC107"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CrossPlatformAppIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <rect x="2" y="2" width="4" height="4" rx="1" fill="#17A2B8" />
    <rect x="8" y="8" width="4" height="4" rx="1" fill="#17A2B8" />
  </svg>
);

export const APIIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M3 3H11V11H3V3Z"
      stroke="#6C757D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 7H11"
      stroke="#6C757D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 3V11"
      stroke="#6C757D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const OtherIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <circle cx="7" cy="7" r="6" stroke="#6C757D" strokeWidth="1.5" />
  </svg>
);

export const PluginIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <rect
      x="4"
      y="2"
      width="6"
      height="10"
      rx="2"
      stroke="#8B5CF6"
      strokeWidth="1.5"
    />
    <rect x="6" y="4" width="2" height="6" rx="1" fill="#8B5CF6" />
  </svg>
);

export const DesktopAppIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <rect
      x="2"
      y="3"
      width="10"
      height="7"
      rx="1.5"
      stroke="#6366F1"
      strokeWidth="1.5"
    />
    <rect x="5" y="10" width="4" height="1" rx="0.5" fill="#6366F1" />
  </svg>
);

export const CLIIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <rect
      x="2"
      y="3"
      width="10"
      height="8"
      rx="1"
      stroke="#F59E42"
      strokeWidth="1.5"
    />
    <path
      d="M5 6L7 7L5 8"
      stroke="#F59E42"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="8.5" y="7.5" width="2" height="1" rx="0.5" fill="#F59E42" />
  </svg>
);

export interface ProjectType {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
}

export const projectTypes: ProjectType[] = [
  {
    id: "web",
    name: "Web App",
    icon: WebAppFrontendIcon,
    colorClass: "text-blue-500",
  },
  {
    id: "mobile",
    name: "Mobile App",
    icon: MobileAppIOSIcon,
    colorClass: "text-green-500",
  },
  {
    id: "both",
    name: "Cross Platform App",
    icon: CrossPlatformAppIcon,
    colorClass: "text-cyan-500",
  },
  {
    id: "api",
    name: "API",
    icon: APIIcon,
    colorClass: "text-gray-500",
  },
  {
    id: "plugin",
    name: "Plugin",
    icon: PluginIcon,
    colorClass: "text-purple-500",
  },
  {
    id: "desktop",
    name: "Desktop App",
    icon: DesktopAppIcon,
    colorClass: "text-indigo-500",
  },
  {
    id: "cli",
    name: "CLI Tool",
    icon: CLIIcon,
    colorClass: "text-orange-500",
  },
];
