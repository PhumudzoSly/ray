"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useValidationOverview } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface ValidationMetricsProps {
  ideaId: string;
}

export function ValidationMetrics({ ideaId }: ValidationMetricsProps) {
  const { data: validation, isLoading, error } = useValidationOverview(ideaId);

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

  if (error || !validation) {
    return null;
  }

  const metrics = validation.validationMetrics;

  const getValidationCompleteness = (progress: number) => {
    if (progress >= 100)
      return "Complete validation with comprehensive market analysis";
    if (progress >= 80)
      return "Near-complete validation with minor data collection remaining";
    if (progress >= 60)
      return "Substantial validation progress with key insights captured";
    if (progress >= 40)
      return "Moderate validation progress requiring additional research";
    return "Early-stage validation requiring significant additional analysis";
  };

  const overallScore = validation.overallScore || 0;
  const confidenceLevel = validation.confidenceLevel || 0;
  const progress = validation.validationProgress || 0;
  const strengthScore = metrics?.overallStrengthScore || 0;
  const riskScore = metrics?.overallRiskScore || 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Validation Metrics Summary"
          subtitle="Comprehensive Performance Assessment"
          description="Consolidated analysis of all validation metrics and key performance indicators"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our comprehensive validation analysis achieves{" "}
            <strong>{Math.round(progress)}% completion</strong> with an overall
            validation score of <strong>{Math.round(overallScore)}/100</strong>{" "}
            and
            <strong>{Math.round(confidenceLevel)}%</strong> statistical
            confidence.
            {getValidationCompleteness(progress)}
          </ReportParagraph>

          <ReportHighlight
            type={
              overallScore >= 70
                ? "success"
                : overallScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Validation Status:</strong>
              {progress >= 100
                ? "Complete validation ready for strategic decision-making"
                : progress >= 80
                  ? "Near-complete validation with high confidence in findings"
                  : progress >= 60
                    ? "Substantial validation providing reliable insights for planning"
                    : "Ongoing validation requiring additional research and analysis"}
            </ReportParagraph>
          </ReportHighlight>

          {/* Primary Assessment Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Overall Assessment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      overallScore >= 80
                        ? "text-green-600"
                        : overallScore >= 60
                          ? "text-blue-600"
                          : overallScore >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                  >
                    {Math.round(overallScore)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Score
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      overallScore >= 80
                        ? "text-green-600"
                        : overallScore >= 60
                          ? "text-blue-600"
                          : overallScore >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                  >
                    {overallScore >= 80
                      ? "Excellent"
                      : overallScore >= 60
                        ? "Good"
                        : overallScore >= 40
                          ? "Fair"
                          : "Poor"}
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      confidenceLevel >= 80
                        ? "text-green-600"
                        : confidenceLevel >= 60
                          ? "text-blue-600"
                          : confidenceLevel >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                  >
                    {Math.round(confidenceLevel)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence Level
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      confidenceLevel >= 80
                        ? "text-green-600"
                        : confidenceLevel >= 60
                          ? "text-blue-600"
                          : confidenceLevel >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                  >
                    {confidenceLevel >= 80
                      ? "High"
                      : confidenceLevel >= 60
                        ? "Moderate"
                        : confidenceLevel >= 40
                          ? "Limited"
                          : "Low"}
                  </div>
                </div>
              </div>
            </div>

            {metrics && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">
                  Risk & Opportunity Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {Math.round(strengthScore)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Strength Score
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      Market Opportunity
                    </div>
                  </div>

                  <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {Math.round(riskScore)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Score
                    </div>
                    <div className="text-xs font-medium text-red-600">
                      Implementation Risk
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Business Metrics */}
          {metrics && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Key Business Indicators</h3>
              <ReportParagraph>
                Critical business metrics provide quantitative foundation for
                strategic decision-making and investment evaluation:
              </ReportParagraph>

              <div className="grid grid-cols-2 gap-4">
                <ReportMetric
                  label="Time to Market"
                  value={
                    metrics?.timeToMarket && metrics.timeToMarket > 0
                      ? `${metrics.timeToMarket} months`
                      : "TBD"
                  }
                  description="Development timeline to launch"
                />
                <ReportMetric
                  label="Break Even Point"
                  value={
                    metrics?.breakEvenMonth && metrics.breakEvenMonth > 0
                      ? `Month ${metrics.breakEvenMonth}`
                      : "TBD"
                  }
                  description="Profitability timeline"
                />
                <ReportMetric
                  label="Customer Payback"
                  value={
                    metrics?.customerPayback && metrics.customerPayback > 0
                      ? `${metrics.customerPayback} months`
                      : "TBD"
                  }
                  description="Customer ROI timeline"
                />
                <ReportMetric
                  label="Market Penetration"
                  value={Math.round(metrics.marketPenetration || 0)}
                  unit="%"
                  description="Projected market share"
                />
              </div>
            </div>
          )}

          {/* Financial Requirements */}
          {metrics && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">
                Financial Requirements & Projections
              </h3>
              <ReportParagraph>
                Financial analysis indicates capital requirements of
                <strong>
                  {" "}
                  $
                  {metrics?.fundingRequired && metrics.fundingRequired > 0
                    ? Math.round(metrics?.fundingRequired / 1000)
                    : "TBD"}
                  K
                </strong>
                {metrics &&
                  metrics.timeToMarket &&
                  metrics.timeToMarket > 0 && (
                    <>
                      {" "}
                      with a projected time-to-market of{" "}
                      <strong>{metrics.timeToMarket} months</strong>
                    </>
                  )}
                {metrics?.breakEvenMonth && metrics.breakEvenMonth > 0 && (
                  <>
                    {" "}
                    and break-even target by{" "}
                    <strong>month {metrics.breakEvenMonth}</strong>
                  </>
                )}
                .
              </ReportParagraph>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportMetric
                  label="Funding Required"
                  value={
                    metrics?.fundingRequired && metrics.fundingRequired > 0
                      ? `$${Math.round(metrics?.fundingRequired / 1000)}K`
                      : "TBD"
                  }
                  description="Total capital requirements"
                />
                <ReportMetric
                  label="Validation Progress"
                  value={`${Math.round(progress)}%`}
                  description="Analysis completion status"
                />
              </div>
            </div>
          )}

          {/* Validation Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Validation Timeline & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReportMetric
                label="Current Status"
                value={
                  progress >= 100
                    ? "Complete"
                    : progress >= 80
                      ? "Near Complete"
                      : progress >= 50
                        ? "In Progress"
                        : "Initial Stage"
                }
                description="Validation phase status"
              />
              <ReportMetric
                label="Started"
                value={new Date(validation.startedAt).toLocaleDateString()}
                description="Analysis initiation date"
              />
              <ReportMetric
                label="Last Updated"
                value={new Date(validation.lastUpdatedAt).toLocaleDateString()}
                description="Most recent data refresh"
              />
            </div>
          </div>

          <ReportParagraph>
            This comprehensive validation analysis provides{" "}
            {confidenceLevel >= 80
              ? "high-confidence"
              : confidenceLevel >= 60
                ? "reliable"
                : "preliminary"}
            insights for strategic decision-making. The assessment indicates
            {overallScore >= 70
              ? "strong market potential"
              : overallScore >= 50
                ? "moderate opportunity"
                : "significant challenges"}
            with{" "}
            {strengthScore >= 70
              ? "compelling market strengths"
              : "developing market position"}{" "}
            and
            {riskScore <= 40
              ? "manageable risk profile"
              : riskScore <= 60
                ? "moderate risk considerations"
                : "elevated risk factors requiring attention"}
            .
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
