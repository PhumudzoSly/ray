"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useAudienceSegmentation } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface AudienceSegmentationProps {
  ideaId: string;
}

export function AudienceSegmentation({ ideaId }: AudienceSegmentationProps) {
  const { data, isLoading, error } = useAudienceSegmentation(ideaId);

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

  const getSegmentationQuality = (score: number) => {
    if (score >= 80)
      return "Excellent segmentation with clear target groups and strong market positioning";
    if (score >= 70)
      return "Good segmentation providing solid foundation for targeted marketing";
    if (score >= 60)
      return "Adequate segmentation requiring refinement for optimal targeting";
    if (score >= 40)
      return "Limited segmentation clarity requiring strategic repositioning";
    return "Poor segmentation necessitating comprehensive market research";
  };

  const primarySegment = data.primarySegment || "General Market";
  const totalSegments = data.totalSegments || 0;
  const marketSize = data.totalMarketSize || 0;
  const accessibility = data.segmentAccessibility || 0;
  const segments = data.audienceSegments || [];

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Target Market Analysis"
          score={data.overallSegmentationScore}
          subtitle="Customer Segmentation & Market Positioning"
          description="Comprehensive analysis of target customer segments, market accessibility, and positioning strategies"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our target market analysis identifies{" "}
            <strong>{primarySegment}</strong> as the primary customer segment,
            representing the highest opportunity within a total addressable
            market of
            <strong>
              {marketSize > 0 ? ` ${Math.round(marketSize / 1000)}K` : " TBD"}{" "}
              potential customers
            </strong>
            . We have identified <strong>{totalSegments}</strong> distinct
            market segments with an overall accessibility rating of{" "}
            <strong>{Math.round(accessibility)}%</strong>.
          </ReportParagraph>

          <ReportHighlight
            type={
              data.overallSegmentationScore >= 70
                ? "success"
                : data.overallSegmentationScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Segmentation Assessment:</strong>{" "}
              {getSegmentationQuality(data.overallSegmentationScore)}
            </ReportParagraph>
          </ReportHighlight>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
            <ReportMetric
              label="Primary Target Segment"
              value={primarySegment}
              description="Highest priority customer group"
            />
            <ReportMetric
              label="Total Market Segments"
              value={totalSegments}
              description="Identified customer groups"
            />
            <ReportMetric
              label="Addressable Market Size"
              value={
                marketSize > 0 ? `${Math.round(marketSize / 1000)}K` : "TBD"
              }
              description="Total potential customers"
            />
            <ReportMetric
              label="Market Accessibility"
              value={Math.round(accessibility)}
              unit="%"
              description="Ease of customer acquisition"
            />
          </div>

          {/* Customer Segments Analysis */}
          {segments.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Customer Segment Analysis</h3>
              <ReportParagraph>
                Our detailed analysis reveals distinct customer segments with
                varying characteristics, needs, and profitability potential. The
                following segments represent the most viable opportunities for
                targeted market entry and growth:
              </ReportParagraph>

              <div className="space-y-4">
                {segments
                  .sort(
                    (a, b) =>
                      b.attractivenessScore +
                      b.accessibilityScore +
                      b.profitabilityScore -
                      (a.attractivenessScore +
                        a.accessibilityScore +
                        a.profitabilityScore)
                  )
                  .map((segment, index) => {
                    const totalScore =
                      segment.attractivenessScore +
                      segment.accessibilityScore +
                      segment.profitabilityScore;
                    const avgScore = Math.round(totalScore / 3);

                    return (
                      <div
                        key={segment.id}
                        className={`p-4 border rounded-lg ${
                          index === 0
                            ? "border-green-200 bg-green-50"
                            : "border-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg">
                                {segment.segmentName}
                              </h4>
                              {index === 0 && (
                                <Badge variant="success" className="text-xs">
                                  Primary Target
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {Math.round(segment.segmentSize)}% of market
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                Segment Score
                              </div>
                              <div
                                className={`text-xl font-bold ${
                                  avgScore >= 80
                                    ? "text-green-600"
                                    : avgScore >= 60
                                      ? "text-blue-600"
                                      : avgScore >= 40
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                }`}
                              >
                                {avgScore}/100
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <ReportMetric
                            label="Attractiveness"
                            value={Math.round(segment.attractivenessScore)}
                            unit="%"
                            description="Market appeal and growth potential"
                          />
                          <ReportMetric
                            label="Accessibility"
                            value={Math.round(segment.accessibilityScore)}
                            unit="%"
                            description="Ease of customer acquisition"
                          />
                          <ReportMetric
                            label="Profitability"
                            value={Math.round(segment.profitabilityScore)}
                            unit="%"
                            description="Revenue generation potential"
                          />
                        </div>

                        <div className="space-y-3">
                          {segment.primaryNeed && (
                            <div>
                              <ReportParagraph>
                                <strong>Primary Need:</strong>{" "}
                                {segment.primaryNeed}
                              </ReportParagraph>
                            </div>
                          )}

                          {segment.budgetRange && (
                            <div>
                              <ReportParagraph>
                                <strong>Budget Range:</strong>{" "}
                                {segment.budgetRange} - indicating
                                {segment.budgetRange.includes("$1000") ||
                                segment.budgetRange.includes("$5000")
                                  ? "high"
                                  : segment.budgetRange.includes("$500")
                                    ? "moderate"
                                    : "budget-conscious"}
                                spending capacity for solutions.
                              </ReportParagraph>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Segmentation Strategy Recommendations
            </h3>
            <ReportList
              items={[
                accessibility >= 70
                  ? "High market accessibility enables direct customer acquisition strategies"
                  : "Limited market accessibility requires partnership and indirect channels",
                segments.length >= 3
                  ? "Multiple viable segments support diversified market approach"
                  : "Focused single-segment strategy recommended for resource optimization",
                segments.some((s) => s.attractivenessScore >= 80)
                  ? "High-attractiveness segments identified for priority targeting"
                  : "Moderate attractiveness segments require enhanced value proposition",
                segments.some((s) => s.profitabilityScore >= 70)
                  ? "Strong profitability potential supports sustainable business model"
                  : "Profitability challenges require cost optimization and premium positioning",
              ]}
            />
          </div>

          {/* Market Entry Strategy */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Market Entry Strategy</h3>
            <ReportParagraph>
              Based on our segmentation analysis, we recommend a
              {segments.length >= 3
                ? "phased multi-segment"
                : "focused single-segment"}{" "}
              approach. Initial market entry should target{" "}
              <strong>{primarySegment}</strong> due to its
              {segments.length > 0 && segments[0]
                ? `${Math.round(segments[0].attractivenessScore)}% attractiveness score and ${Math.round(segments[0].accessibilityScore)}% accessibility rating`
                : "favorable market characteristics"}
              .
            </ReportParagraph>

            <ReportParagraph>
              Long-term expansion should consider secondary segments based on
              market penetration success and resource availability. Customer
              acquisition strategies should be tailored to each segment's unique
              characteristics, budget constraints, and communication
              preferences.
            </ReportParagraph>
          </div>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
