"use client";

import { useQuery } from "@tanstack/react-query";
import { getMilestoneMetrics } from "@/actions/project/analytics";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneMetricsProps {
  projectId: string;
}

const getHealthStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "text-green-600 bg-green-50 border-green-200";
    case "good":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "fair":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "poor":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};

const getHealthIcon = (status: string) => {
  switch (status) {
    case "excellent":
      return <TrendingUp className="h-4 w-4" />;
    case "critical":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

export function MilestoneMetrics({ projectId }: MilestoneMetricsProps) {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["milestone-metrics", projectId],
    queryFn: () => getMilestoneMetrics(projectId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Milestone Progress</h2>
          </div>
          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-2 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Milestone Progress</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          Failed to load milestone metrics
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Milestone Progress</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium border",
              getHealthStatusColor(metrics.milestoneHealthStatus)
            )}
          >
            {getHealthIcon(metrics.milestoneHealthStatus)}
            {metrics.milestoneHealthScore}%
          </Badge>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="space-y-3 border p-2 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Completion</span>
          <span className="text-sm text-muted-foreground">
            {metrics.milestoneCompletionRate}%
          </span>
        </div>
        <Progress value={metrics.milestoneCompletionRate} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {metrics.completedMilestones} of {metrics.totalMilestones} milestones
          completed
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2 p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {metrics.completedMilestones}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </div>
        </div>

        <div className="space-y-2 p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {metrics.inProgressMilestones}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </div>
        </div>

        <div className="space-y-2 p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{metrics.atRiskMilestones}</div>
            <p className="text-xs text-muted-foreground">May miss deadline</p>
          </div>
        </div>

        <div className="space-y-2 p-3 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {metrics.delayedMilestones}
            </div>
            <p className="text-xs text-muted-foreground">Behind schedule</p>
          </div>
        </div>
      </div>
    </div>
  );
}
