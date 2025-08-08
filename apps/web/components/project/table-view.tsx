import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreVertical,
  Clock,
  ExternalLink,
  Bug,
  Rocket,
  CheckCircle,
  Star,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getProjects } from "@/actions/project";
import { useQuery } from "@tanstack/react-query";

const PROJECT_STATUSES = [
  { id: "planning", label: "Planning", color: "bg-blue-500" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "review", label: "Review", color: "bg-purple-500" },
  { id: "completed", label: "Completed", color: "bg-green-500" },
];

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "planning":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "review":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

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

interface TableViewProps {
  onEditProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
}

export function TableView({ onEditProject, onDeleteProject }: TableViewProps) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return await getProjects();
    },
  });

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
            <TableHead>Health</TableHead>
            <TableHead>Tech Stack</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Issues</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects?.map((project) => {
            // Use health metrics from the new system
            const healthMetrics = project.healthMetrics;
            const totalIssues = healthMetrics?.totalIssues || 0;
            const completedIssues = healthMetrics?.completedIssues || 0;
            const blockedIssues = healthMetrics?.blockedIssues || 0;
            const totalFeatures = healthMetrics?.totalFeatures || 0;
            const completedFeatures = healthMetrics?.completedFeatures || 0;
            const inProgressFeatures = healthMetrics?.inProgressFeatures || 0;
            const healthScore = healthMetrics?.overallHealthScore || 0;
            const healthStatus = healthMetrics?.healthStatus || "fair";

            return (
              <TableRow key={project.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/project/${project.id}`}
                      className="font-medium hover:text-primary whitespace-nowrap transition-colors"
                    >
                      {project.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {project.platform === "both"
                      ? "Web & Mobile"
                      : project?.platform}
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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getHealthStatusColor(healthStatus)}`}
                    >
                      {healthScore}%
                    </Badge>
                    {healthStatus === "excellent" && (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex  gap-1">
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {project?.auth}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {project?.orm}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {project?.database}
                    </Badge>
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
                    {inProgressFeatures > 0 && (
                      <span className="text-blue-600 text-xs">
                        ({inProgressFeatures} in dev)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Bug className="w-3 h-3 text-muted-foreground" />
                    <span>{totalIssues}</span>
                    {completedIssues > 0 && (
                      <span className="text-green-600 text-xs">
                        ({completedIssues} done)
                      </span>
                    )}
                    {blockedIssues > 0 && (
                      <span className="text-red-600 text-xs">
                        ({blockedIssues} blocked)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm whitespace-nowrap text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(project.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/project/${project.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon-sm",
                    })}
                  >
                    <Eye />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {projects?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-sm">No projects found</div>
        </div>
      )}
    </div>
  );
}
