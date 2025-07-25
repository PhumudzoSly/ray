"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getValidationScorecard } from "@/actions/idea/market-research";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  Shield,
  Target,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationScorecardSummaryProps {
  ideaId: string;
}

export const ValidationScorecardSummary: React.FC<
  ValidationScorecardSummaryProps
> = ({ ideaId }) => {
  const { data: scorecard, isPending } = useQuery({
    queryKey: ["validation-scorecard", ideaId],
    queryFn: () => getValidationScorecard(ideaId),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No validation data available
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    if (score >= 40) return <AlertCircle className="h-4 w-4 text-orange-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "NEEDS_REVIEW":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const metrics = [
    {
      label: "Market",
      score: scorecard.marketScore || 0,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Competition",
      score: scorecard.competitiveScore || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Technical",
      score: scorecard.technicalScore || 0,
      icon: Zap,
      color: "text-green-600",
    },
    {
      label: "Financial",
      score: scorecard.financialScore || 0,
      icon: DollarSign,
      color: "text-orange-600",
    },
    {
      label: "Risk",
      score: scorecard.riskScore || 0,
      icon: Shield,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Validation Scorecard</h3>
          <Badge
            variant="outline"
            className={getStatusColor(scorecard.validationStatus)}
          >
            {scorecard.validationStatus.replace("_", " ")}
          </Badge>
        </div>

        {scorecard.weightedScore && (
          <div className="flex items-center gap-4">
            {getScoreIcon(scorecard.weightedScore)}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-2xl font-bold",
                  getScoreColor(scorecard.weightedScore)
                )}
              >
                {Math.round(scorecard.weightedScore)}
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center gap-2">
              <metric.icon className={cn("h-4 w-4", metric.color)} />
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-lg font-semibold",
                    getScoreColor(metric.score)
                  )}
                >
                  {Math.round(metric.score)}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
              <Progress value={metric.score} className="h-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {scorecard.primaryRecommendation && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Primary Recommendation</h4>
          <div className="bg-muted/30 border rounded-lg p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scorecard.primaryRecommendation}
            </p>
          </div>
        </div>
      )}

      {/* Next Review */}
      {scorecard.nextReviewDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Next review:{" "}
            {new Date(scorecard.nextReviewDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};
