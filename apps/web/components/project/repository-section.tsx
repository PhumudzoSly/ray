"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  GitBranch,
  Plus,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProjectRepositories } from "@/actions/integration/github-repository";
import { RepositoryStatusCard } from "./repository-status-card";
import { RepositoryConnectionDialog } from "./repository-connection-dialog";
import { Badge } from "@workspace/ui/components/badge";

interface RepositorySectionProps {
  projectId: string;
}

export function RepositorySection({ projectId }: RepositorySectionProps) {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  const {
    data: repositoriesResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project-repositories", projectId],
    queryFn: () => getProjectRepositories(projectId),
  });

  const repositories = repositoriesResult?.data || [];
  const activeRepositories = repositories.filter((repo) => repo.isActive);
  const totalIssues = repositories.reduce(
    (sum, repo) => sum + repo.issues.length,
    0
  );
  const criticalIssues = repositories.reduce(
    (sum, repo) =>
      sum + repo.issues.filter((issue) => issue.severity === "CRITICAL").length,
    0
  );

  const getOverallHealth = () => {
    if (repositories.length === 0)
      return { status: "none", color: "gray", icon: Clock };

    const analysesWithData = repositories.filter(
      (repo) => repo.analyses.length > 0
    );
    if (analysesWithData.length === 0)
      return { status: "pending", color: "yellow", icon: Clock };

    const avgMaintainability =
      analysesWithData.reduce(
        (sum, repo) => sum + repo.analyses[0].maintainabilityIndex,
        0
      ) / analysesWithData.length;

    const avgSecurity =
      analysesWithData.reduce(
        (sum, repo) => sum + repo.analyses[0].securityScore,
        0
      ) / analysesWithData.length;

    const overallScore = (avgMaintainability + avgSecurity) / 2;

    if (overallScore >= 80)
      return { status: "excellent", color: "green", icon: CheckCircle };
    if (overallScore >= 60)
      return { status: "good", color: "blue", icon: CheckCircle };
    if (overallScore >= 40)
      return { status: "fair", color: "yellow", icon: AlertCircle };
    return { status: "poor", color: "red", icon: AlertCircle };
  };

  const overallHealth = getOverallHealth();
  const HealthIcon = overallHealth.icon;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">
            Code Repositories
          </h3>
          <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Separator className="my-3" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-muted-foreground">
            Code Repositories
          </h3>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConnectionDialog(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-4 text-muted-foreground">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Failed to load repositories</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <GitBranch className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm mb-2">No repositories connected</p>
            <p className="text-xs mb-3">
              Connect GitHub repositories to track code quality and technical
              debt.
            </p>
            <Button size="sm" onClick={() => setShowConnectionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <HealthIcon
                  className={`h-3 w-3 text-${overallHealth.color}-600`}
                />
                <span className="text-muted-foreground">Health:</span>
                <span className="font-medium capitalize">
                  {overallHealth.status}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-blue-600" />
                <span className="text-muted-foreground">Active:</span>
                <span className="font-medium">
                  {activeRepositories.length}/{repositories.length}
                </span>
              </div>
              {totalIssues > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                    <span className="text-muted-foreground">Issues:</span>
                    <span className="font-medium">{totalIssues}</span>
                  </div>
                  {criticalIssues > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span className="text-muted-foreground">Critical:</span>
                      <span className="font-medium text-red-600">
                        {criticalIssues}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Repository Cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {repositories.map((repository) => (
                <RepositoryStatusCard
                  key={repository.id}
                  repository={repository}
                  onRefresh={() => refetch()}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConnectionDialog(true)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>
            </div>
          </>
        )}
      </div>

      <RepositoryConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        projectId={projectId}
        onSuccess={() => refetch()}
      />
    </>
  );
}
