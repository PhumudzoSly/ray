"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useMarketValidation } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface MarketValidationProps {
  ideaId: string;
}

export function MarketValidation({ ideaId }: MarketValidationProps) {
  const { data, isLoading, error } = useMarketValidation(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const formatMarketSize = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`; // Billions
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`; // Millions
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`; // Thousands
    }
    return `$${Math.round(value)}`; // Under 1K
  };

  const getMarketSizeAssessment = (tam: number, sam: number, som: number) => {
    const totalMarket = tam + sam + som;
    if (totalMarket >= 1000000000)
      return "Large market opportunity with significant revenue potential";
    if (totalMarket >= 100000000)
      return "Substantial market opportunity with good growth prospects";
    if (totalMarket >= 10000000)
      return "Moderate market opportunity requiring focused strategy";
    return "Niche market opportunity with targeted approach needed";
  };

  const tam = data.totalAddressableMarket || 0;
  const sam = data.serviceableAddressableMarket || 0;
  const som = data.serviceableObtainableMarket || 0;
  const growthRate = data.marketGrowthRate || 0;
  const customerSegment = data.primaryCustomerSegment || "General Market";
  const interviews = data.customerInterviews || 0;
  const surveys = data.surveyResponses || 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Market Analysis"
          score={data.overallMarketScore}
          subtitle="Comprehensive Market Opportunity Assessment"
          description="Analysis of market size, growth potential, customer segments, and regional opportunities"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our market analysis reveals {getMarketSizeAssessment(tam, sam, som)}{" "}
            within the target market segment. The analysis is based on{" "}
            {interviews > 0
              ? `${interviews} customer interviews`
              : "market research"}
            {surveys > 0 ? ` and ${surveys} survey responses` : ""}, providing
            {interviews + surveys >= 50
              ? "high"
              : interviews + surveys >= 20
                ? "moderate"
                : "limited"}
            statistical confidence in our findings.
          </ReportParagraph>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Market Size Analysis</h3>
              <div className="space-y-3">
                <ReportMetric
                  label="Total Addressable Market (TAM)"
                  value={tam > 0 ? formatMarketSize(tam) : "Under Analysis"}
                  description="Complete market demand for the product category"
                />
                <ReportMetric
                  label="Serviceable Addressable Market (SAM)"
                  value={sam > 0 ? formatMarketSize(sam) : "Under Analysis"}
                  description="Portion of TAM within our reach"
                />
                <ReportMetric
                  label="Serviceable Obtainable Market (SOM)"
                  value={som > 0 ? formatMarketSize(som) : "Under Analysis"}
                  description="Realistic market share achievable"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Market Dynamics</h3>
              <div className="space-y-3">
                <ReportMetric
                  label="Market Growth Rate"
                  value={Math.round(growthRate)}
                  unit="% annually"
                  description="Year-over-year market expansion"
                />
                <ReportMetric
                  label="Primary Customer Segment"
                  value={customerSegment}
                  description="Main target demographic"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Research Foundation</h3>
              <div className="space-y-3">
                <ReportMetric
                  label="Customer Interviews"
                  value={interviews}
                  description="Direct customer feedback sessions"
                />
                <ReportMetric
                  label="Survey Responses"
                  value={surveys}
                  description="Quantitative market research data"
                />
              </div>
            </div>
          </div>

          <ReportHighlight
            type={
              data.overallMarketScore >= 70
                ? "success"
                : data.overallMarketScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Market Assessment:</strong>
              {data.overallMarketScore >= 80 &&
                "Exceptional market opportunity with strong fundamentals supporting business growth."}
              {data.overallMarketScore >= 70 &&
                data.overallMarketScore < 80 &&
                "Strong market opportunity with favorable conditions for market entry."}
              {data.overallMarketScore >= 60 &&
                data.overallMarketScore < 70 &&
                "Moderate market opportunity requiring strategic positioning."}
              {data.overallMarketScore >= 40 &&
                data.overallMarketScore < 60 &&
                "Limited market opportunity requiring careful validation and positioning."}
              {data.overallMarketScore < 40 &&
                "Challenging market conditions requiring significant strategy adjustments."}
            </ReportParagraph>
          </ReportHighlight>

          {/* Regional Performance Analysis */}
          {data.regionScores && data.regionScores.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">
                Regional Market Opportunities
              </h3>
              <ReportParagraph>
                Our geographic analysis identifies varying market potential
                across different regions. The following assessment highlights
                the most promising markets for initial entry and expansion:
              </ReportParagraph>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.regionScores
                  .sort((a, b) => b.score - a.score)
                  .map((region) => (
                    <div
                      key={region.id}
                      className="text-center p-3 border rounded"
                    >
                      <div className="font-bold text-lg">
                        {Math.round(region.score)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {region.region}
                      </div>
                      <Badge
                        variant={
                          region.score >= 70
                            ? "success"
                            : region.score >= 50
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs mt-1"
                      >
                        {region.score >= 70
                          ? "High Priority"
                          : region.score >= 50
                            ? "Moderate"
                            : "Low Priority"}
                      </Badge>
                    </div>
                  ))}
              </div>

              <ReportParagraph>
                <strong>Regional Strategy:</strong> We recommend prioritizing
                {data.regionScores.filter((r) => r.score >= 70).length > 0 &&
                  data.regionScores
                    .filter((r) => r.score >= 70)
                    .map((r) => r.region)
                    .join(", ")}
                for initial market entry, followed by expansion into secondary
                markets as the business scales.
              </ReportParagraph>
            </div>
          )}

          {/* Market Insights */}
          {data.marketInsights && data.marketInsights.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Strategic Market Insights</h3>
              <ReportParagraph>
                Based on our comprehensive market analysis, we have identified
                several critical insights that will inform strategic
                decision-making and market entry approach:
              </ReportParagraph>

              <div className="space-y-3">
                {data.marketInsights.slice(0, 5).map((insight, index) => (
                  <ReportHighlight
                    key={insight.id}
                    type={
                      insight.category === "opportunity"
                        ? "success"
                        : insight.category === "threat"
                          ? "warning"
                          : "info"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                      <div className="flex-1">
                        {insight.label && (
                          <div className="font-medium text-sm mb-1">
                            {insight.label}
                          </div>
                        )}
                        {insight.description && (
                          <ReportParagraph>
                            {insight.description}
                          </ReportParagraph>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>Impact: {insight.impact}%</span>
                          <span>Urgency: {insight.urgency}%</span>
                        </div>
                      </div>
                    </div>
                  </ReportHighlight>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Market Entry Recommendations</h3>
            <ReportList
              items={[
                tam >= 500
                  ? "Large market size supports multiple revenue streams and growth strategies"
                  : "Focused market approach recommended for optimal resource allocation",
                growthRate >= 10
                  ? "High growth market creates favorable timing for market entry"
                  : "Stable market requires differentiated value proposition for market penetration",
                interviews + surveys >= 30
                  ? "Strong research foundation supports confident market entry decisions"
                  : "Additional market research recommended before major investment commitments",
                data.regionScores?.some((r) => r.score >= 70)
                  ? "Clear geographic priorities identified for phased market expansion"
                  : "Broad market approach may be necessary due to distributed opportunities",
              ]}
            />
          </div>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
