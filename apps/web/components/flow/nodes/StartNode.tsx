"use client";

import { NodeProps, Handle, Position } from "reactflow";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { nodeTypes } from "@/lib/types";
import * as LucideIcons from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface StartNodeData {
  type: "start";
  label: string;
  description?: string;
  priority: "low" | "medium" | "high";
  hasSubFlow?: boolean;
  [key: string]: any;
}

export interface StartNodeProps extends NodeProps<StartNodeData> {}

export function StartNode({ data, id, selected }: StartNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const nodeType = nodeTypes.find((t) => t.type === data.type);
  const IconComponent = nodeType?.icon
    ? (LucideIcons as any)[nodeType.icon]
    : LucideIcons.Play;

  const priorityColors = {
    low: "bg-muted text-muted-foreground border-border",
    medium:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    high: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
  } as const;

  const priorityDots = {
    low: "bg-muted-foreground/60",
    medium: "bg-amber-500",
    high: "bg-destructive",
  } as const;

  const handleSubFlowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("navigateToSubFlow", {
      detail: { nodeId: id },
    });
    window.dispatchEvent(event);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle more options
  };

  return (
    <div
      className={cn(
        "relative group bg-card border rounded-lg p-3 min-w-[200px] max-w-[320px]",
        "shadow-sm hover:shadow-md transition-all duration-300 ease-out",
        selected
          ? "border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]"
          : isHovered
            ? "shadow-sm scale-[1.01]"
            : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        id="start-output-bottom"
        className="w-3 h-3 !bg-green-500 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ bottom: -6, left: "50%" }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-2.5">
        <div
          className={cn(
            "p-2 rounded-md",
            nodeType?.color || "bg-green-600",
            "shadow-sm"
          )}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-muted-foreground leading-tight mb-1 truncate">
            {data.label}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {nodeType?.label || "Start"}
          </p>
        </div>
        {/* Priority indicator dot */}
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            priorityDots[data.priority],
            "mt-1 flex-shrink-0"
          )}
        />
      </div>

      {/* Description if available */}
      {data.description && (
        <div className="mb-2.5">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-2.5">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-normal px-2 py-0.5 bg-muted text-muted-foreground border-border",
            priorityColors[data.priority]
          )}
        >
          {data.priority}
        </Badge>

        <div className="flex items-center gap-1">
          {data.hasSubFlow && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs hover:bg-background/80 transition-colors"
              onClick={handleSubFlowClick}
            >
              <LucideIcons.Layers className="w-3 h-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Sub-flow</span>
              <LucideIcons.ArrowRight className="w-3 h-3 ml-1 opacity-60 text-muted-foreground" />
            </Button>
          )}

          {/* More options button (appears on hover) */}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hover:bg-background/80"
            )}
            onClick={handleMoreClick}
          >
            <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Subtle glow effect when selected */}
      {selected && (
        <div className="absolute inset-0 rounded-lg bg-primary/5 pointer-events-none" />
      )}
    </div>
  );
}
