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
  // Enhanced metrics from database
  const metrics = project.metrics || {};
  const totalIssues = metrics.totalIssues || 0;
  const openIssues = metrics.openIssues || 0;
  const totalFeatures = metrics.totalFeatures || 0;
  const completedFeatures = metrics.completedFeatures || 0;
  const hasLaunchPlan = metrics.hasLaunchPlan || false;
  const launchReadinessScore = metrics.launchReadinessScore || 0;

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
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
          p._id === projectId ? { ...p, ...updates } : p
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
                      projectId: project._id,
                      updates: { platform: value },
                    });
                  }}
                  iconOnly
                />{" "}
                <p className="text-sm font-medium whitespace-pre-line line-clamp-1">
                  {project.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Stats - Enhanced */}
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
              {openIssues > 0 && (
                <span className="text-orange-600">({openIssues} open)</span>
              )}
            </div>
          </div>

          {/* Launch Readiness */}
          <div className="flex items-center justify-between p-2 bg-muted dark:bg-muted/30 rounded-md">
            <div className="flex items-center gap-2">
              <Rocket className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium">Launch Readiness</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold ${getReadinessColor(launchReadinessScore)}`}
              >
                {launchReadinessScore}%
              </span>
              {hasLaunchPlan && (
                <CheckCircle className="w-3 h-3 text-green-600" />
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project?.auth.split(" ")[0]}
            </Badge>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project?.orm}
            </Badge>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project?.database.split(" ")[0]}
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
              <Link href={`/project/${project._id}`}>Open</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
