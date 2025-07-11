"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={cn("h-6 w-6 animate-spin", className)} />
    </div>
  );
}
