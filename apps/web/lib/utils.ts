import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect } from "react";


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
  "focus:ring-blue-200 dark:focus:ring-blue-700/30",
  // border color
  "focus:border-blue-500 dark:focus:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline-solid outline-offset-2 outline-0 focus-visible:outline-2",
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



type SkipToEvent = CustomEvent<{ timePercentage: number }>;
const SKIP_TO_EVENT_NAME = "skipTo";

export function useSkipTo() {
  return useCallback((timePercentage: number) => {
    const event: SkipToEvent = new CustomEvent(SKIP_TO_EVENT_NAME, {
      detail: { timePercentage },
    });

    window.dispatchEvent(event);
  }, []);
}

export function useSkipToListener(callback: (timePercentage: number) => void) {
  useEffect(() => {
    function handler(event: Event | SkipToEvent) {
      const customEvent = event as SkipToEvent;
      callback(customEvent.detail.timePercentage);
    }

    window.addEventListener(SKIP_TO_EVENT_NAME, handler);

    return () => {
      window.removeEventListener(SKIP_TO_EVENT_NAME, handler);
    };
  }, [callback]);
}