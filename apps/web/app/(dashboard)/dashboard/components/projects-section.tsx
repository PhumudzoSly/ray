"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Clock,
  ArrowRight,
  CheckCircle,
  BarChart,
  AlertCircle,
  Globe,
  Smartphone,
  Server,
  Puzzle,
  Monitor,
  Terminal,
  Plus,
  Folder,
  Activity,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

const platformIcons: Record<string, any> = {
  web: Globe,
  mobile: Smartphone,
  both: Globe,
  api: Server,
  plugin: Puzzle,
  desktop: Monitor,
  cli: Terminal,
};

const getStatusConfig = (status?: string) => {
  switch (status) {
    case "completed":
      return {
        color: "bg-green-500",
        label: "Completed",
        variant: "success" as const,
        bgClass:
          "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
      };
    case "in-progress":
      return {
        color: "bg-blue-500",
        label: "In Progress",
        variant: "default" as const,
        bgClass:
          "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
      };
    case "review":
      return {
        color: "bg-purple-500",
        label: "Review",
        variant: "secondary" as const,
        bgClass:
          "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800",
      };
    default:
      return {
        color: "bg-gray-500",
        label: "Planning",
        variant: "outline" as const,
        bgClass:
          "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800",
      };
  }
};

interface ProjectsSectionProps {
  projects: any[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
}) => {
  // Group projects by status
  const projectsByStatus: Record<string, any[]> = {
    "in-progress": [],
    planning: [],
    review: [],
    completed: [],
  };

  projects.forEach((project) => {
    const status = project.status || "planning";
    projectsByStatus[status] = [...(projectsByStatus[status] || []), project];
  });

  // Calculate completion percentages
  const projectCounts = {
    total: projects.length,
    inProgress: projectsByStatus["in-progress"]?.length || 0,
    planning: projectsByStatus["planning"]?.length || 0,
    review: projectsByStatus["review"]?.length || 0,
    completed: projectsByStatus["completed"]?.length || 0,
  };

  const completionPercent =
    projectCounts.total > 0
      ? Math.round((projectCounts.completed / projectCounts.total) * 100)
      : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-normal">Projects</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completionPercent} className="h-2" />

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{projectCounts.planning}</div>
            <div className="text-xs text-muted-foreground">Planning</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{projectCounts.inProgress}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{projectCounts.review}</div>
            <div className="text-xs text-muted-foreground">Review</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{projectCounts.completed}</div>
            <div className="text-xs text-muted-foreground">Done</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No projects yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.slice(0, 4).map((project) => {
                const PlatformIcon = platformIcons[project.platform] || Globe;
                const status = project.status || "planning";
                const statusConfig = getStatusConfig(status);

                return (
                  <Link key={project._id} href={`/project/${project._id}`}>
                    <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                            <PlatformIcon className="h-5 w-5 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {project.name}
                                </h4>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <Badge
                                  variant={statusConfig.variant}
                                  className="text-xs font-medium"
                                >
                                  {statusConfig.label}
                                </Badge>
                                {project.metrics?.totalNodes > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {project.metrics.totalNodes} nodes
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(project.updatedAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                </div>
                                {project.platform && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {project.platform}
                                  </Badge>
                                )}
                              </div>

                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
