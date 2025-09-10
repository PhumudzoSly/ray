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
  // Enhanced dual-ring spinner with smoother animation and better visual design
  const DualRingSpinner = () => (
    <div className="relative inline-flex">
      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 dark:border-muted-foreground/30"></div>
      <div
        className="absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-primary animate-spin"
        style={{
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          animationDuration: "0.8s",
          animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
        }}
      ></div>
    </div>
  );

  // Enhanced pulse loader for text and card variants with more realistic content simulation
  const PulseLoader = ({ variant }: { variant: "text" | "card" }) => (
    <div className={cn("space-y-2", variant === "card" ? "p-4" : "")}>
      <div
        className={cn(
          "bg-muted-foreground/10 dark:bg-muted-foreground/20 rounded-md animate-pulse",
          variant === "card" ? "h-5" : "h-4"
        )}
      />
      <div
        className={cn(
          "bg-muted-foreground/10 dark:bg-muted-foreground/20 rounded-md animate-pulse",
          variant === "card" ? "h-4 w-5/6" : "h-3 w-3/4"
        )}
      />
      {variant === "card" && (
        <>
          <div className="bg-muted-foreground/10 dark:bg-muted-foreground/20 rounded-md animate-pulse h-4 w-4/6 mt-1" />
          <div className="bg-muted-foreground/10 dark:bg-muted-foreground/20 rounded-md animate-pulse h-10 w-full mt-3" />
        </>
      )}
    </div>
  );

  if (variant === "text") {
    return (
      <div
        className={cn("flex items-center gap-3 w-full max-w-7xl", className)}
      >
        <DualRingSpinner />
        <span className="text-sm text-muted-foreground font-medium">
          Loading...
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 bg-muted/20 dark:bg-muted/10 w-full",
          className
        )}
      >
        <DualRingSpinner />
        <p className="mt-4 text-sm text-muted-foreground font-medium">
          Loading content...
        </p>
        <div className="mt-6 w-full max-w-6xl">
          <PulseLoader variant="card" />
        </div>
      </div>
    );
  }

  // Default minimal spinner
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <DualRingSpinner />
    </div>
  );
}
