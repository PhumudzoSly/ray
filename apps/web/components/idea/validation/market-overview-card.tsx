"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMarketResearch,
  getTargetAudiences,
  getMarketTrends,
} from "@/actions/idea/market-research";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketOverviewCardProps {
  ideaId: string;
}

export const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({
  ideaId,
}) => {
  const { data: marketResearch, isPending: marketResearchPending } = useQuery({
    queryKey: ["market-research", ideaId],
    queryFn: () => getMarketResearch(ideaId),
  });

  const { data: targetAudiences, isPending: audiencesPending } = useQuery({
    queryKey: ["target-audiences", ideaId],
    queryFn: () => getTargetAudiences(ideaId),
  });

  const { data: marketTrends, isPending: trendsPending } = useQuery({
    queryKey: ["market-trends", ideaId],
    queryFn: () => getMarketTrends(ideaId),
  });

  const isPending = marketResearchPending || audiencesPending || trendsPending;

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!marketResearch) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No market research data available
      </div>
    );
  }

  const getTrendIcon = (growthRate: number | null | undefined) => {
    if (!growthRate) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (growthRate > 0)
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    return <ArrowDownRight className="h-4 w-4 text-red-600" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const primaryAudience = targetAudiences?.find(
    (audience) => audience.isPrimary
  );
  const topTrends = marketTrends?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Market Overview</h3>

      {/* Market Maturity & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-medium">Market Stage</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {marketResearch.marketMaturity?.replace("_", " ") || "Unknown"}
              </Badge>
            </div>
            {marketResearch.marketGrowthRate && (
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon(marketResearch.marketGrowthRate)}
                <span className="text-muted-foreground">
                  {marketResearch.marketGrowthRate.toFixed(1)}% annual growth
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-medium">Primary Audience</h4>
          </div>
          <div className="space-y-2">
            {primaryAudience ? (
              <>
                <div className="font-medium">{primaryAudience.segmentName}</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {primaryAudience.companySize && (
                    <div>
                      Company size:{" "}
                      {primaryAudience.companySize.replace("_", " ")}
                    </div>
                  )}
                  {primaryAudience.industry && (
                    <div>Industry: {primaryAudience.industry}</div>
                  )}
                  {primaryAudience.estimatedSize && (
                    <div>
                      Estimated size:{" "}
                      {primaryAudience.estimatedSize.toLocaleString()} companies
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No primary audience defined
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Trends */}
      {topTrends.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-medium">Key Market Trends</h4>
          </div>
          <div className="space-y-2">
            {topTrends.map((trend) => (
              <div
                key={trend.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {trend.trendName}
                    </span>
                    <Badge
                      variant="outline"
                      className={getImpactColor(trend.impact)}
                    >
                      {trend.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {trend.description}
                  </p>
                </div>
                {trend.growthRate && (
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(trend.growthRate)}
                    <span className="text-muted-foreground">
                      {trend.growthRate.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emerging Technologies */}
      {marketResearch.emergingTechnologies &&
        marketResearch.emergingTechnologies.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Emerging Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {marketResearch.emergingTechnologies
                .slice(0, 5)
                .map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
            </div>
          </div>
        )}
    </div>
  );
};
