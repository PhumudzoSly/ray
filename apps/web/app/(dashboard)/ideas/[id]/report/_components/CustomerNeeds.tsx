"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useCustomerNeeds } from "@/lib/queries/validation";
import { useCustomerJourney } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface CustomerNeedsProps {
  ideaId: string;
}

export function CustomerNeeds({ ideaId }: CustomerNeedsProps) {
  const {
    data: needsData,
    isLoading: needsLoading,
    error: needsError,
  } = useCustomerNeeds(ideaId);
  const {
    data: journeyData,
    isLoading: journeyLoading,
    error: journeyError,
  } = useCustomerJourney(ideaId);

  if (needsLoading || journeyLoading) {
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

  if ((needsError || !needsData) && (journeyError || !journeyData)) {
    return null;
  }

  const getCustomerInsightAssessment = (
    needScore: number,
    journeyScore: number
  ) => {
    const avgScore = (needScore + journeyScore) / 2;
    if (avgScore >= 80)
      return "Exceptional customer understanding with clear needs identification and journey optimization";
    if (avgScore >= 70)
      return "Strong customer insights providing solid foundation for product development";
    if (avgScore >= 60)
      return "Adequate customer understanding requiring deeper insights and journey analysis";
    if (avgScore >= 40)
      return "Limited customer insights necessitating comprehensive research and validation";
    return "Insufficient customer understanding requiring extensive market research and customer discovery";
  };

  const needsScore = needsData?.overallNeedScore || 0;
  const journeyScore = journeyData?.overallJourneyScore || 0;
  const avgScore = (needsScore + journeyScore) / 2;

  const primaryNeed = needsData?.primaryNeed || "TBD";
  const totalNeeds = needsData?.totalNeedsIdentified || 0;
  const totalPainPoints = needsData?.totalPainPoints || 0;
  const solutionGap = needsData?.solutionGap || 0;

  const journeyStages = journeyData?.totalJourneyStages || 0;
  const avgJourneyTime = journeyData?.averageJourneyTime || 0;
  const conversionRate = journeyData?.conversionRate || 0;
  const satisfaction = journeyData?.customerSatisfaction || 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Customer Insights Analysis"
          score={Math.round(avgScore)}
          subtitle="Customer Needs & Journey Optimization"
          description="Comprehensive analysis of customer needs, pain points, journey stages, and experience optimization opportunities"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our customer insights analysis identifies{" "}
            <strong>{primaryNeed}</strong> as the primary customer need, with{" "}
            <strong>{totalNeeds}</strong> distinct needs and{" "}
            <strong>{totalPainPoints}</strong> pain points documented across a{" "}
            <strong>{journeyStages}-stage</strong> customer journey averaging
            <strong>{avgJourneyTime} days</strong> from awareness to conversion.
          </ReportParagraph>

          <ReportHighlight
            type={
              avgScore >= 70 ? "success" : avgScore >= 50 ? "info" : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Customer Insights Assessment:</strong>{" "}
              {getCustomerInsightAssessment(needsScore, journeyScore)}
            </ReportParagraph>
          </ReportHighlight>

          {/* Customer Needs Overview */}
          {needsData && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Customer Needs Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ReportMetric
                  label="Primary Customer Need"
                  value={primaryNeed}
                  description="Most critical customer requirement"
                />
                <ReportMetric
                  label="Identified Needs"
                  value={totalNeeds}
                  description="Total documented customer needs"
                />
                <ReportMetric
                  label="Pain Points"
                  value={totalPainPoints}
                  description="Customer friction areas"
                />
                <ReportMetric
                  label="Solution Gap"
                  value={Math.round(solutionGap)}
                  unit="%"
                  description="Unmet market needs"
                />
              </div>

              {needsData.customerNeeds &&
                needsData.customerNeeds.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold">Priority Customer Needs</h4>
                    <ReportParagraph>
                      Our analysis reveals the following priority needs based on
                      intensity, frequency, and urgency metrics:
                    </ReportParagraph>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {needsData.customerNeeds
                        .sort(
                          (a, b) =>
                            b.intensityScore +
                            b.frequencyScore +
                            b.urgencyScore -
                            (a.intensityScore +
                              a.frequencyScore +
                              a.urgencyScore)
                        )
                        .slice(0, 6)
                        .map((need, index) => {
                          const totalScore =
                            need.intensityScore +
                            need.frequencyScore +
                            need.urgencyScore;
                          const avgNeedScore = Math.round(totalScore / 3);

                          return (
                            <div
                              key={need.id}
                              className={`p-3 border rounded-lg ${
                                index === 0
                                  ? "border-blue-200 bg-blue-50"
                                  : "border-muted"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm">
                                  {need.needName}
                                </h5>
                                {index === 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Top Priority
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="text-muted-foreground">
                                    Intensity
                                  </div>
                                  <div className="font-medium">
                                    {Math.round(need.intensityScore)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-muted-foreground">
                                    Frequency
                                  </div>
                                  <div className="font-medium">
                                    {Math.round(need.frequencyScore)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-muted-foreground">
                                    Urgency
                                  </div>
                                  <div className="font-medium">
                                    {Math.round(need.urgencyScore)}%
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-center">
                                <div
                                  className={`text-sm font-bold ${
                                    avgNeedScore >= 80
                                      ? "text-red-600"
                                      : avgNeedScore >= 60
                                        ? "text-orange-600"
                                        : "text-yellow-600"
                                  }`}
                                >
                                  Priority Score: {avgNeedScore}/100
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Customer Journey Analysis */}
          {journeyData && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Customer Journey Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ReportMetric
                  label="Journey Stages"
                  value={journeyStages}
                  description="Total touchpoints in customer journey"
                />
                <ReportMetric
                  label="Average Journey Time"
                  value={`${avgJourneyTime} days`}
                  description="Time from awareness to conversion"
                />
                <ReportMetric
                  label="Overall Conversion Rate"
                  value={Math.round(conversionRate)}
                  unit="%"
                  description="End-to-end conversion efficiency"
                />
                <ReportMetric
                  label="Customer Satisfaction"
                  value={Math.round(satisfaction)}
                  unit="%"
                  description="Journey experience rating"
                />
              </div>

              <ReportParagraph>
                The customer journey spans{" "}
                <strong>{journeyStages} stages</strong> with an average duration
                of
                <strong> {avgJourneyTime} days</strong>. Current conversion
                efficiency stands at
                <strong> {Math.round(conversionRate)}%</strong> with customer
                satisfaction rating of
                <strong> {Math.round(satisfaction)}%</strong>, indicating
                {satisfaction >= 80
                  ? "excellent customer experience"
                  : satisfaction >= 70
                    ? "good customer experience with room for optimization"
                    : satisfaction >= 60
                      ? "adequate customer experience requiring improvements"
                      : "poor customer experience needing immediate attention"}
                .
              </ReportParagraph>

              {journeyData.journeyStages &&
                journeyData.journeyStages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold">Journey Stage Performance</h4>
                    <div className="space-y-3">
                      {journeyData.journeyStages
                        .sort((a, b) => a.stageOrder - b.stageOrder)
                        .map((stage, index) => (
                          <div
                            key={stage.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <div>
                                <h5 className="font-medium">
                                  {stage.stageName}
                                </h5>
                                {stage.averageDuration && (
                                  <p className="text-xs text-muted-foreground">
                                    Avg duration:{" "}
                                    {Math.round(stage.averageDuration)} hours
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-medium">Conversion</div>
                                <div
                                  className={`font-bold ${
                                    stage.conversionRate >= 80
                                      ? "text-green-600"
                                      : stage.conversionRate >= 60
                                        ? "text-blue-600"
                                        : "text-yellow-600"
                                  }`}
                                >
                                  {Math.round(stage.conversionRate)}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Satisfaction</div>
                                <div
                                  className={`font-bold ${
                                    stage.satisfactionScore >= 80
                                      ? "text-green-600"
                                      : stage.satisfactionScore >= 60
                                        ? "text-blue-600"
                                        : "text-yellow-600"
                                  }`}
                                >
                                  {Math.round(stage.satisfactionScore)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Pain Points Analysis */}
              {journeyData.journeyPainPoints &&
                journeyData.journeyPainPoints.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold">Critical Journey Pain Points</h4>
                    <ReportParagraph>
                      We have identified {journeyData.journeyPainPoints.length}{" "}
                      pain points across the customer journey that require
                      immediate attention to improve conversion and
                      satisfaction:
                    </ReportParagraph>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {journeyData.journeyPainPoints
                        .sort((a, b) => b.severityScore - a.severityScore)
                        .slice(0, 6)
                        .map((painPoint) => (
                          <div
                            key={painPoint.id}
                            className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded-r"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">
                                {painPoint.painPointName}
                              </h5>
                              <Badge variant="destructive" className="text-xs">
                                {Math.round(painPoint.severityScore)}% severity
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Stage: {painPoint.journeyStage}</div>
                              <div>Category: {painPoint.painCategory}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Customer Insights Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Strategic Recommendations</h3>
            <ReportList
              items={[
                solutionGap >= 50
                  ? "High solution gap indicates significant market opportunity for innovative solutions"
                  : "Limited solution gap suggests competitive market requiring differentiated positioning",
                conversionRate >= 20
                  ? "Strong conversion rates support effective customer acquisition strategies"
                  : "Low conversion rates require journey optimization and friction reduction",
                satisfaction >= 70
                  ? "High customer satisfaction indicates strong product-market alignment"
                  : "Customer satisfaction requires improvement through journey optimization",
                totalPainPoints >= 5
                  ? "Multiple pain points identified provide clear opportunities for solution development"
                  : "Limited pain points suggest market maturity or insufficient customer research",
              ]}
            />
          </div>

          <ReportParagraph>
            The customer insights analysis reveals{" "}
            {avgScore >= 70 ? "strong understanding" : "developing insights"}
            of customer needs and journey dynamics. Priority focus areas include
            {solutionGap >= 50
              ? "addressing the significant solution gap, "
              : ""}
            {conversionRate < 20 ? "improving journey conversion rates, " : ""}
            {satisfaction < 70 ? "enhancing customer satisfaction, " : ""}
            and leveraging identified pain points for competitive advantage and
            product differentiation.
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
