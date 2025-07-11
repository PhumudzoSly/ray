"use client";

import { NodeProps, Handle, Position } from "reactflow";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { nodeTypes } from "@/lib/types";
import * as LucideIcons from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BaseNodeData, SpecializedNodeProps, HandleConfig } from "./types";

export interface BaseFlowNodeProps extends SpecializedNodeProps<BaseNodeData> {
  children?: React.ReactNode;
  onMoreClick?: () => void;
  onSubFlowClick?: () => void;
  customHandles?: React.ReactNode;
  showDefaultHandles?: boolean;
  handles?: HandleConfig[];
  nodeIcon?: string;
  nodeColor?: string;
  className?: string;
}

export function BaseFlowNode({
  data,
  id,
  selected,
  children,
  onMoreClick,
  onSubFlowClick,
  customHandles,
  showDefaultHandles = true,
  handles,
  nodeIcon,
  nodeColor,
  className,
  onDataChange,
  onDelete,
  onDuplicate,
  onNavigateToSubFlow,
  isReadOnly = false,
  theme = "light",
}: BaseFlowNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const nodeType = nodeTypes.find((t) => t.type === data.type);
  const IconComponent = nodeIcon
    ? (LucideIcons as any)[nodeIcon]
    : nodeType?.icon
      ? (LucideIcons as any)[nodeType.icon]
      : LucideIcons.Package;

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
    if (onSubFlowClick) {
      onSubFlowClick();
    } else if (onNavigateToSubFlow) {
      onNavigateToSubFlow();
    } else {
      const event = new CustomEvent("navigateToSubFlow", {
        detail: { nodeId: id },
      });
      window.dispatchEvent(event);
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoreClick) {
      onMoreClick();
    }
  };

  const handleDataChange = (newData: Partial<BaseNodeData>) => {
    if (onDataChange && !isReadOnly) {
      onDataChange(newData);
    }
  };

  const handleDelete = () => {
    if (onDelete && !isReadOnly) {
      onDelete();
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate && !isReadOnly) {
      onDuplicate();
    }
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
            : "",
        isReadOnly && "opacity-75 cursor-not-allowed",
        theme === "dark" && "bg-gray-900 border-gray-700",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Custom handles or configured handles or default handles */}
      {customHandles ? (
        customHandles
      ) : handles ? (
        <CustomHandles handles={handles} />
      ) : showDefaultHandles ? (
        <DefaultHandles />
      ) : null}

      {/* Header */}
      <div className="flex items-start gap-3 mb-2.5">
        <div
          className={cn(
            "p-2 rounded-md",
            nodeColor || nodeType?.color || "bg-primary/80",
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
            {nodeType?.label || data.type}
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

      {/* Custom content */}
      {children}

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

// Custom handles component
function CustomHandles({ handles }: { handles: HandleConfig[] }) {
  return (
    <>
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={
            Position[
              (handle.position.charAt(0).toUpperCase() +
                handle.position.slice(1)) as keyof typeof Position
            ]
          }
          id={handle.id}
          className={cn(
            "w-3 h-3 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200",
            handle.type === "target" ? "!bg-green-500" : "!bg-primary",
            handle.className
          )}
          style={{
            ...handle.style,
            ...(handle.position === "top" && { top: -6, left: "50%" }),
            ...(handle.position === "bottom" && { bottom: -6, left: "50%" }),
            ...(handle.position === "left" && { left: -6, top: "50%" }),
            ...(handle.position === "right" && { right: -6, top: "50%" }),
          }}
          isConnectable={handle.isConnectable}
        />
      ))}
    </>
  );
}

// Default handles component
function DefaultHandles() {
  return (
    <>
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="w-3 h-3 !bg-green-500 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ top: -6, left: "50%" }}
      />

      {/* Right handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-3 h-3 !bg-primary !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ right: -6, top: "50%" }}
      />

      {/* Bottom handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="w-3 h-3 !bg-primary !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ bottom: -6, left: "50%" }}
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-3 h-3 !bg-green-500 !border-2 !border-background !shadow-sm opacity-70 group-hover:opacity-100 hover:opacity-100 hover:scale-125 transition-all duration-200"
        style={{ left: -6, top: "50%" }}
      />
    </>
  );
}
