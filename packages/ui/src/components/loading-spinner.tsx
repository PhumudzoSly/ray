"use client";

import { cn } from "@workspace/ui/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  variant?: "default" | "text" | "card";
}

export default function LoadingSpinner({
  className,
  variant = "card",
}: LoadingSpinnerProps) {
  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-3 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3 p-3", className)}>
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  // Default minimal skeleton
  return (
    <div className={cn("flex items-center space-x-2 p-2", className)}>
      <div className="h-3 w-3 bg-muted rounded-full animate-pulse" />
      <div className="h-3 bg-muted rounded flex-1 animate-pulse" />
    </div>
  );
}
