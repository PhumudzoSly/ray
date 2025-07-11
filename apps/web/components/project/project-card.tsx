import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreVertical,
  Workflow,
  BarChart3,
  Clock,
  Bug,
  FileText,
  Rocket,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const PROJECT_STATUSES = [
  { id: "planning", label: "Planning", color: "bg-blue-500" },
  { id: "in-progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "review", label: "Review", color: "bg-purple-500" },
  { id: "completed", label: "Completed", color: "bg-green-500" },
];

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "planning":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "review":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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
  const nodeCount = project.flowData?.nodes?.length || 0;
  const edgeCount = project.flowData?.edges?.length || 0;

  // Enhanced metrics from database
  const metrics = project.metrics || {};
  const totalIssues = metrics.totalIssues || 0;
  const openIssues = metrics.openIssues || 0;
  const totalFeatures = metrics.totalFeatures || 0;
  const completedFeatures = metrics.completedFeatures || 0;
  const totalPrds = metrics.totalPrds || 0;
  const hasLaunchPlan = metrics.hasLaunchPlan || false;
  const launchReadinessScore = metrics.launchReadinessScore || 0;

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${
        isDragging ? "shadow-xl border-primary" : ""
      } ${variant === "table" ? "mb-2" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">
                {project.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {project.platform}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/project/${project._id}`}>Open Project</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(project)}
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Stats - Enhanced */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Workflow className="w-3 h-3 text-muted-foreground" />
              <span>{nodeCount} nodes</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-muted-foreground" />
              <span>{edgeCount} connections</span>
            </div>
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

          {/* Additional Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span>{totalPrds} PRDs</span>
            </div>
          </div>

          {/* Launch Readiness */}
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
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
              {project.techStack.auth.split(" ")[0]}
            </Badge>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project.techStack.orm}
            </Badge>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {project.techStack.database.split(" ")[0]}
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
