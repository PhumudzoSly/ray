"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  Plus,
  Activity,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingIssuesProps {
  issues: any[];
}

const priorityConfig: Record<
  string,
  {
    color: string;
    bg: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  LOW: {
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800",
    icon: <CheckCircle className="h-3 w-3" />,
    label: "Low",
  },
  MEDIUM: {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
    icon: <Clock className="h-3 w-3" />,
    label: "Medium",
  },
  HIGH: {
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800",
    icon: <AlertCircle className="h-3 w-3" />,
    label: "High",
  },
  CRITICAL: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800",
    icon: <AlertCircle className="h-3 w-3" />,
    label: "Critical",
  },
};

export const UpcomingIssues: React.FC<UpcomingIssuesProps> = ({ issues }) => {
  // Get issues due in the next 7 days
  const now = new Date();
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(now.getDate() + 7);

  const upcomingIssues = issues.filter((issue) => {
    if (!issue.dueDate) return false;
    const dueDate = new Date(issue.dueDate);
    return (
      dueDate >= now && dueDate <= oneWeekFromNow && issue.status !== "DONE"
    );
  });

  // Sort by due date
  upcomingIssues.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const criticalCount = upcomingIssues.filter(
    (issue) => issue.priority === "CRITICAL"
  ).length;
  const highCount = upcomingIssues.filter(
    (issue) => issue.priority === "HIGH"
  ).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Due Soon</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {(criticalCount > 0 || highCount > 0) && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {criticalCount + highCount} urgent
              </Badge>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/issues">
                All Issues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {upcomingIssues.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>{upcomingIssues.length} issues due this week</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {upcomingIssues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <div className="space-y-2">
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No issues due in the next 7 days</p>
            </div>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/issues">
                <Plus className="w-4 h-4 mr-2" />
                Create Issue
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingIssues.slice(0, 5).map((issue, index) => {
              const priority = issue.priority || "LOW";
              const config = priorityConfig[priority];
              const dueDate = new Date(issue.dueDate);
              const isOverdue = dueDate < now;
              const isToday = dueDate.toDateString() === now.toDateString();
              const isTomorrow =
                dueDate.toDateString() ===
                new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

              return (
                <Link key={issue._id} href={`/issues/${issue._id}`}>
                  <Card
                    className={cn(
                      "transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer group",
                      "border-l-4",
                      priority === "CRITICAL"
                        ? "border-l-red-500"
                        : priority === "HIGH"
                          ? "border-l-orange-500"
                          : priority === "MEDIUM"
                            ? "border-l-blue-500"
                            : "border-l-green-500",
                      isOverdue
                        ? "bg-red-50/50 dark:bg-red-950/10"
                        : isToday
                          ? "bg-yellow-50/50 dark:bg-yellow-950/10"
                          : ""
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {issue.title}
                            </h4>
                            {issue.project && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {issue.project.name}
                              </p>
                            )}
                          </div>

                          <Badge
                            className={cn(
                              "text-xs font-medium border",
                              config.bg,
                              config.color
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {config.icon}
                              {config.label}
                            </div>
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {issue.label && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {issue.label}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex items-center gap-1 text-xs font-medium",
                                isOverdue
                                  ? "text-red-600"
                                  : isToday
                                    ? "text-orange-600"
                                    : isTomorrow
                                      ? "text-yellow-600"
                                      : "text-muted-foreground"
                              )}
                            >
                              <Clock className="h-3 w-3" />
                              <span>
                                {isOverdue
                                  ? "Overdue"
                                  : isToday
                                    ? "Today"
                                    : isTomorrow
                                      ? "Tomorrow"
                                      : format(dueDate, "MMM d")}
                              </span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {upcomingIssues.length > 5 && (
              <div className="pt-2">
                <Separator className="mb-4" />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/issues?filter=upcoming">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View {upcomingIssues.length - 5} more due soon
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
