import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
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
  ExternalLink,
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

interface TableViewProps {
  projects: any[];
  onEditProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
}

export function TableView({
  projects,
  onEditProject,
  onDeleteProject,
}: TableViewProps) {
  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tech Stack</TableHead>
            <TableHead>Flow Stats</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Issues</TableHead>
            <TableHead>PRDs</TableHead>
            <TableHead>Launch Ready</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const nodeCount = project.flowData?.nodes?.length || 0;
            const edgeCount = project.flowData?.edges?.length || 0;

            // Enhanced metrics from database
            const metrics = project.metrics || {};
            const totalIssues = metrics.totalIssues || 0;
            const openIssues = metrics.openIssues || 0;
            const completedIssues = metrics.completedIssues || 0;
            const totalFeatures = metrics.totalFeatures || 0;
            const completedFeatures = metrics.completedFeatures || 0;
            const inProgressFeatures = metrics.inProgressFeatures || 0;
            const totalPrds = metrics.totalPrds || 0;
            const hasLaunchPlan = metrics.hasLaunchPlan || false;
            const launchReadinessScore = metrics.launchReadinessScore || 0;

            return (
              <TableRow key={project._id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/project/${project._id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {project.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {project.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColorClass(project.status || "planning")}`}
                  >
                    {
                      PROJECT_STATUSES.find(
                        (s) => s.id === (project.status || "planning")
                      )?.label
                    }
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {project.techStack.auth.split(" ")[0]}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {project.techStack.orm}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {project.techStack.database.split(" ")[0]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Workflow className="w-3 h-3" />
                      <span>{nodeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>{edgeCount}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-muted-foreground" />
                    <span>{totalFeatures}</span>
                    {completedFeatures > 0 && (
                      <span className="text-green-600 text-xs">
                        ({completedFeatures} done)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Bug className="w-3 h-3 text-muted-foreground" />
                    <span>{totalIssues}</span>
                    {openIssues > 0 && (
                      <span className="text-orange-600 text-xs">
                        ({openIssues} open)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span>{totalPrds}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Rocket className="w-3 h-3 text-muted-foreground" />
                    <span
                      className={`text-sm font-medium ${getReadinessColor(launchReadinessScore)}`}
                    >
                      {launchReadinessScore}%
                    </span>
                    {hasLaunchPlan && (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(project.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/project/${project._id}`}
                          className="flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEditProject?.(project)}
                      >
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeleteProject?.(project)}
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-sm">No projects found</div>
        </div>
      )}
    </div>
  );
}
