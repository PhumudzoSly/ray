"use client";

import { cn } from "@workspace/ui/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  variant?: "default" | "text" | "card";
}

export default function LoadingSpinner({
  className,
  variant = "default",
}: LoadingSpinnerProps) {
  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3 p-3", className)}>
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  // Default minimal skeleton
  return (
    <div className={cn("flex items-center space-x-2 p-2", className)}>
      <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
      <div className="h-3 bg-gray-200 rounded flex-1 animate-pulse" />
    </div>
  );
}
