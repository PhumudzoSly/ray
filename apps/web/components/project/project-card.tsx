import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Clock,
  Bug,
  Rocket,
  CheckCircle,
  Star,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ProjectTypeSelector } from "../ui/selectors/project-type-selector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectActions from "@/actions/project";
import { toast } from "sonner";

interface ProjectCardProps {
  project: any;
  variant?: "kanban" | "table";
  isDragging?: boolean;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
}

export function ProjectCard({
  project,
  variant = "kanban",
  isDragging = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  // Use health metrics from the new system
  const healthMetrics = project.healthMetrics;
  const totalIssues = healthMetrics?.totalIssues || 0;
  const completedIssues = healthMetrics?.completedIssues || 0;
  const blockedIssues = healthMetrics?.blockedIssues || 0;
  const totalFeatures = healthMetrics?.totalFeatures || 0;
  const completedFeatures = healthMetrics?.completedFeatures || 0;
  const inProgressFeatures = healthMetrics?.inProgressFeatures || 0;
  const healthScore = healthMetrics?.overallHealthScore || 0;
  const healthStatus = healthMetrics?.healthStatus || 'fair';

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "poor":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case "critical":
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const queryClient = useQueryClient();
  // TanStack mutation for updating a project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: any }) => {
      return await projectActions.updateProject(projectId, updates);
    },
    onMutate: async ({ projectId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<any[]>(["projects"]);
      queryClient.setQueryData<any[]>(["projects"], (old) => {
        if (!old) return old;
        return old.map((p) =>
          p.id === projectId ? { ...p, ...updates } : p
        );
      });
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
      toast.error("Failed to update project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${isDragging ? "shadow-xl border-primary" : ""
        } ${variant === "table" ? "mb-2" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-sm flex items-center gap-2 font-medium whitespace-pre-line line-clamp-1">
                <ProjectTypeSelector
                  selectedType={project.platform}
                  onChange={async (value) => {
                    updateProjectMutation.mutate({
                      projectId: project.id,
                      updates: { platform: value },
                    });
                  }}
                  iconOnly
                />{" "}
                <p className="text-sm font-medium whitespace-pre-line line-clamp-1">
                  {project.name}
                </p>
              </div>
              {/* Health indicator */}
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${getHealthStatusColor(healthStatus)}`}
                >
                  {healthScore}%
                </Badge>
                {getHealthIcon(healthStatus)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Stats - Enhanced with health metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-muted-foreground" />
              <span>{totalFeatures} features</span>
              {completedFeatures > 0 && (
                <span className="text-green-600">
                  ({completedFeatures} done)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Bug className="w-3 h-3 text-muted-foreground" />
              <span>{totalIssues} issues</span>
              {completedIssues > 0 && (
                <span className="text-green-600">({completedIssues} done)</span>
              )}
            </div>
          </div>

          {/* Progress indicators */}
          {(inProgressFeatures > 0 || blockedIssues > 0) && (
            <div className="space-y-1">
              {inProgressFeatures > 0 && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Star className="w-3 h-3" />
                  <span>{inProgressFeatures} features in development</span>
                </div>
              )}
              {blockedIssues > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{blockedIssues} issues blocked</span>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project?.auth}
            </Badge>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project?.orm}
            </Badge>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project?.database}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(project.updatedAt), {
                addSuffix: true,
              })}
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/project/${project.id}`}>Open</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
