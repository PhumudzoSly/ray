// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-1",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get all available purposes for integrations
 */
export const getAvailablePurposes = () => {
  return [
    {
      value: "email_sync",
      label: "Email Sync",
      description: "Sync data to email platforms",
    },
    {
      value: "code_sync",
      label: "Code Sync",
      description: "Sync data from code repositories",
    },
    {
      value: "analytics",
      label: "Analytics",
      description: "Send data to analytics platforms",
    },
    {
      value: "webhook",
      label: "Webhook",
      description: "Send webhooks to external services",
    },
    {
      value: "payment",
      label: "Payment",
      description: "Process payments",
    },
  ] as const;
};
