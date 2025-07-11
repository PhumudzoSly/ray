"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
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
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  differenceInDays,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  MoreHorizontal,
} from "lucide-react";

interface GanttChartProps {
  milestones: any[];
  onMilestoneClick?: (milestone: any) => void;
  className?: string;
}

type ViewMode = "weeks" | "months";

export function GanttChart({
  milestones,
  onMilestoneClick,
  className,
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("weeks");
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(
    new Set()
  );

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    if (milestones.length === 0) {
      const now = new Date();
      return {
        start: startOfWeek(addDays(now, -30)),
        end: endOfWeek(addDays(now, 120)),
      };
    }

    const dates = milestones
      .flatMap((m) => [
        m.startDate ? new Date(m.startDate) : null,
        m.endDate ? new Date(m.endDate) : null,
      ])
      .filter((date): date is Date => date !== null);

    if (dates.length === 0) {
      const now = new Date();
      return {
        start: startOfWeek(addDays(now, -30)),
        end: endOfWeek(addDays(now, 120)),
      };
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
      start: startOfWeek(addDays(minDate, -21)),
      end: endOfWeek(addDays(maxDate, 21)),
    };
  }, [milestones]);

  // Generate timeline columns
  const timelineColumns = useMemo(() => {
    if (viewMode === "weeks") {
      return eachWeekOfInterval({
        start: timelineBounds.start,
        end: timelineBounds.end,
      });
    } else {
      return eachMonthOfInterval({
        start: startOfMonth(timelineBounds.start),
        end: endOfMonth(timelineBounds.end),
      });
    }
  }, [timelineBounds, viewMode]);

  // Group milestones by project
  const groupedMilestones = useMemo(() => {
    return milestones.reduce(
      (acc, milestone) => {
        const projectKey = milestone.project?.name || "No Project";
        if (!acc[projectKey]) {
          acc[projectKey] = [];
        }
        acc[projectKey].push(milestone);
        return acc;
      },
      {} as Record<string, any[]>
    );
  }, [milestones]);

  // Calculate milestone position and width
  const getMilestonePosition = (milestone: any) => {
    const startDate = milestone.startDate
      ? new Date(milestone.startDate)
      : null;
    const endDate = milestone.endDate ? new Date(milestone.endDate) : null;

    if (!startDate || !endDate) return null;

    const totalDays = differenceInDays(
      timelineBounds.end,
      timelineBounds.start
    );
    const startOffset = differenceInDays(startDate, timelineBounds.start);
    const duration = differenceInDays(endDate, startDate);

    if (startOffset < 0 || startOffset > totalDays) return null;

    const left = (startOffset / totalDays) * 100;
    const width = Math.max((duration / totalDays) * 100, 0.5);

    return { left: `${left}%`, width: `${width}%` };
  };

  // Status colors using shadcn theme
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "at-risk":
        return "bg-orange-500";
      case "delayed":
        return "bg-red-500";
      case "in-progress":
        return "bg-blue-500";
      default:
        return "bg-muted";
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
        return status;
    }
  };

  const toggleProjectCollapse = (projectName: string) => {
    const newCollapsed = new Set(collapsedProjects);
    if (newCollapsed.has(projectName)) {
      newCollapsed.delete(projectName);
    } else {
      newCollapsed.add(projectName);
    }
    setCollapsedProjects(newCollapsed);
  };

  const renderTodayIndicator = () => {
    const today = new Date();
    const totalDays = differenceInDays(
      timelineBounds.end,
      timelineBounds.start
    );
    const todayOffset = differenceInDays(today, timelineBounds.start);

    if (todayOffset < 0 || todayOffset > totalDays) return null;

    const left = (todayOffset / totalDays) * 100;

    return (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
        style={{ left: `${left}%` }}
      >
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
      </div>
    );
  };

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed"
  ).length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold">Untitled Project</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalMilestones} milestones
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Filter className="h-4 w-4" />
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "weeks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("weeks")}
              className="h-8 px-3 text-xs"
            >
              Weeks
            </Button>
            <Button
              variant={viewMode === "months" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("months")}
              className="h-8 px-3 text-xs"
            >
              Months
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="h-8 px-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Timeline Header */}
        <div className="flex border-b bg-muted/30 sticky top-0 z-10">
          <div className="w-80 flex-shrink-0 border-r bg-background">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                  Title
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Duration
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1" orientation="horizontal">
            <div className="flex min-w-max">
              {timelineColumns.map((date, index) => (
                <div
                  key={date.getTime()}
                  className="flex-shrink-0 w-32 border-r border-border/30 px-3 py-3 text-center"
                >
                  <div className="text-xs font-medium">
                    {viewMode === "weeks"
                      ? format(date, "MMM d")
                      : format(date, "MMM yyyy")}
                  </div>
                  {viewMode === "weeks" && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(date, "EEE")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Timeline Content */}
        <ScrollArea className="flex-1">
          <div className="flex">
            {/* Left sidebar */}
            <div className="w-80 flex-shrink-0 border-r bg-background">
              {Object.entries(groupedMilestones).map(
                ([projectName, projectMilestones]) => {
                  const isCollapsed = collapsedProjects.has(projectName);
                  const totalItems = projectMilestones.reduce(
                    (sum, m) =>
                      sum + (m.issueCount || 0) + (m.featureCount || 0),
                    0
                  );
                  const completedItems = projectMilestones.reduce(
                    (sum, m) =>
                      sum +
                      (m.completedIssueCount || 0) +
                      (m.completedFeatureCount || 0),
                    0
                  );
                  const overallProgress =
                    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                  return (
                    <div key={projectName}>
                      {/* Project Header */}
                      <div className="border-b">
                        <div className="px-4 py-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleProjectCollapse(projectName)
                                }
                                className="h-5 w-5 p-0 hover:bg-muted"
                              >
                                {isCollapsed ? (
                                  <ChevronRight className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </Button>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {projectName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {projectMilestones.length} milestone
                                  {projectMilestones.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <div className="text-sm font-medium">
                                {Math.round(overallProgress)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Milestone Items */}
                      {!isCollapsed &&
                        projectMilestones.map((milestone) => (
                          <div key={milestone._id} className="border-b">
                            <div className="px-4 py-3 pl-8 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(milestone.status)}
                                      <span className="text-sm font-medium truncate">
                                        {milestone.name}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {Math.round(milestone.progress || 0)}%
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {milestone.startDate && milestone.endDate
                                      ? `${format(new Date(milestone.startDate), "MMM d")} - ${format(new Date(milestone.endDate), "MMM d")}`
                                      : "No dates set"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  <div className="text-xs text-muted-foreground">
                                    {milestone.startDate &&
                                      milestone.endDate &&
                                      `${differenceInDays(new Date(milestone.endDate), new Date(milestone.startDate))} days`}
                                  </div>
                                  {milestone.owner && (
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage
                                        src={milestone.owner.image}
                                        alt={milestone.owner.name}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {milestone.owner.name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                }
              )}

              {milestones.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No milestones to display</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right timeline area */}
            <ScrollArea className="flex-1" orientation="horizontal">
              <div className="relative min-w-max">
                {Object.entries(groupedMilestones).map(
                  ([projectName, projectMilestones]) => {
                    const isCollapsed = collapsedProjects.has(projectName);
                    const totalItems = projectMilestones.reduce(
                      (sum, m) =>
                        sum + (m.issueCount || 0) + (m.featureCount || 0),
                      0
                    );
                    const completedItems = projectMilestones.reduce(
                      (sum, m) =>
                        sum +
                        (m.completedIssueCount || 0) +
                        (m.completedFeatureCount || 0),
                      0
                    );
                    const overallProgress =
                      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                    return (
                      <div key={projectName}>
                        {/* Project row */}
                        <div
                          className="border-b relative"
                          style={{ width: `${timelineColumns.length * 128}px` }}
                        >
                          <div className="h-[61px] relative">
                            {/* Grid lines */}
                            {timelineColumns.map((_, index) => (
                              <div
                                key={index}
                                className="absolute top-0 bottom-0 border-r border-border/20"
                                style={{ left: `${index * 128}px` }}
                              />
                            ))}

                            {/* Project progress bar */}
                            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2">
                              <Progress
                                value={overallProgress}
                                className="h-2"
                              />
                            </div>

                            {renderTodayIndicator()}
                          </div>
                        </div>

                        {/* Milestone rows */}
                        {!isCollapsed &&
                          projectMilestones.map((milestone) => {
                            const position = getMilestonePosition(milestone);

                            return (
                              <div
                                key={milestone._id}
                                className="border-b relative"
                                style={{
                                  width: `${timelineColumns.length * 128}px`,
                                }}
                              >
                                <div className="h-[61px] relative">
                                  {/* Grid lines */}
                                  {timelineColumns.map((_, index) => (
                                    <div
                                      key={index}
                                      className="absolute top-0 bottom-0 border-r border-border/20"
                                      style={{ left: `${index * 128}px` }}
                                    />
                                  ))}

                                  {/* Milestone bar */}
                                  {position && (
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <div
                                          className={cn(
                                            "absolute top-1/2 -translate-y-1/2 h-5 rounded-sm cursor-pointer transition-all hover:shadow-sm hover:scale-105",
                                            getStatusColor(milestone.status)
                                          )}
                                          style={{
                                            left: position.left,
                                            width: position.width,
                                            minWidth: "24px",
                                          }}
                                          onClick={() =>
                                            onMilestoneClick?.(milestone)
                                          }
                                        >
                                          <div className="flex items-center h-full px-2 gap-1 text-white">
                                            {getStatusIcon(milestone.status)}
                                            <span className="text-xs font-medium truncate">
                                              {milestone.name}
                                            </span>
                                          </div>

                                          {/* Progress indicator */}
                                          {(milestone.progress || 0) > 0 && (
                                            <div
                                              className="absolute bottom-0 left-0 h-0.5 bg-white/50 rounded-sm"
                                              style={{
                                                width: `${milestone.progress || 0}%`,
                                              }}
                                            />
                                          )}
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent
                                        className="w-80"
                                        side="top"
                                      >
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="text-sm font-semibold">
                                              {milestone.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                              {milestone.project?.name}
                                            </p>
                                          </div>
                                          {milestone.description && (
                                            <p className="text-xs text-muted-foreground">
                                              {milestone.description}
                                            </p>
                                          )}
                                          <div className="flex items-center justify-between text-xs">
                                            <span>Progress</span>
                                            <span className="font-medium">
                                              {Math.round(
                                                milestone.progress || 0
                                              )}
                                              %
                                            </span>
                                          </div>
                                          <Progress
                                            value={milestone.progress || 0}
                                            className="h-2"
                                          />
                                          <div className="flex items-center justify-between text-xs">
                                            <span>Status</span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {getStatusText(milestone.status)}
                                            </Badge>
                                          </div>
                                          {milestone.startDate &&
                                            milestone.endDate && (
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                  {format(
                                                    new Date(
                                                      milestone.startDate
                                                    ),
                                                    "MMM d, yyyy"
                                                  )}{" "}
                                                  -{" "}
                                                  {format(
                                                    new Date(milestone.endDate),
                                                    "MMM d, yyyy"
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  )}

                                  {renderTodayIndicator()}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  }
                )}
              </div>
            </ScrollArea>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
