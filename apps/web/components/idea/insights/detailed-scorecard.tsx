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
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { getDetailedScorecard } from "@/actions/idea/insights";

interface DetailedScorecardProps {
  ideaId: string;
}

const validationStatusColors = {
  VALIDATED: "bg-green-100 text-green-800 border-green-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NEEDS_REVIEW: "bg-red-100 text-red-800 border-red-200",
  PENDING: "bg-gray-100 text-gray-800 border-gray-200",
};

const validationStatusIcons = {
  VALIDATED: CheckCircle,
  IN_PROGRESS: Clock,
  NEEDS_REVIEW: Target,
  PENDING: Clock,
};

const categoryColors = {
  MARKET: "bg-blue-100 text-blue-800 border-blue-200",
  COMPETITIVE: "bg-purple-100 text-purple-800 border-purple-200",
  TECHNICAL: "bg-green-100 text-green-800 border-green-200",
  FINANCIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RISK: "bg-red-100 text-red-800 border-red-200",
};

export function DetailedScorecard({ ideaId }: DetailedScorecardProps) {
  const {
    data: scorecardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["detailed-scorecard", ideaId],
    queryFn: () => getDetailedScorecard(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Scorecard</CardTitle>
          <CardDescription>
            Comprehensive validation scoring breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || scorecardData?.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Scorecard</CardTitle>
          <CardDescription>
            Comprehensive validation scoring breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Failed to load detailed scorecard
          </div>
        </CardContent>
      </Card>
    );
  }

  const scorecard = scorecardData?.data;

  if (!scorecard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Scorecard</CardTitle>
          <CardDescription>
            Comprehensive validation scoring breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No detailed scorecard available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const ValidationStatusIcon =
    validationStatusIcons[
      scorecard.validationStatus as keyof typeof validationStatusIcons
    ] || Clock;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Scorecard</CardTitle>
        <CardDescription>
          Comprehensive validation scoring breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <h4 className="font-medium">Overall Validation Score</h4>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Weighted Score</span>
                  <span>{scorecard.weightedScore}/100</span>
                </div>
                <Progress
                  value={scorecard.weightedScore || 0}
                  className="h-3"
                />
              </div>
              <Badge
                variant="outline"
                className={
                  validationStatusColors[
                    scorecard.validationStatus as keyof typeof validationStatusColors
                  ]
                }
              >
                <ValidationStatusIcon className="h-3 w-3 mr-1" />
                {scorecard.validationStatus}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Category Scores */}
          <div className="space-y-4">
            <h4 className="font-medium">Category Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Market Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={categoryColors.MARKET}>
                    Market
                  </Badge>
                  <span className="text-sm font-medium">
                    {scorecard.marketScore}/100
                  </span>
                </div>
                <Progress value={scorecard.marketScore || 0} className="h-2" />
              </div>

              {/* Competitive Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={categoryColors.COMPETITIVE}
                  >
                    Competitive
                  </Badge>
                  <span className="text-sm font-medium">
                    {scorecard.competitiveScore}/100
                  </span>
                </div>
                <Progress
                  value={scorecard.competitiveScore || 0}
                  className="h-2"
                />
              </div>

              {/* Technical Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={categoryColors.TECHNICAL}>
                    Technical
                  </Badge>
                  <span className="text-sm font-medium">
                    {scorecard.technicalScore}/100
                  </span>
                </div>
                <Progress
                  value={scorecard.technicalScore || 0}
                  className="h-2"
                />
              </div>

              {/* Financial Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={categoryColors.FINANCIAL}>
                    Financial
                  </Badge>
                  <span className="text-sm font-medium">
                    {scorecard.financialScore}/100
                  </span>
                </div>
                <Progress
                  value={scorecard.financialScore || 0}
                  className="h-2"
                />
              </div>

              {/* Risk Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={categoryColors.RISK}>
                    Risk
                  </Badge>
                  <span className="text-sm font-medium">
                    {scorecard.riskScore}/100
                  </span>
                </div>
                <Progress value={scorecard.riskScore || 0} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed Breakdown */}
          {scorecard.scoreBreakdowns &&
            scorecard.scoreBreakdowns.length > 0 && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Detailed Scoring Breakdown</h4>
                  <div className="space-y-4">
                    {scorecard.scoreBreakdowns.map((breakdown) => (
                      <div
                        key={breakdown.id}
                        className="space-y-3 p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{breakdown.category}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {breakdown.score}/100
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                categoryColors[
                                  breakdown.category as keyof typeof categoryColors
                                ]
                              }
                            >
                              {breakdown.weight}% weight
                            </Badge>
                          </div>
                        </div>
                        <Progress
                          value={breakdown.score || 0}
                          className="h-2"
                        />
                        {breakdown.reasoning && (
                          <p className="text-sm text-muted-foreground">
                            {breakdown.reasoning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium">Recommendations</h4>
            <div className="space-y-3">
              {scorecard.primaryRecommendation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">
                    Primary Recommendation
                  </h5>
                  <p className="text-sm text-blue-800">
                    {scorecard.primaryRecommendation}
                  </p>
                </div>
              )}
              {scorecard.secondaryRecommendations &&
                scorecard.secondaryRecommendations.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Secondary Recommendations</h5>
                    <ul className="space-y-2">
                      {scorecard.secondaryRecommendations.map(
                        (recommendation, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-blue-500 mt-1">•</span>
                            {recommendation}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          <Separator />

          {/* Progress Tracking */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <h4 className="font-medium">Progress Tracking</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Next Review Date
                </p>
                <p className="text-lg font-medium">
                  {scorecard.nextReviewDate
                    ? new Date(scorecard.nextReviewDate).toLocaleDateString()
                    : "Not scheduled"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Review Criteria</p>
                <p className="text-sm font-medium">
                  {scorecard.reviewCriteria || "Standard validation criteria"}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Mitigation Strategies */}
          {scorecard.riskMitigationStrategies &&
            scorecard.riskMitigationStrategies.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Risk Mitigation Strategies</h4>
                  <ul className="space-y-2">
                    {scorecard.riskMitigationStrategies.map(
                      (strategy, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-1">•</span>
                          {strategy}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
