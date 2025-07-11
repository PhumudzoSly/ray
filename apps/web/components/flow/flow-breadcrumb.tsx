"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronRight, Home, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowBreadcrumbProps {
  breadcrumbs: Array<{
    id: string;
    label: string;
    isSubFlow: boolean;
  }>;
  onNavigate: (nodeId: string | null) => void;
}

export function FlowBreadcrumb({
  breadcrumbs,
  onNavigate,
}: FlowBreadcrumbProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        "bg-background/80 backdrop-blur-sm border rounded-md",
        "px-2 py-1.5 shadow-sm"
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(null)}
        className="h-7 px-2 text-xs hover:bg-accent/50 transition-all duration-200"
      >
        <Home className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        Main Flow
      </Button>

      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.id} className="flex items-center">
          <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-muted-foreground/60" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(breadcrumb.id)}
            className="h-7 px-2 text-xs hover:bg-accent/50 transition-all duration-200 font-normal"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
            {breadcrumb.label}
          </Button>
        </div>
      ))}
    </div>
  );
}
