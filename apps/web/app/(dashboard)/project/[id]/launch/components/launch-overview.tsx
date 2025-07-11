"use client";

import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { CheckSquare, Target, Clock, MessageSquare } from "lucide-react";

interface ChecklistItem {
  _id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "skipped";
  isRequired: boolean;
  category: string;
  order: number;
  dueDate?: string;
}

interface CopyItem {
  platform: string;
  title: string;
  tagline?: string;
  description: string;
  hashtags?: string[];
  isApproved: boolean;
  version: number;
}

interface LaunchOverviewProps {
  checklistItems: ChecklistItem[];
  copyItems: CopyItem[];
  launchStatus: string;
}

export function LaunchOverview({
  checklistItems,
  copyItems,
  launchStatus,
}: LaunchOverviewProps) {
  // Calculate progress metrics
  const totalItems = checklistItems.length;
  const completedItems = checklistItems.filter(
    (item) => item.status === "completed"
  ).length;
  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const requiredItems = checklistItems.filter((item) => item.isRequired);
  const completedRequired = requiredItems.filter(
    (item) => item.status === "completed"
  ).length;
  const requiredProgress =
    requiredItems.length > 0
      ? Math.round((completedRequired / requiredItems.length) * 100)
      : 100;

  // Group by category for breakdown
  const categoryBreakdown = checklistItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { total: 0, completed: 0 };
      }
      acc[item.category].total++;
      if (item.status === "completed") {
        acc[item.category].completed++;
      }
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>
  );

  const getReadinessStatus = () => {
    if (requiredProgress === 100 && progress >= 80)
      return { label: "Ready", variant: "default" as const };
    if (progress >= 50)
      return { label: "Almost Ready", variant: "secondary" as const };
    return { label: "Not Ready", variant: "destructive" as const };
  };

  const readiness = getReadinessStatus();

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Overall Progress</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedItems} of {totalItems} completed
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Required Items</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{requiredProgress}%</div>
            <Progress value={requiredProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedRequired} of {requiredItems.length} required
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Launch Status</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {launchStatus === "launched" ? "Live" : "Prep"}
            </div>
            <Badge variant={readiness.variant} className="text-xs">
              {readiness.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Platform Copy</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{copyItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {copyItems.filter((item) => item.isApproved).length} approved
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Category Progress</h3>
        <div className="space-y-2">
          {Object.entries(categoryBreakdown).map(([category, stats]) => {
            const percentage = Math.round(
              (stats.completed / stats.total) * 100
            );
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm capitalize">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={percentage} className="h-1 w-16" />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
