import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const DiscoveryIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Discovery Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM7 4.5C7 4.22386 7.22386 4 7.5 4H8.5C8.77614 4 9 4.22386 9 4.5V5.5C9 5.77614 8.77614 6 8.5 6H7.5C7.22386 6 7 5.77614 7 5.5V4.5ZM7 7.5C7 7.22386 7.22386 7 7.5 7H8.5C8.77614 7 9 7.22386 9 7.5V11.5C9 11.7761 8.77614 12 8.5 12H7.5C7.22386 12 7 11.7761 7 11.5V7.5Z" />
  </svg>
);

const PlanningIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Planning Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M2 3C2 1.89543 2.89543 1 4 1H12C13.1046 1 14 1.89543 14 3V13C14 14.1046 13.1046 15 12 15H4C2.89543 15 2 14.1046 2 13V3ZM5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6H11C11.5523 6 12 5.55228 12 5C12 4.44772 11.5523 4 11 4H5ZM5 8C4.44772 8 4 8.44772 4 9C4 9.55228 4.44772 10 5 10H9C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8H5Z" />
  </svg>
);

const DevelopmentIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Development Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645L1.64645 7.64645C1.45118 7.84171 1.45118 8.15829 1.64645 8.35355L4.64645 11.3536C4.84171 11.5488 5.15829 11.5488 5.35355 11.3536C5.54882 11.1583 5.54882 10.8417 5.35355 10.6464L2.70711 8L5.35355 5.35355C5.54882 5.15829 5.54882 4.84171 5.35355 4.64645ZM10.6464 4.64645C10.8417 4.45118 11.1583 4.45118 11.3536 4.64645L14.3536 7.64645C14.5488 7.84171 14.5488 8.15829 14.3536 8.35355L11.3536 11.3536C11.1583 11.5488 10.8417 11.5488 10.6464 11.3536C10.4512 11.1583 10.4512 10.8417 10.6464 10.6464L13.2929 8L10.6464 5.35355C10.4512 5.15829 10.4512 4.84171 10.6464 4.64645Z" />
  </svg>
);

const TestingIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Testing Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M6.66667 1.33333C6.66667 0.596954 7.26363 0 8 0C8.73638 0 9.33334 0.596954 9.33334 1.33333V2.66667H6.66667V1.33333ZM4 4V12C4 13.1046 4.89543 14 6 14H10C11.1046 14 12 13.1046 12 12V4H4ZM2.66667 2.66667V4H13.3333V2.66667H2.66667Z" />
  </svg>
);

const ReleaseIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Release Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 0L14.9282 4V12L8 16L1.07179 12V4L8 0ZM3.07179 10.6L8 13.6L12.9282 10.6V5.4L8 2.4L3.07179 5.4V10.6Z" />
  </svg>
);

const LiveIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Live Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM11.3333 8.66667H8.66667V11.3333C8.66667 11.7015 8.36819 12 8 12C7.63181 12 7.33333 11.7015 7.33333 11.3333V8.66667H4.66667C4.29848 8.66667 4 8.36819 4 8C4 7.63181 4.29848 7.33333 4.66667 7.33333H7.33333V4.66667C7.33333 4.29848 7.63181 4 8 4C8.36819 4 8.66667 4.29848 8.66667 4.66667V7.33333H11.3333C11.7015 7.33333 12 7.63181 12 8C12 8.36819 11.7015 8.66667 11.3333 8.66667Z" />
  </svg>
);

const DeprecatedIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className={className}
    fill="currentColor"
    aria-label="Deprecated Phase"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM11.3333 8.66667H4.66667C4.29848 8.66667 4 8.36819 4 8C4 7.63181 4.29848 7.33333 4.66667 7.33333H11.3333C11.7015 7.33333 12 7.63181 12 8C12 8.36819 11.7015 8.66667 11.3333 8.66667Z" />
  </svg>
);

export interface Phase {
  id: string;
  name: string;
  icon: React.FC<IconProps>;
  colorClass: string;
}

export const phases: Phase[] = [
  {
    id: "DISCOVERY",
    name: "Discovery",
    icon: DiscoveryIcon,
    colorClass: "text-purple-500",
  },
  {
    id: "PLANNING",
    name: "Planning",
    icon: PlanningIcon,
    colorClass: "text-blue-500",
  },
  {
    id: "DEVELOPMENT",
    name: "Development",
    icon: DevelopmentIcon,
    colorClass: "text-yellow-500",
  },
  {
    id: "TESTING",
    name: "Testing",
    icon: TestingIcon,
    colorClass: "text-orange-500",
  },
  {
    id: "RELEASE",
    name: "Release",
    icon: ReleaseIcon,
    colorClass: "text-pink-500",
  },
  {
    id: "LIVE",
    name: "Live",
    icon: LiveIcon,
    colorClass: "text-green-500",
  },
  {
    id: "DEPRECATED",
    name: "Deprecated",
    icon: DeprecatedIcon,
    colorClass: "text-gray-500",
  },
];
