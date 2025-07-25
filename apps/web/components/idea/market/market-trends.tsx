"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMarketTrends } from "@/actions/idea/market-research";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketTrendsProps {
  ideaId: string;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({ ideaId }) => {
  const { data: marketTrends, isPending } = useQuery({
    queryKey: ["market-trends", ideaId],
    queryFn: () => getMarketTrends(ideaId),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!marketTrends || marketTrends.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No market trends data available
      </div>
    );
  }

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

  const getGrowthIcon = (growthRate: number | null | undefined) => {
    if (!growthRate) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (growthRate > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    return <ArrowDownRight className="h-4 w-4 text-red-600" />;
  };

  const getTrendIcon = (trendName: string) => {
    const name = trendName.toLowerCase();
    if (name.includes("ai") || name.includes("machine learning")) return <Zap className="h-4 w-4 text-blue-600" />;
    if (name.includes("cloud") || name.includes("saas")) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (name.includes("mobile") || name.includes("app")) return <Target className="h-4 w-4 text-purple-600" />;
    return <Lightbulb className="h-4 w-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Market Trends</h3>
      </div>

      <div className="space-y-4">
        {marketTrends.map((trend) => (
          <Card key={trend.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend.trendName)}
                    <CardTitle className="text-base">{trend.trendName}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{trend.description}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs", getImpactColor(trend.impact))}>
                  {trend.impact.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Growth Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trend.growthRate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getGrowthIcon(trend.growthRate)}
                        <span>Growth Rate</span>
                      </div>
                      <div className="font-medium">{trend.growthRate.toFixed(1)}%</div>
                    </div>
                  )}
                  {trend.marketSize && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Market Size</div>
                      <div className="font-medium">${trend.marketSize.toFixed(1)}B</div>
                    </div>
                  )}
                  {trend.adoptionRate && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Adoption Rate</div>
                      <div className="font-medium">{trend.adoptionRate.toFixed(1)}%</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Confidence</div>
                    <div className="font-medium capitalize">{trend.confidenceLevel.toLowerCase()}</div>
                  </div>
                </div>

                <Separator />

                {/* Key Drivers */}
                {trend.keyDrivers && trend.keyDrivers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Key Drivers</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.keyDrivers.map((driver, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges */}
                {trend.challenges && trend.challenges.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Challenges</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.challenges.map((challenge, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-orange-700 border-orange-200">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {trend.opportunities && trend.opportunities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Opportunities</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.opportunities.map((opportunity, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-green-700 border-green-200">
                          {opportunity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Source */}
                {trend.dataSource && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Source: {trend.dataSource}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 