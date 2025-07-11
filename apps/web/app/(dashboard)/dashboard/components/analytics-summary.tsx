"use client";
import React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart,
  FileText,
  Workflow,
  AlertCircle,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsSummaryProps {
  stats: any;
}

const ReadinessCard = ({
  score,
  label,
  icon,
  count,
}: {
  score: number;
  label: string;
  icon: React.ReactNode;
  count: number;
}) => {
  const getScoreConfig = (score: number) => {
    if (score >= 80)
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-400",
        ring: "ring-green-500/20",
      };
    if (score >= 50)
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-700 dark:text-yellow-400",
        ring: "ring-yellow-500/20",
      };
    return {
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-400",
      ring: "ring-red-500/20",
    };
  };

  const config = getScoreConfig(score);

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        config.bg,
        config.border
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              score >= 80
                ? "bg-green-100 dark:bg-green-900/40"
                : score >= 50
                  ? "bg-yellow-100 dark:bg-yellow-900/40"
                  : "bg-red-100 dark:bg-red-900/40"
            )}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tabular-nums">{count}</div>
              <Badge
                variant="outline"
                className={cn("text-xs font-medium", config.text, config.bg)}
              >
                {score >= 80 ? "Ready" : score >= 50 ? "Almost" : "Needs Work"}
              </Badge>
            </div>
            <div className="text-sm font-medium text-foreground/80 mt-1">
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  description,
  color = "text-blue-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  color?: string;
}) => (
  <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-muted/50", color)}>{icon}</div>
        <div>
          <div className="text-lg font-bold tabular-nums">{value}</div>
          <div className="text-sm font-medium text-foreground/80">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  stats,
}) => {
  // Simulated launch readiness data
  const projectsWithMetrics =
    stats?.projects?.filter((p: any) => p.metrics) || [];

  // Average launch readiness score across projects
  const avgLaunchReadiness =
    projectsWithMetrics.length > 0
      ? Math.round(
          projectsWithMetrics.reduce(
            (sum: number, p: any) =>
              sum + (p.metrics?.launchReadinessScore || 0),
            0
          ) / projectsWithMetrics.length
        )
      : 0;

  // Calculate count by readiness levels
  const readyProjects = projectsWithMetrics.filter(
    (p: any) => p.metrics?.launchReadinessScore >= 80
  ).length;
  const almostReadyProjects = projectsWithMetrics.filter(
    (p: any) =>
      p.metrics?.launchReadinessScore >= 50 &&
      p.metrics?.launchReadinessScore < 80
  ).length;
  const notReadyProjects = projectsWithMetrics.filter(
    (p: any) => p.metrics?.launchReadinessScore < 50
  ).length;

  // Calculate average scores for each readiness category
  const readyProjectsData = projectsWithMetrics.filter(
    (p: any) => p.metrics?.launchReadinessScore >= 80
  );
  const almostReadyProjectsData = projectsWithMetrics.filter(
    (p: any) =>
      p.metrics?.launchReadinessScore >= 50 &&
      p.metrics?.launchReadinessScore < 80
  );
  const notReadyProjectsData = projectsWithMetrics.filter(
    (p: any) => p.metrics?.launchReadinessScore < 50
  );

  const avgReadyScore =
    readyProjectsData.length > 0
      ? Math.round(
          readyProjectsData.reduce(
            (sum: number, p: any) =>
              sum + (p.metrics?.launchReadinessScore || 0),
            0
          ) / readyProjectsData.length
        )
      : 85; // Default fallback for styling consistency

  const avgAlmostReadyScore =
    almostReadyProjectsData.length > 0
      ? Math.round(
          almostReadyProjectsData.reduce(
            (sum: number, p: any) =>
              sum + (p.metrics?.launchReadinessScore || 0),
            0
          ) / almostReadyProjectsData.length
        )
      : 65; // Default fallback for styling consistency

  const avgNotReadyScore =
    notReadyProjectsData.length > 0
      ? Math.round(
          notReadyProjectsData.reduce(
            (sum: number, p: any) =>
              sum + (p.metrics?.launchReadinessScore || 0),
            0
          ) / notReadyProjectsData.length
        )
      : 35; // Default fallback for styling consistency

  const getReadinessIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (score >= 50)
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return "Ready to launch";
    if (score >= 50) return "Almost ready";
    return "Needs more work";
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Overall Launch Readiness */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">Launch Readiness</span>
          </div>
          <Badge variant="outline" className="text-xs bg-background">
            <Activity className="w-3 h-3 mr-1" />
            Live metrics
          </Badge>
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getReadinessIcon(avgLaunchReadiness)}
                <div>
                  <span className="text-sm font-medium text-foreground/80">
                    Average Readiness Score
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getReadinessLabel(avgLaunchReadiness)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-3xl font-bold tabular-nums",
                    getReadinessColor(avgLaunchReadiness)
                  )}
                >
                  {avgLaunchReadiness}%
                </div>
              </div>
            </div>
            <Progress value={avgLaunchReadiness} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* Project Status Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">Project Status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReadinessCard
            score={avgReadyScore}
            label="Ready Projects"
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            count={readyProjects}
          />

          <ReadinessCard
            score={avgAlmostReadyScore}
            label="Almost Ready"
            icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
            count={almostReadyProjects}
          />

          <ReadinessCard
            score={avgNotReadyScore}
            label="Needs Work"
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            count={notReadyProjects}
          />
        </div>
      </div>

      <Separator />

      {/* Key Metrics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">Key Metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={<Workflow className="h-5 w-5" />}
            label="Flow Nodes"
            value={
              stats?.projects?.reduce(
                (sum: number, p: any) => sum + (p.metrics?.totalNodes || 0),
                0
              ) || 0
            }
            description="Total workflow nodes"
            color="text-blue-500"
          />

          <MetricCard
            icon={<FileText className="h-5 w-5" />}
            label="PRDs Created"
            value={
              stats?.projects?.reduce(
                (sum: number, p: any) => sum + (p.metrics?.totalPrds || 0),
                0
              ) || 0
            }
            description="Product requirements"
            color="text-purple-500"
          />

          <MetricCard
            icon={<AlertCircle className="h-5 w-5" />}
            label="Open Issues"
            value={
              stats?.projects?.reduce(
                (sum: number, p: any) => sum + (p.metrics?.openIssues || 0),
                0
              ) || 0
            }
            description="Issues to resolve"
            color="text-orange-500"
          />
        </div>
      </div>
    </div>
  );
};
