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
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { getValidationInsights } from "@/actions/idea/insights";

interface ValidationInsightsProps {
  ideaId: string;
}

const insightTypeIcons = {
  MARKET_OPPORTUNITY: TrendingUp,
  COMPETITIVE_THREAT: AlertCircle,
  CUSTOMER_INSIGHT: Users,
  TECHNICAL_CHALLENGE: Zap,
  FINANCIAL_RISK: AlertCircle,
  REGULATORY_CONCERN: AlertCircle,
};

const impactLevelColors = {
  HIGH: "bg-red-100 text-red-800 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOW: "bg-green-100 text-green-800 border-green-200",
};

const verificationStatusColors = {
  VERIFIED: "bg-green-100 text-green-800 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NEEDS_REVIEW: "bg-red-100 text-red-800 border-red-200",
};

const verificationStatusIcons = {
  VERIFIED: CheckCircle,
  PENDING: Clock,
  NEEDS_REVIEW: AlertCircle,
};

export function ValidationInsights({ ideaId }: ValidationInsightsProps) {
  const {
    data: insightsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["validation-insights", ideaId],
    queryFn: () => getValidationInsights(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Insights</CardTitle>
          <CardDescription>
            AI-generated insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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

  if (error || insightsData?.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Insights</CardTitle>
          <CardDescription>
            AI-generated insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Failed to load validation insights
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = insightsData?.data || [];

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Insights</CardTitle>
          <CardDescription>
            AI-generated insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No validation insights available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Insights</CardTitle>
        <CardDescription>
          AI-generated insights and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight) => {
            const IconComponent =
              insightTypeIcons[
                insight.insightType as keyof typeof insightTypeIcons
              ] || AlertCircle;
            const VerificationIcon =
              verificationStatusIcons[
                insight.verificationStatus as keyof typeof verificationStatusIcons
              ] || Clock;

            return (
              <div key={insight.id} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{insight.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        impactLevelColors[
                          insight.impactLevel as keyof typeof impactLevelColors
                        ]
                      }
                    >
                      {insight.impactLevel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        verificationStatusColors[
                          insight.verificationStatus as keyof typeof verificationStatusColors
                        ]
                      }
                    >
                      <VerificationIcon className="h-3 w-3 mr-1" />
                      {insight.verificationStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Confidence Level</span>
                      <span>{insight.confidenceLevel}%</span>
                    </div>
                    <Progress
                      value={insight.confidenceLevel || 0}
                      className="h-2"
                    />
                  </div>

                  {insight.recommendations && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">
                        Recommendations
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {insight.recommendations}
                      </p>
                    </div>
                  )}

                  {insight.dataSource && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Data Source</h5>
                      <p className="text-sm text-muted-foreground">
                        {insight.dataSource}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
