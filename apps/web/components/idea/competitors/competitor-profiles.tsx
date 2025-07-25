"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompetitors } from "@/actions/idea/competitive-analysis";
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
  Building2,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";

interface CompetitorProfilesProps {
  ideaId: string;
}

function getPerformanceColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getGrowthColor(growth: number) {
  if (growth > 0) return "text-green-600";
  if (growth < 0) return "text-red-600";
  return "text-gray-600";
}

export function CompetitorProfiles({ ideaId }: CompetitorProfilesProps) {
  const {
    data: competitors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competitors", ideaId],
    queryFn: () => getCompetitors(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Competitor Profiles
          </CardTitle>
          <CardDescription>
            Detailed analysis of key competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            ))}
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
            <Building2 className="h-5 w-5" />
            Competitor Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load competitor data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Competitor Profiles
          </CardTitle>
          <CardDescription>
            Detailed analysis of key competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No competitor data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Competitor Profiles
        </CardTitle>
        <CardDescription>
          Detailed analysis of {competitors.length} key competitors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {competitors.map((competitor) => (
          <div key={competitor.id} className="border rounded-lg p-4 space-y-4">
            {/* Basic Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{competitor.name}</h3>
                {competitor.website && (
                  <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {competitor.website}
                  </a>
                )}
              </div>
              <Badge variant="outline">
                {competitor.marketPosition || "Unknown"}
              </Badge>
            </div>

            {/* Description */}
            {competitor.description && (
              <p className="text-sm text-muted-foreground">
                {competitor.description}
              </p>
            )}

            {/* Market Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {competitor.marketShare !== null && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Market Share
                  </div>
                  <div className="font-medium">
                    {competitor.marketShare.toFixed(1)}%
                  </div>
                </div>
              )}

              {competitor.revenue !== null && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    Revenue
                  </div>
                  <div className="font-medium">
                    ${(competitor.revenue / 1000000).toFixed(1)}M
                  </div>
                </div>
              )}

              {competitor.funding !== null && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Funding
                  </div>
                  <div className="font-medium">
                    ${(competitor.funding / 1000000).toFixed(1)}M
                  </div>
                </div>
              )}

              {competitor.employees !== null && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Employees
                  </div>
                  <div className="font-medium">
                    {competitor.employees.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            {(competitor.growthRate !== null ||
              competitor.churnRate !== null ||
              competitor.satisfactionScore !== null) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {competitor.growthRate !== null && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Growth Rate</span>
                        <span className={getGrowthColor(competitor.growthRate)}>
                          {competitor.growthRate > 0 ? "+" : ""}
                          {competitor.growthRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.abs(competitor.growthRate)}
                        className="h-2"
                      />
                    </div>
                  )}

                  {competitor.churnRate !== null && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Churn Rate</span>
                        <span
                          className={
                            competitor.churnRate < 5
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {competitor.churnRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={competitor.churnRate} className="h-2" />
                    </div>
                  )}

                  {competitor.satisfactionScore !== null && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Satisfaction</span>
                        <span
                          className={getPerformanceColor(
                            competitor.satisfactionScore
                          )}
                        >
                          {competitor.satisfactionScore.toFixed(1)}/100
                        </span>
                      </div>
                      <Progress
                        value={competitor.satisfactionScore}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SWOT Analysis */}
            {(competitor.strengths ||
              competitor.weaknesses ||
              competitor.opportunities ||
              competitor.threats) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  SWOT Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competitor.strengths && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <Plus className="h-3 w-3" />
                        Strengths
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {competitor.strengths}
                      </p>
                    </div>
                  )}

                  {competitor.weaknesses && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <Minus className="h-3 w-3" />
                        Weaknesses
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {competitor.weaknesses}
                      </p>
                    </div>
                  )}

                  {competitor.opportunities && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Plus className="h-3 w-3" />
                        Opportunities
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {competitor.opportunities}
                      </p>
                    </div>
                  )}

                  {competitor.threats && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        Threats
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {competitor.threats}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {competitor.techStack && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {competitor.techStack.split(",").map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
