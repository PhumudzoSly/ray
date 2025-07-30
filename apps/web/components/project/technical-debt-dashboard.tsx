"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  RefreshCw,
  Plus,
  Calendar,
  Zap,
  CheckCircle,
} from "lucide-react";
import {
  getProjectTechnicalDebt,
  getDebtTimelineImpact,
  createTechnicalDebtIssues,
} from "@/actions/technical-debt";
import { toast } from "sonner";

interface TechnicalDebtDashboardProps {
  projectId: string;
}

export function TechnicalDebtDashboard({
  projectId,
}: TechnicalDebtDashboardProps) {
  const [showTimelineImpact, setShowTimelineImpact] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: debtData,
    isLoading: debtLoading,
    refetch: refetchDebt,
  } = useQuery({
    queryKey: ["technical-debt", projectId],
    queryFn: () => getProjectTechnicalDebt(projectId),
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["debt-timeline-impact", projectId],
    queryFn: () => getDebtTimelineImpact(projectId),
    enabled: showTimelineImpact,
  });

  const createIssuesMutation = useMutation({
    mutationFn: () => createTechnicalDebtIssues(projectId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          `Created ${result.data.createdIssues} technical debt issues`
        );
        queryClient.invalidateQueries({
          queryKey: ["technical-debt", projectId],
        });
      } else {
        toast.error(result.error || "Failed to create issues");
      }
    },
    onError: () => {
      toast.error("Failed to create technical debt issues");
    },
  });

  if (debtLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!debtData?.success) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Unable to load technical debt data
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchDebt()}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    totalDebtMinutes,
    debtRatio,
    trend,
    categories,
    impactOnVelocity,
    recommendedActions,
    repositories,
  } = debtData.data;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "degrading":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600";
      case "degrading":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getDebtSeverity = (minutes: number) => {
    if (minutes > 480) return { level: "critical", color: "destructive" };
    if (minutes > 240) return { level: "high", color: "default" };
    if (minutes > 120) return { level: "medium", color: "secondary" };
    return { level: "low", color: "outline" };
  };

  const debtSeverity = getDebtSeverity(totalDebtMinutes);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Technical Debt */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Technical Debt</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {Math.round(totalDebtMinutes / 60)}h
                  </p>
                  <Badge
                    variant={debtSeverity.color as any}
                    className="text-xs"
                  >
                    {debtSeverity.level}
                  </Badge>
                </div>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Debt Ratio */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Debt Ratio</p>
                <p className="text-2xl font-bold">{debtRatio.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-2xl font-bold capitalize ${getTrendColor(trend)}`}
                  >
                    {trend}
                  </p>
                  {getTrendIcon(trend)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Velocity Impact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Velocity Impact</p>
                <p className="text-2xl font-bold">
                  {impactOnVelocity.toFixed(0)}%
                </p>
                <Progress value={impactOnVelocity} className="h-1 mt-2" />
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Debt Categories</CardTitle>
          <Button
            size="sm"
            onClick={() => createIssuesMutation.mutate()}
            disabled={createIssuesMutation.isPending || totalDebtMinutes < 60}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Issues
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.type}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium capitalize">
                      {category.type}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {category.issueCount} issues
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{Math.round(category.debtMinutes / 60)}h debt</span>
                    <Progress
                      value={(category.debtMinutes / totalDebtMinutes) * 100}
                      className="h-1 flex-1 max-w-32"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repository Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{repo.name}</span>
                    {repo.issuesCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {repo.issuesCount} issues
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{Math.round(repo.debtMinutes / 60)}h debt</span>
                    {repo.lastAnalyzed && (
                      <span>
                        Last analyzed{" "}
                        {new Date(repo.lastAnalyzed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Progress
                    value={(repo.debtMinutes / totalDebtMinutes) * 100}
                    className="h-2 w-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Impact */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline Impact
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTimelineImpact(!showTimelineImpact)}
          >
            {showTimelineImpact ? "Hide" : "Show"} Impact
          </Button>
        </CardHeader>
        {showTimelineImpact && (
          <CardContent>
            {timelineLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            ) : timelineData?.success ? (
              <div className="space-y-4">
                {timelineData.data.milestoneImpacts.map((impact) => (
                  <div
                    key={impact.milestoneId}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {impact.milestoneName}
                        </span>
                        <Badge
                          variant={
                            impact.riskLevel === "high"
                              ? "destructive"
                              : impact.riskLevel === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {impact.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {impact.additionalDays > 0 ? (
                          <>+{impact.additionalDays} days delay expected</>
                        ) : (
                          <>No significant delay expected</>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {impact.originalEndDate && (
                        <div className="text-muted-foreground">
                          {new Date(
                            impact.originalEndDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {impact.adjustedEndDate && impact.additionalDays > 0 && (
                        <div className="font-medium">
                          →{" "}
                          {new Date(
                            impact.adjustedEndDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {timelineData.data.recommendations.length > 0 && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {timelineData.data.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{rec.title}:</span>{" "}
                          {rec.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Unable to calculate timeline impact
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Recommended Actions */}
      {recommendedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedActions.slice(0, 5).map((action, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {action.priority}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{action.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Effort: {action.estimatedEffort}</span>
                      <span>Impact: {action.expectedImpact}</span>
                    </div>
                    {action.affectedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {action.affectedFiles.slice(0, 3).map((file, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {file}
                          </Badge>
                        ))}
                        {action.affectedFiles.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{action.affectedFiles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
