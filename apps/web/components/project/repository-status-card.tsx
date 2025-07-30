"use client";

import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  GitBranch,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  Bug,
  Shield,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disconnectRepositoryFromProject } from "@/actions/integration/github-repository";
import { useConfirm } from "@workspace/ui/components/confirm-dialog";

interface RepositoryStatusCardProps {
  repository: {
    id: string;
    repositoryName: string;
    repositoryUrl: string;
    isActive: boolean;
    lastAnalyzed: Date | null;
    analyses: Array<{
      id: string;
      linesOfCode: number;
      cyclomaticComplexity: number;
      technicalDebtMinutes: number;
      maintainabilityIndex: number;
      testCoverage: number | null;
      securityScore: number;
      analyzedAt: Date;
    }>;
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
    }>;
  };
  onRefresh?: () => void;
}

export function RepositoryStatusCard({
  repository,
  onRefresh,
}: RepositoryStatusCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const latestAnalysis = repository.analyses[0];
  const criticalIssues = repository.issues.filter(
    (issue) => issue.severity === "CRITICAL"
  ).length;
  const majorIssues = repository.issues.filter(
    (issue) => issue.severity === "MAJOR"
  ).length;

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectRepositoryFromProject(repository.id),
    onSuccess: () => {
      toast.success("Repository disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["project-repositories"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to disconnect repository"
      );
    },
  });

  const handleDisconnect = async () => {
    const isConfirmed = await confirm({
      title: "Disconnect Repository",
      description: `Are you sure you want to disconnect ${repository.repositoryName}? This will remove all analysis data and code quality tracking for this repository.`,
    });

    if (isConfirmed) {
      disconnectMutation.mutate();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Implement repository sync/refresh
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      toast.success("Repository refreshed successfully");
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to refresh repository");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHealthStatus = () => {
    if (!latestAnalysis)
      return { status: "unknown", color: "gray", icon: Clock };

    const { maintainabilityIndex, securityScore } = latestAnalysis;
    const overallScore = (maintainabilityIndex + securityScore) / 2;

    if (overallScore >= 80)
      return { status: "excellent", color: "green", icon: CheckCircle };
    if (overallScore >= 60)
      return { status: "good", color: "blue", icon: CheckCircle };
    if (overallScore >= 40)
      return { status: "fair", color: "yellow", icon: AlertCircle };
    return { status: "poor", color: "red", icon: AlertCircle };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="truncate">{repository.repositoryName}</span>
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh Analysis
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={repository.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="text-destructive focus:text-destructive"
              disabled={disconnectMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Status and Health */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HealthIcon
                className={`h-4 w-4 text-${healthStatus.color}-600`}
              />
              <span className="text-sm capitalize">{healthStatus.status}</span>
            </div>
            <Badge
              variant={repository.isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {repository.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Analysis Summary */}
          {latestAnalysis ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span className="text-muted-foreground">Maintainability:</span>
                <span className="font-medium">
                  {Math.round(latestAnalysis.maintainabilityIndex)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">Security:</span>
                <span className="font-medium">
                  {Math.round(latestAnalysis.securityScore)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Bug className="h-3 w-3 text-red-600" />
                <span className="text-muted-foreground">Issues:</span>
                <span className="font-medium">{repository.issues.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600" />
                <span className="text-muted-foreground">Tech Debt:</span>
                <span className="font-medium">
                  {Math.round(latestAnalysis.technicalDebtMinutes / 60)}h
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No analysis yet</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Start Analysis
              </Button>
            </div>
          )}

          {/* Issues Summary */}
          {repository.issues.length > 0 && (
            <div className="flex gap-2 text-xs">
              {criticalIssues > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalIssues} Critical
                </Badge>
              )}
              {majorIssues > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {majorIssues} Major
                </Badge>
              )}
            </div>
          )}

          {/* Last Analysis */}
          {repository.lastAnalyzed && (
            <p className="text-xs text-muted-foreground">
              Last analyzed{" "}
              {formatDistanceToNow(repository.lastAnalyzed, {
                addSuffix: true,
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
