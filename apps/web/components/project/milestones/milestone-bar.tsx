"use client";

import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface MilestoneBarProps {
  milestone: {
    id: string;
    name: string;
    description?: string;
    startDate?: number;
    endDate?: number;
    status: "not-started" | "in-progress" | "at-risk" | "completed" | "delayed";
    progress?: number;
    owner?: {
      id: string;
      name: string;
      image?: string;
    };
    project?: {
      id: string;
      name: string;
    };
    issueCount?: number;
    completedIssueCount?: number;
    featureCount?: number;
    completedFeatureCount?: number;
    overdueItems?: number;
  };
  startDate: Date;
  endDate: Date;
  onDragStart?: (e: React.DragEvent, milestone: any) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (milestone: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500 border-green-600 text-white";
    case "at-risk":
      return "bg-orange-500 border-orange-600 text-white";
    case "delayed":
      return "bg-red-500 border-red-600 text-white";
    case "in-progress":
      return "bg-blue-500 border-blue-600 text-white";
    default:
      return "bg-muted border-border text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3 w-3" />;
    case "at-risk":
      return <AlertTriangle className="h-3 w-3" />;
    case "delayed":
      return <Clock className="h-3 w-3" />;
    case "in-progress":
      return <Target className="h-3 w-3" />;
    default:
      return <Target className="h-3 w-3" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "at-risk":
      return "At Risk";
    case "delayed":
      return "Delayed";
    case "in-progress":
      return "In Progress";
    case "not-started":
      return "Not Started";
    default:
      return "Unknown";
  }
};

export function MilestoneBar({
  milestone,
  startDate,
  endDate,
  onDragStart,
  onDragEnd,
  onClick,
  className,
  style,
}: MilestoneBarProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart?.(e, milestone);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  const handleClick = () => {
    onClick?.(milestone);
  };

  const progress = milestone.progress || 0;
  const totalItems =
    (milestone.issueCount || 0) + (milestone.featureCount || 0);
  const completedItems =
    (milestone.completedIssueCount || 0) +
    (milestone.completedFeatureCount || 0);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "relative h-6 rounded-md border transition-all duration-200 cursor-pointer group",
            getStatusColor(milestone.status),
            isDragging && "opacity-50 scale-95",
            "hover:shadow-md hover:scale-[1.02] hover:z-10",
            className
          )}
          style={style}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
        >
          {/* Progress bar background */}
          {progress > 0 && (
            <div
              className="absolute inset-0 bg-white/20 rounded-md transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          )}

          {/* Content */}
          <div className="relative flex items-center justify-between h-full px-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {getStatusIcon(milestone.status)}
              <span className="text-xs font-medium truncate">
                {milestone.name}
              </span>
            </div>

            {milestone.owner && (
              <Avatar className="h-4 w-4 flex-shrink-0">
                <AvatarImage
                  src={milestone.owner.image}
                  alt={milestone.owner.name}
                />
                <AvatarFallback className="text-[10px] bg-white/20">
                  {milestone.owner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Drag handles */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize" />
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-80" side="top">
        <div className="space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{milestone.name}</h4>
              <Badge variant="outline" className="text-xs">
                {getStatusText(milestone.status)}
              </Badge>
            </div>
            {milestone.project && (
              <p className="text-xs text-muted-foreground">
                {milestone.project.name}
              </p>
            )}
            {milestone.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {milestone.description}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {milestone.startDate &&
                  format(new Date(milestone.startDate), "MMM d")}{" "}
                →{" "}
                {milestone.endDate &&
                  format(new Date(milestone.endDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Progress */}
          {totalItems > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {completedItems} of {totalItems} items completed
                </span>
                {milestone.overdueItems && milestone.overdueItems > 0 && (
                  <span className="text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {milestone.overdueItems} overdue
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Owner */}
          {milestone.owner && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={milestone.owner.image}
                  alt={milestone.owner.name}
                />
                <AvatarFallback className="text-xs">
                  {milestone.owner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium">{milestone.owner.name}</p>
                <p className="text-xs text-muted-foreground">Owner</p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground/70 pt-1 border-t">
            Click to view details • Drag to reschedule
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
