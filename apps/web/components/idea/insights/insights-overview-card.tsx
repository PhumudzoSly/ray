"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import {
  AlertTriangle,
  CheckCircle,
  Code,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getValidationInsights } from "@/actions/idea/insights";
import { getTechnologyAssessment } from "@/actions/idea/insights";
import { getRegulatoryCompliance } from "@/actions/idea/insights";
import { getDetailedScorecard } from "@/actions/idea/insights";

interface InsightsOverviewCardProps {
  ideaId: string;
}

const statusColors = {
  VALIDATED: "bg-green-100 text-green-800 border-green-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NEEDS_REVIEW: "bg-red-100 text-red-800 border-red-200",
  PENDING: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons = {
  VALIDATED: CheckCircle,
  IN_PROGRESS: TrendingUp,
  NEEDS_REVIEW: AlertTriangle,
  PENDING: TrendingUp,
};

export function InsightsOverviewCard({ ideaId }: InsightsOverviewCardProps) {
  const { data: insightsData } = useQuery({
    queryKey: ["validation-insights", ideaId],
    queryFn: () => getValidationInsights(ideaId),
  });

  const { data: techData } = useQuery({
    queryKey: ["technology-assessment", ideaId],
    queryFn: () => getTechnologyAssessment(ideaId),
  });

  const { data: complianceData } = useQuery({
    queryKey: ["regulatory-compliance", ideaId],
    queryFn: () => getRegulatoryCompliance(ideaId),
  });

  const { data: scorecardData } = useQuery({
    queryKey: ["detailed-scorecard", ideaId],
    queryFn: () => getDetailedScorecard(ideaId),
  });

  const insights = insightsData?.data || [];
  const techAssessment = techData?.data;
  const compliance = complianceData?.data;
  const scorecard = scorecardData?.data;

  // Calculate technology readiness score
  const getTechReadinessScore = () => {
    if (!techAssessment) return 0;
    const complexity = techAssessment.technicalComplexity || 0;
    // Invert complexity (lower complexity = higher readiness)
    return Math.max(0, 100 - complexity * 10);
  };

  // Get top 3 critical insights
  const getTopInsights = () => {
    return insights
      .filter((insight) => insight.impactLevel === "HIGH")
      .sort((a, b) => (b.confidenceLevel || 0) - (a.confidenceLevel || 0))
      .slice(0, 3);
  };

  const topInsights = getTopInsights();
  const techReadinessScore = getTechReadinessScore();
  const StatusIcon =
    statusIcons[scorecard?.validationStatus as keyof typeof statusIcons] ||
    TrendingUp;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights Overview</CardTitle>
        <CardDescription>Key insights and validation progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Validation Progress */}
          {scorecard && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <h4 className="font-medium">Validation Progress</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span>{scorecard.weightedScore}/100</span>
                    </div>
                    <Progress
                      value={scorecard.weightedScore || 0}
                      className="h-2"
                    />
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      statusColors[
                        scorecard.validationStatus as keyof typeof statusColors
                      ]
                    }
                  >
                    {scorecard.validationStatus}
                  </Badge>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Technology Readiness */}
          {techAssessment && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <h4 className="font-medium">Technology Readiness</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Readiness Score</span>
                      <span>{techReadinessScore}/100</span>
                    </div>
                    <Progress value={techReadinessScore} className="h-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="text-sm font-medium">
                      {techAssessment.developmentTimeline} months
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Compliance Status */}
          {compliance && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <h4 className="font-medium">Compliance Status</h4>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={
                      statusColors[
                        compliance.complianceLevel as keyof typeof statusColors
                      ]
                    }
                  >
                    {compliance.complianceLevel}
                  </Badge>
                  <Badge variant="outline">{compliance.riskLevel} Risk</Badge>
                  {compliance.implementationCosts && (
                    <span className="text-sm text-muted-foreground">
                      ${compliance.implementationCosts.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Top Critical Insights */}
          {topInsights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <h4 className="font-medium">Critical Insights</h4>
              </div>
              <div className="space-y-2">
                {topInsights.map((insight, index) => (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {insight.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {insight.confidenceLevel}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm font-medium">Review Insights</p>
                <p className="text-xs text-muted-foreground">
                  View detailed analysis
                </p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm font-medium">Update Validation</p>
                <p className="text-xs text-muted-foreground">
                  Refresh assessment
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
