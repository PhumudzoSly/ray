"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import * as featureActions from "@/actions/features";
import { useSession } from "@/context/session-context";
import { Id } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";

interface DependencyOverviewProps {
  projectId: Id<"projects">;
}

const DependencyOverview: React.FC<DependencyOverviewProps> = ({
  projectId,
}) => {
  const { token } = useSession();

  const { data: stats, isPending } = useQuery({
    queryKey: ["projectDependencyStats", projectId],
    queryFn: () => featureActions.getProjectDependencyStats(projectId),
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Unable to load dependency statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  const completionRate =
    stats.totalFeatures > 0
      ? (stats.completableFeatures / stats.totalFeatures) * 100
      : 0;

  const dependencyDensity =
    stats.totalFeatures > 0
      ? (stats.totalDependencies / stats.totalFeatures) * 100
      : 0;

  const getHealthStatus = () => {
    if (stats.blockedFeatures === 0) return "healthy";
    if (stats.blockedFeatures <= stats.totalFeatures * 0.2) return "warning";
    return "critical";
  };

  const healthStatus = getHealthStatus();

  const getHealthColor = () => {
    switch (healthStatus) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthIcon = () => {
    switch (healthStatus) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Status Alert */}
      <Alert
        className={`border-l-4 ${healthStatus === "healthy"
            ? "border-l-green-500"
            : healthStatus === "warning"
              ? "border-l-yellow-500"
              : "border-l-red-500"
          }`}
      >
        <div className="flex items-center gap-2">
          {getHealthIcon()}
          <AlertDescription className={getHealthColor()}>
            {healthStatus === "healthy" &&
              "✅ All features are ready to be completed"}
            {healthStatus === "warning" &&
              `⚠️ ${stats.blockedFeatures} features are blocked by dependencies`}
            {healthStatus === "critical" &&
              `🚨 ${stats.blockedFeatures} features are blocked - high dependency bottleneck`}
          </AlertDescription>
        </div>
      </Alert>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeatures}</div>
            <p className="text-xs text-muted-foreground">
              Features in this project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDependencies}</div>
            <p className="text-xs text-muted-foreground">
              {dependencyDensity.toFixed(1)}% dependency density
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Blocked Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.blockedFeatures}
            </div>
            <p className="text-xs text-muted-foreground">
              Cannot be completed yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Ready to Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completableFeatures}
            </div>
            <p className="text-xs text-muted-foreground">
              No blocking dependencies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Features Ready for Completion</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Ready: {stats.completableFeatures}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Blocked: {stats.blockedFeatures}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>With Dependencies: {stats.featuresWithDependencies}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dependency Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Dependency Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Features with dependencies</span>
              <Badge variant="outline">
                {stats.featuresWithDependencies} / {stats.totalFeatures}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Features being depended on</span>
              <Badge variant="outline">
                {stats.featuresBeingDependedOn} / {stats.totalFeatures}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average dependencies per feature</span>
              <Badge variant="outline">
                {stats.totalFeatures > 0
                  ? (stats.totalDependencies / stats.totalFeatures).toFixed(1)
                  : "0"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DependencyOverview;
