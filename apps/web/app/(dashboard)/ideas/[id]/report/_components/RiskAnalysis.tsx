"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { useRiskAnalysis } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";
import { cn } from "@workspace/ui/lib/utils";

interface RiskAnalysisProps {
  ideaId: string;
}

export function RiskAnalysis({ ideaId }: RiskAnalysisProps) {
  const { data, isLoading, error } = useRiskAnalysis(ideaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const getRiskAssessment = (score: number) => {
    if (score >= 80)
      return "High risk profile requiring immediate attention and comprehensive mitigation strategies";
    if (score >= 60)
      return "Moderate-to-high risk profile necessitating careful planning and risk management";
    if (score >= 40)
      return "Moderate risk profile with manageable challenges and clear mitigation paths";
    if (score >= 20)
      return "Low-to-moderate risk profile with minimal barriers to execution";
    return "Low risk profile with favorable conditions for implementation";
  };

  const getRiskLevel = (impact: number, probability: number) => {
    const riskScore = (impact * probability) / 5; // Normalize to 1-5 scale
    if (riskScore >= 4)
      return {
        level: "Critical",
        color: "text-red-600",
        bg: "bg-red-500/10",
        variant: "destructive" as const,
      };
    if (riskScore >= 3)
      return {
        level: "High",
        color: "text-orange-600",
        bg: "bg-orange-500/10",
        variant: "secondary" as const,
      };
    if (riskScore >= 2)
      return {
        level: "Medium",
        color: "text-yellow-600",
        bg: "bg-yellow-500/10",
        variant: "outline" as const,
      };
    return {
      level: "Low",
      color: "text-green-600",
      bg: "bg-green-500/10",
      variant: "success" as const,
    };
  };

  const getRiskIcon = (impact: number, probability: number) => {
    const riskScore = (impact * probability) / 5;
    if (riskScore >= 4)
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (riskScore >= 3)
      return <TrendingDown className="h-4 w-4 text-orange-600" />;
    return <Shield className="h-4 w-4 text-green-600" />;
  };

  const overallRisk = data.overallRiskScore || 0;
  const riskItems = data.riskItems || [];
  const criticalRisks = riskItems.filter(
    (r) => (r.impact * r.probability) / 5 >= 4
  ).length;
  const highRisks = riskItems.filter(
    (r) =>
      (r.impact * r.probability) / 5 >= 3 && (r.impact * r.probability) / 5 < 4
  ).length;
  const totalRisks = riskItems.length;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Risk Assessment & Analysis"
          score={100 - overallRisk} // Invert score since lower risk is better
          subtitle="Comprehensive Risk Evaluation"
          description="Detailed analysis of potential risks, impact assessment, and mitigation strategies"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our comprehensive risk analysis identifies{" "}
            <strong>{totalRisks}</strong> potential risks with an overall risk
            score of
            <strong>{Math.round(overallRisk)}%</strong>. The assessment includes{" "}
            <strong>{criticalRisks}</strong> critical risks and{" "}
            <strong>{highRisks}</strong> high-priority risks requiring immediate
            attention and mitigation planning.
          </ReportParagraph>

          <ReportHighlight
            type={
              overallRisk >= 80
                ? "warning"
                : overallRisk >= 60
                  ? "info"
                  : "success"
            }
          >
            <ReportParagraph emphasis>
              <strong>Risk Assessment:</strong> {getRiskAssessment(overallRisk)}
            </ReportParagraph>
          </ReportHighlight>

          {/* Overall Risk Overview */}
          <div
            className={`flex items-center justify-between p-6 rounded-lg border ${
              overallRisk >= 80
                ? "border-red-200 bg-red-50"
                : overallRisk >= 60
                  ? "border-orange-200 bg-orange-50"
                  : overallRisk >= 40
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-green-200 bg-green-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <AlertTriangle
                className={cn(
                  "h-8 w-8",
                  overallRisk >= 80
                    ? "text-red-600"
                    : overallRisk >= 60
                      ? "text-orange-600"
                      : overallRisk >= 40
                        ? "text-yellow-600"
                        : "text-green-600"
                )}
              />
              <div>
                <h3 className="font-bold text-lg">Overall Risk Profile</h3>
                <p className="text-sm text-muted-foreground">
                  {overallRisk >= 80
                    ? "High-risk venture requiring careful evaluation"
                    : overallRisk >= 60
                      ? "Moderate-risk opportunity with manageable challenges"
                      : overallRisk >= 40
                        ? "Balanced risk profile with standard mitigation needs"
                        : "Low-risk opportunity with favorable implementation conditions"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "text-4xl font-bold",
                  overallRisk >= 80
                    ? "text-red-600"
                    : overallRisk >= 60
                      ? "text-orange-600"
                      : overallRisk >= 40
                        ? "text-yellow-600"
                        : "text-green-600"
                )}
              >
                {Math.round(overallRisk)}%
              </div>
              <div className="text-sm text-muted-foreground">Risk Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
            <ReportMetric
              label="Total Risks Identified"
              value={totalRisks}
              description="Comprehensive risk inventory"
            />
            <ReportMetric
              label="Critical Risks"
              value={criticalRisks}
              description="High-impact, high-probability risks"
            />
            <ReportMetric
              label="High Priority Risks"
              value={highRisks}
              description="Requiring immediate attention"
            />
            <ReportMetric
              label="Risk Mitigation Coverage"
              value={
                riskItems.filter(
                  (r) => r.mitigation && r.mitigation.length > 50
                ).length
              }
              description="Risks with detailed mitigation plans"
            />
          </div>

          {/* Detailed Risk Analysis */}
          {riskItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Detailed Risk Analysis</h3>
              <ReportParagraph>
                Each identified risk has been evaluated based on potential
                impact and likelihood of occurrence. The following analysis
                provides strategic insights for risk management and mitigation
                planning:
              </ReportParagraph>

              <div className="space-y-4">
                {riskItems
                  .sort(
                    (a, b) =>
                      b.impact * b.probability - a.impact * a.probability
                  )
                  .map((risk, index) => {
                    const riskLevel = getRiskLevel(
                      risk.impact,
                      risk.probability
                    );
                    const riskScore = Math.round(
                      ((risk.impact * risk.probability) / 5) * 20
                    ); // Convert to percentage

                    return (
                      <div
                        key={risk.id}
                        className={cn("p-4 border rounded-lg", riskLevel.bg)}
                      >
                        <div className="space-y-4">
                          {/* Risk Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {getRiskIcon(risk.impact, risk.probability)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {risk.category}
                                  </Badge>
                                  <Badge variant={riskLevel.variant}>
                                    {riskLevel.level} Risk
                                  </Badge>
                                  {index < 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Top Priority
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-medium">Impact</div>
                                <div
                                  className={cn(
                                    "text-xl font-bold",
                                    risk.impact >= 4
                                      ? "text-red-600"
                                      : risk.impact >= 3
                                        ? "text-orange-600"
                                        : "text-green-600"
                                  )}
                                >
                                  {risk.impact}/5
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Probability</div>
                                <div
                                  className={cn(
                                    "text-xl font-bold",
                                    risk.probability >= 4
                                      ? "text-red-600"
                                      : risk.probability >= 3
                                        ? "text-orange-600"
                                        : "text-green-600"
                                  )}
                                >
                                  {risk.probability}/5
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Risk Score</div>
                                <div
                                  className={cn(
                                    "text-xl font-bold",
                                    riskScore >= 80
                                      ? "text-red-600"
                                      : riskScore >= 60
                                        ? "text-orange-600"
                                        : riskScore >= 40
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                  )}
                                >
                                  {riskScore}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Risk Description */}
                          <div>
                            <h5 className="font-bold text-sm mb-2">
                              Risk Description
                            </h5>
                            <ReportParagraph>
                              {risk.description}
                            </ReportParagraph>
                          </div>

                          {/* Mitigation Strategy */}
                          <div>
                            <h5 className="font-bold text-sm mb-2">
                              Mitigation Strategy
                            </h5>
                            <ReportParagraph>{risk.mitigation}</ReportParagraph>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Risk Category Distribution */}
          {riskItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">
                Risk Distribution by Category
              </h3>
              <ReportParagraph>
                Understanding risk distribution across different categories
                helps prioritize mitigation efforts and resource allocation:
              </ReportParagraph>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  riskItems.reduce(
                    (acc, risk) => {
                      acc[risk.category] = (acc[risk.category] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  )
                ).map(([category, count]) => {
                  const categoryRisks = riskItems.filter(
                    (r) => r.category === category
                  );
                  const avgRisk =
                    categoryRisks.reduce(
                      (sum, r) => sum + (r.impact * r.probability) / 5,
                      0
                    ) / categoryRisks.length;
                  const riskLevel =
                    avgRisk >= 4
                      ? "Critical"
                      : avgRisk >= 3
                        ? "High"
                        : avgRisk >= 2
                          ? "Medium"
                          : "Low";

                  return (
                    <div
                      key={category}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize mb-2">
                        {category}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {riskLevel} Avg Risk
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk Management Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Risk Management Recommendations
            </h3>
            <ReportList
              items={[
                criticalRisks > 0
                  ? `Immediate attention required for ${criticalRisks} critical risks with comprehensive mitigation plans`
                  : "No critical risks identified - maintain standard risk monitoring procedures",
                highRisks > 0
                  ? `${highRisks} high-priority risks require detailed mitigation strategies and regular monitoring`
                  : "High-priority risks are manageable with standard mitigation approaches",
                overallRisk >= 60
                  ? "High overall risk score necessitates comprehensive risk management framework"
                  : "Moderate risk profile supports standard risk management practices",
                riskItems.filter(
                  (r) => r.mitigation && r.mitigation.length > 50
                ).length >=
                riskItems.length * 0.8
                  ? "Strong mitigation planning coverage provides good risk management foundation"
                  : "Additional mitigation planning required for comprehensive risk coverage",
              ]}
            />
          </div>

          <ReportParagraph>
            The risk analysis indicates{" "}
            {overallRisk >= 60
              ? "elevated risk levels"
              : "manageable risk profile"}
            requiring{" "}
            {criticalRisks > 0
              ? "immediate attention to critical risks and "
              : ""}
            {highRisks > 0
              ? "focused mitigation of high-priority risks. "
              : "standard risk management practices. "}
            Success depends on proactive risk monitoring, comprehensive
            mitigation implementation, and continuous risk assessment throughout
            project execution.
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
