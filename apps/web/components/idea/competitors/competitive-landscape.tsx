"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompetitiveLandscape } from "@/actions/idea/competitive-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  TrendingUp,
  Target,
  Lightbulb,
  Shield,
  BarChart3,
  Users,
  Building2,
} from "lucide-react";

interface CompetitiveLandscapeProps {
  ideaId: string;
}

function getCompetitiveIntensityColor(intensity: string) {
  switch (intensity?.toLowerCase()) {
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

function getMarketPositionColor(position: string) {
  switch (position?.toLowerCase()) {
    case "leader":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "challenger":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "niche":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "follower":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

export function CompetitiveLandscape({ ideaId }: CompetitiveLandscapeProps) {
  const {
    data: landscape,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competitive-landscape", ideaId],
    queryFn: () => getCompetitiveLandscape(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitive Landscape
          </CardTitle>
          <CardDescription>
            Analyzing competitive environment and market positioning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
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
            <BarChart3 className="h-5 w-5" />
            Competitive Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load competitive landscape data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!landscape) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Competitive Landscape
          </CardTitle>
          <CardDescription>Competitive analysis overview</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No competitive landscape data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const competitors = landscape.competitors || [];
  const totalMarketShare = competitors.reduce(
    (sum, comp) => sum + (comp.marketShare || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Competitive Landscape
        </CardTitle>
        <CardDescription>
          Market positioning and competitive analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Competitive Intensity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Competitive Intensity
            </h4>
            <Badge
              className={getCompetitiveIntensityColor(
                landscape.competitiveIntensity
              )}
            >
              {landscape.competitiveIntensity || "Unknown"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {landscape.competitiveIntensity === "low" &&
              "Low competition provides opportunities for market entry"}
            {landscape.competitiveIntensity === "medium" &&
              "Moderate competition requires clear differentiation"}
            {landscape.competitiveIntensity === "high" &&
              "High competition demands strong competitive advantages"}
          </p>
        </div>

        {/* Market Positioning */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Market Positioning
            </h4>
            <Badge
              className={getMarketPositionColor(landscape.marketPositioning)}
            >
              {landscape.marketPositioning || "Undefined"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {landscape.marketPositioning === "leader" &&
              "Market leader with strong competitive advantages"}
            {landscape.marketPositioning === "challenger" &&
              "Challenger position with growth potential"}
            {landscape.marketPositioning === "niche" &&
              "Niche player with specialized focus"}
            {landscape.marketPositioning === "follower" &&
              "Market follower with limited differentiation"}
          </p>
        </div>

        {/* Market Share Analysis */}
        {competitors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Market Share Analysis
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Total Market Share (Top {competitors.length} competitors)
                </span>
                <span className="font-medium">
                  {totalMarketShare.toFixed(1)}%
                </span>
              </div>
              <Progress value={totalMarketShare} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {totalMarketShare < 50 &&
                  "Low market concentration - opportunities for new entrants"}
                {totalMarketShare >= 50 &&
                  totalMarketShare < 80 &&
                  "Moderate market concentration"}
                {totalMarketShare >= 80 &&
                  "High market concentration - dominated by major players"}
              </p>
            </div>
          </div>
        )}

        {/* Competitive Advantages */}
        {landscape.competitiveAdvantage && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Competitive Advantages
            </h4>
            <p className="text-sm text-muted-foreground">
              {landscape.competitiveAdvantage}
            </p>
          </div>
        )}

        {/* Differentiation Opportunities */}
        {landscape.differentiationOpportunities && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Differentiation Opportunities
            </h4>
            <p className="text-sm text-muted-foreground">
              {landscape.differentiationOpportunities}
            </p>
          </div>
        )}

        {/* Competitor Summary */}
        {competitors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Competitor Overview
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Total Competitors:
                </span>
                <span className="ml-2 font-medium">{competitors.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Average Funding:</span>
                <span className="ml-2 font-medium">
                  $
                  {(
                    competitors.reduce(
                      (sum, comp) => sum + (comp.funding || 0),
                      0
                    ) /
                    competitors.length /
                    1000000
                  ).toFixed(1)}
                  M
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
