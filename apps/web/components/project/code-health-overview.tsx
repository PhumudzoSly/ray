"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  GitBranch,
  TrendingUp,
  Shield,
  Bug,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { getProjectRepositories } from "@/actions/integration/github-repository";
import Link from "next/link";

interface CodeHealthOverviewProps {
  projectId: string;
}

export function CodeHealthOverview({ projectId }: CodeHealthOverviewProps) {
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

  // Calculate aggregate metrics
  const totalIssues = repositories.reduce(
    (sum, repo) => sum + repo.issues.length,
    0
  );
  const criticalIssues = repositories.reduce(
    (sum, repo) =>
      sum + repo.issues.filter((issue) => issue.severity === "CRITICAL").length,
    0
  );
  const majorIssues = repositories.reduce(
    (sum, repo) =>
      sum + repo.issues.filter((issue) => issue.severity === "MAJOR").length,
    0
  );

  const repositoriesWithAnalysis = repositories.filter(
    (repo) => repo.analyses.length > 0
  );
  const avgMaintainability =
    repositoriesWithAnalysis.length > 0
      ? repositoriesWithAnalysis.reduce(
          (sum, repo) => sum + repo.analyses[0].maintainabilityIndex,
          0
        ) / repositoriesWithAnalysis.length
      : 0;
  const avgSecurity =
    repositoriesWithAnalysis.length > 0
      ? repositoriesWithAnalysis.reduce(
          (sum, repo) => sum + repo.analyses[0].securityScore,
          0
        ) / repositoriesWithAnalysis.length
      : 0;
  const totalTechnicalDebt = repositoriesWithAnalysis.reduce(
    (sum, repo) => sum + repo.analyses[0].technicalDebtMinutes,
    0
  );

  if (repositories.length === 0) {
    return null; // Don't show the component if no repositories are connected
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Code Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Code Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Failed to load code health data</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Code Health
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {activeRepositories.length} Active Repos
          </Badge>
          <Button size="sm" variant="ghost" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Maintainability */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Maintainability</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {repositoriesWithAnalysis.length > 0
                      ? Math.round(avgMaintainability)
                      : 0}
                    %
                  </p>
                  {repositoriesWithAnalysis.length === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      No Data
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Score */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Security</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {repositoriesWithAnalysis.length > 0
                      ? Math.round(avgSecurity)
                      : 0}
                    %
                  </p>
                  {repositoriesWithAnalysis.length === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      No Data
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Code Issues */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Issues</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold">{totalIssues}</p>
                  {criticalIssues > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {criticalIssues} Critical
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Debt */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/20">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Tech Debt</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {Math.round(totalTechnicalDebt / 60)}h
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(totalTechnicalDebt / repositories.length / 60)}h
                    avg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repository List */}
        {repositories.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Connected Repositories</h4>
            <div className="space-y-2">
              {repositories.slice(0, 3).map((repo) => {
                const latestAnalysis = repo.analyses[0];
                const repoIssues = repo.issues.length;
                const repoCriticalIssues = repo.issues.filter(
                  (issue) => issue.severity === "CRITICAL"
                ).length;

                return (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {repo.repositoryName}
                      </span>
                      {!repo.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {latestAnalysis && (
                        <>
                          <span>
                            {Math.round(latestAnalysis.maintainabilityIndex)}%
                            maintainable
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{repoIssues} issues</span>
                      {repoCriticalIssues > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {repoCriticalIssues} critical
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        asChild
                      >
                        <a
                          href={repo.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
              {repositories.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  And {repositories.length - 3} more repositories...
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
