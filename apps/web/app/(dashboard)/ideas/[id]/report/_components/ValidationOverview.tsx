"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useValidationOverview } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface ValidationOverviewProps {
  ideaId: string;
}

export function ValidationOverview({ ideaId }: ValidationOverviewProps) {
  const { data: validation, isLoading, error } = useValidationOverview(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !validation) {
    return null;
  }

  const metrics = validation.validationMetrics;

  const getRecommendation = (score: number) => {
    if (score >= 80)
      return "Strong recommendation to proceed with development and market entry.";
    if (score >= 70)
      return "Positive recommendation with minor adjustments to strategy.";
    if (score >= 60)
      return "Cautious recommendation requiring strategic modifications.";
    if (score >= 40)
      return "Not recommended without significant pivots and improvements.";
    return "Strong recommendation against proceeding without major changes.";
  };

  const strengthScore = metrics?.overallStrengthScore || 0;
  const riskScore = metrics?.overallRiskScore || 0;
  const timeToMarket = metrics?.timeToMarket || 0;
  const fundingRequired = metrics?.fundingRequired || 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Executive Summary"
          description="Key findings and strategic recommendations based on comprehensive market validation analysis"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our comprehensive market validation analysis reveals that{" "}
            <strong>{validation.idea.name}</strong> demonstrates
            {validation.overallScore >= 70
              ? "strong"
              : validation.overallScore >= 50
                ? "moderate"
                : "limited"}{" "}
            market potential with an overall validation score of{" "}
            <strong>{Math.round(validation.overallScore)}/100</strong>.
          </ReportParagraph>

          <ReportHighlight
            type={
              validation.overallScore >= 70
                ? "success"
                : validation.overallScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Strategic Recommendation:</strong>{" "}
              {getRecommendation(validation.overallScore)}
            </ReportParagraph>
          </ReportHighlight>

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">
                  Key Performance Indicators
                </h3>
                <div className="space-y-2">
                  <ReportMetric
                    label="Market Strength"
                    value={Math.round(strengthScore)}
                    unit="%"
                    description="Overall market opportunity and competitive position"
                  />
                  <ReportMetric
                    label="Risk Assessment"
                    value={Math.round(riskScore)}
                    unit="%"
                    description="Combined technical, market, and financial risks"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">Business Projections</h3>
                <div className="space-y-2">
                  <ReportMetric
                    label="Time to Market"
                    value={timeToMarket > 0 ? timeToMarket : "TBD"}
                    unit={timeToMarket > 0 ? " months" : ""}
                    description="Estimated development and launch timeline"
                  />
                  <ReportMetric
                    label="Capital Requirements"
                    value={
                      fundingRequired > 0
                        ? `$${Math.round(fundingRequired / 1000)}K`
                        : "TBD"
                    }
                    description="Initial funding needed for market entry"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Critical Success Factors</h3>
            <ReportList
              items={[
                strengthScore >= 70
                  ? "Strong market positioning with clear competitive advantages"
                  : "Market positioning requires strategic enhancement",
                validation.overallScore >= 70
                  ? "High customer demand validation supporting market entry"
                  : "Customer demand validation shows mixed signals requiring further research",
                riskScore <= 30
                  ? "Low risk profile with manageable implementation challenges"
                  : "Elevated risk profile requiring careful mitigation strategies",
                timeToMarket <= 12
                  ? "Favorable time-to-market window for competitive advantage"
                  : "Extended development timeline may impact market opportunity",
              ]}
            />
          </div>

          {metrics && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Financial Outlook</h3>
              <ReportParagraph>
                Based on our analysis, the venture requires an estimated
                investment of
                <strong>
                  {" "}
                  $
                  {fundingRequired > 0
                    ? Math.round(fundingRequired / 1000)
                    : "TBD"}
                  K
                </strong>{" "}
                with a projected time-to-market of{" "}
                <strong>
                  {timeToMarket > 0 ? timeToMarket : "TBD"} months
                </strong>
                .
                {metrics.breakEvenMonth && (
                  <>
                    {" "}
                    The business model projects break-even by month{" "}
                    <strong>{metrics.breakEvenMonth}</strong>
                    with market penetration potential of{" "}
                    <strong>
                      {Math.round(metrics.marketPenetration || 0)}%
                    </strong>
                    .
                  </>
                )}
              </ReportParagraph>
            </div>
          )}

          <ReportParagraph>
            This executive summary is based on comprehensive analysis including
            market research, competitive assessment, customer validation,
            business model evaluation, and risk analysis. Detailed findings and
            recommendations are provided in the following sections.
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
