"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { useMarketTrends } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketTrendsProps {
  ideaId: string;
}

export function MarketTrends({ ideaId }: MarketTrendsProps) {
  const { data, isLoading, error } = useMarketTrends(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const getTrendAssessment = (score: number) => {
    if (score >= 80)
      return "Highly favorable market trends creating exceptional opportunities for growth and expansion";
    if (score >= 70)
      return "Strong market trends supporting business growth with favorable market dynamics";
    if (score >= 60)
      return "Moderate market trends providing adequate opportunities with some challenges";
    if (score >= 40)
      return "Mixed market trends requiring strategic navigation and adaptive positioning";
    return "Challenging market trends necessitating careful strategy and potential repositioning";
  };

  const primaryTrend = data.primaryTrend || "Market Evolution";
  const totalTrends = data.totalTrendsTracked || 0;
  const trendStrength = data.trendStrength || 0;
  const marketGrowth = data.marketGrowthRate || 0;
  const trends = data.marketTrends || [];

  const opportunityTrends = trends.filter(
    (t) => t.opportunityScore > t.threatScore
  ).length;
  const threatTrends = trends.filter(
    (t) => t.threatScore > t.opportunityScore
  ).length;
  const neutralTrends = trends.length - opportunityTrends - threatTrends;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Market Trends & Timing Analysis"
          score={data.overallTrendScore}
          subtitle="Strategic Timing & Market Dynamics"
          description="Comprehensive analysis of market trends, growth patterns, and strategic timing for market entry"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our market trend analysis identifies <strong>{primaryTrend}</strong>{" "}
            as the dominant market trend, tracking{" "}
            <strong>{totalTrends}</strong> key market dynamics with an overall
            trend strength of
            <strong>{Math.round(trendStrength)}%</strong> and market growth rate
            of
            <strong>{Math.round(marketGrowth)}%</strong> annually.
          </ReportParagraph>

          <ReportHighlight
            type={
              data.overallTrendScore >= 70
                ? "success"
                : data.overallTrendScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Trend Assessment:</strong>{" "}
              {getTrendAssessment(data.overallTrendScore)}
            </ReportParagraph>
          </ReportHighlight>

          {/* Trend Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
            <ReportMetric
              label="Primary Market Trend"
              value={primaryTrend}
              description="Dominant market movement"
            />
            <ReportMetric
              label="Trends Tracked"
              value={totalTrends}
              description="Market dynamics monitored"
            />
            <ReportMetric
              label="Trend Strength"
              value={Math.round(trendStrength)}
              unit="%"
              description="Overall market momentum"
            />
            <ReportMetric
              label="Market Growth Rate"
              value={Math.round(marketGrowth)}
              unit="% annually"
              description="Market expansion velocity"
            />
          </div>

          {/* Trend Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="text-center p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-bold text-lg text-green-600">
                  {opportunityTrends}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Opportunity Trends
              </div>
              <div className="text-xs text-green-600 mt-1">
                Favorable market dynamics
              </div>
            </div>
            <div className="text-center p-4 border border-gray-200 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-bold text-lg text-gray-600">
                  {neutralTrends}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Neutral Trends
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Balanced market forces
              </div>
            </div>
            <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-bold text-lg text-red-600">
                  {threatTrends}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Challenge Trends
              </div>
              <div className="text-xs text-red-600 mt-1">Market headwinds</div>
            </div>
          </div>

          {/* Detailed Trend Analysis */}
          {trends.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Strategic Trend Analysis</h3>
              <ReportParagraph>
                Our comprehensive trend analysis evaluates market dynamics
                across multiple dimensions, providing strategic insights for
                timing and positioning decisions:
              </ReportParagraph>

              <div className="space-y-4">
                {trends
                  .sort(
                    (a, b) =>
                      b.impactScore +
                      b.certaintyLevel -
                      (a.impactScore + a.certaintyLevel)
                  )
                  .map((trend, index) => {
                    const isOpportunity =
                      trend.opportunityScore > trend.threatScore;
                    const netScore = Math.abs(
                      trend.opportunityScore - trend.threatScore
                    );
                    const significance =
                      trend.impactScore >= 80
                        ? "High"
                        : trend.impactScore >= 60
                          ? "Medium"
                          : "Low";

                    return (
                      <div
                        key={trend.id}
                        className={`p-4 border rounded-lg ${
                          isOpportunity
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {isOpportunity ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              )}
                              <div>
                                <h4 className="font-bold">{trend.trendName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {trend.trendCategory}
                                  </Badge>
                                  <Badge
                                    variant={
                                      isOpportunity ? "success" : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {isOpportunity
                                      ? "Opportunity"
                                      : "Challenge"}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {significance} Impact
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-2xl font-bold ${
                                  isOpportunity
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {Math.round(netScore)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isOpportunity ? "Opportunity" : "Threat"} Score
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <ReportMetric
                              label="Impact Score"
                              value={Math.round(trend.impactScore)}
                              unit="%"
                              description="Market influence level"
                            />
                            <ReportMetric
                              label="Certainty Level"
                              value={Math.round(trend.certaintyLevel)}
                              unit="%"
                              description="Trend prediction confidence"
                            />
                            <ReportMetric
                              label="Opportunity Potential"
                              value={Math.round(trend.opportunityScore)}
                              unit="%"
                              description="Positive impact possibility"
                            />
                            <ReportMetric
                              label="Risk Level"
                              value={Math.round(trend.threatScore)}
                              unit="%"
                              description="Negative impact potential"
                            />
                          </div>

                          {trend.description && (
                            <div>
                              <h5 className="font-medium text-sm mb-2">
                                Trend Analysis
                              </h5>
                              <ReportParagraph>
                                {trend.description}
                              </ReportParagraph>
                            </div>
                          )}

                          {trend.timelineMonths && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Expected Timeline:</span>
                              <Badge variant="outline" className="text-xs">
                                {trend.timelineMonths} months
                              </Badge>
                              <span>
                                {trend.timelineMonths <= 6
                                  ? "(Short-term impact)"
                                  : trend.timelineMonths <= 18
                                    ? "(Medium-term evolution)"
                                    : "(Long-term transformation)"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Strategic Timing Analysis */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Strategic Timing Recommendations
            </h3>
            <ReportParagraph>
              Based on current market trends and their projected evolution, we
              recommend the following strategic timing considerations for market
              entry and business development:
            </ReportParagraph>

            <ReportList
              items={[
                marketGrowth >= 15
                  ? "High market growth rate creates favorable conditions for rapid expansion and market capture"
                  : "Moderate market growth requires focused strategy and efficient resource allocation",
                opportunityTrends > threatTrends
                  ? "Positive trend balance supports immediate market entry with favorable timing"
                  : "Mixed trend environment requires careful market entry timing and adaptive strategy",
                trendStrength >= 70
                  ? "Strong trend momentum provides clear directional signals for strategic planning"
                  : "Moderate trend strength suggests cautious approach with flexible positioning",
                trends.filter((t) => t.timelineMonths && t.timelineMonths <= 12)
                  .length > 0
                  ? "Short-term trends present immediate opportunities requiring rapid response"
                  : "Long-term trends allow for strategic planning and gradual market positioning",
              ]}
            />
          </div>

          {/* Market Entry Timing */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Market Entry Timing Assessment
            </h3>
            <ReportParagraph>
              Current market conditions indicate
              {data.overallTrendScore >= 70
                ? "favorable timing"
                : data.overallTrendScore >= 50
                  ? "adequate timing"
                  : "challenging timing"}
              for market entry. The analysis suggests
              {opportunityTrends > threatTrends
                ? "capitalizing on positive market momentum"
                : "careful navigation of market challenges"}
              with{" "}
              {marketGrowth >= 10
                ? "strong"
                : marketGrowth >= 5
                  ? "moderate"
                  : "limited"}{" "}
              growth prospects supporting{" "}
              {marketGrowth >= 10
                ? "aggressive"
                : marketGrowth >= 5
                  ? "balanced"
                  : "conservative"}{" "}
              expansion strategies.
            </ReportParagraph>

            <ReportHighlight
              type={
                marketGrowth >= 10
                  ? "success"
                  : marketGrowth >= 5
                    ? "info"
                    : "warning"
              }
            >
              <ReportParagraph emphasis>
                <strong>Timing Recommendation:</strong>
                {marketGrowth >= 15
                  ? "Immediate market entry recommended to capitalize on high-growth conditions"
                  : marketGrowth >= 10
                    ? "Favorable conditions support near-term market entry with strong positioning"
                    : marketGrowth >= 5
                      ? "Moderate conditions suggest careful market entry timing with phased approach"
                      : "Conservative market entry recommended with careful timing and risk management"}
              </ReportParagraph>
            </ReportHighlight>
          </div>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
