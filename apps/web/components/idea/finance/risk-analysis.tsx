"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialProjection } from "@/actions/idea/financial-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Target,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatting";

interface RiskAnalysisProps {
  ideaId: string;
}

export function RiskAnalysis({ ideaId }: RiskAnalysisProps) {
  const { data: projection, isLoading } = useQuery({
    queryKey: ["financial-projection", ideaId],
    queryFn: () => getFinancialProjection(ideaId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
      </div>
    );
  }

  if (!projection) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No risk analysis data available</p>
        <p className="text-sm">Add financial data to see risk assessment</p>
      </div>
    );
  }

  const hasRiskFactors =
    projection.riskFactors && projection.riskFactors.length > 0;
  const hasMitigationStrategies =
    projection.mitigationStrategies &&
    projection.mitigationStrategies.length > 0;
  const hasScenarioAnalysis =
    projection.optimisticScenario ||
    projection.realisticScenario ||
    projection.pessimisticScenario;

  const getRiskLevel = (riskFactors: string[]) => {
    if (!riskFactors || riskFactors.length === 0)
      return { level: "Low", variant: "default" as const };
    if (riskFactors.length >= 5)
      return { level: "High", variant: "destructive" as const };
    if (riskFactors.length >= 3)
      return { level: "Medium", variant: "secondary" as const };
    return { level: "Low", variant: "outline" as const };
  };

  const riskLevel = getRiskLevel(projection.riskFactors || []);

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Risk Overview
          </CardTitle>
          <CardDescription>
            Overall risk assessment and key risk factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Risk Level</p>
              <p className="text-sm text-muted-foreground">
                Based on identified risk factors
              </p>
            </div>
            <Badge variant={riskLevel.variant} className="text-sm">
              {riskLevel.level} Risk
            </Badge>
          </div>

          {hasRiskFactors && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Factors</span>
                <Badge variant="outline">
                  {projection.riskFactors!.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {projection.riskFactors!.map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-muted rounded-md"
                  >
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mitigation Strategies */}
      {hasMitigationStrategies && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Mitigation Strategies
            </CardTitle>
            <CardDescription>
              Strategies to address identified risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projection.mitigationStrategies!.map((strategy, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-green-50 rounded-md"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strategy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Analysis */}
      {hasScenarioAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Scenario Analysis
            </CardTitle>
            <CardDescription>
              Best, realistic, and worst-case financial scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Optimistic Scenario */}
              {projection.optimisticScenario && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Optimistic</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(projection.optimisticScenario)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Best-case scenario
                  </p>
                </div>
              )}

              {/* Realistic Scenario */}
              {projection.realisticScenario && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Realistic</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(projection.realisticScenario)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expected outcome
                  </p>
                </div>
              )}

              {/* Pessimistic Scenario */}
              {projection.pessimisticScenario && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Pessimistic</span>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(projection.pessimisticScenario)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Worst-case scenario
                  </p>
                </div>
              )}
            </div>

            {/* Scenario Range */}
            {projection.optimisticScenario &&
              projection.pessimisticScenario && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scenario Range</span>
                    <Badge variant="outline">
                      {formatCurrency(projection.pessimisticScenario)} -{" "}
                      {formatCurrency(projection.optimisticScenario)}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      projection.realisticScenario
                        ? ((projection.realisticScenario -
                            projection.pessimisticScenario) /
                            (projection.optimisticScenario -
                              projection.pessimisticScenario)) *
                          100
                        : 50
                    }
                  />
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Financial Risk Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Financial Risk Indicators
          </CardTitle>
          <CardDescription>
            Key financial risk metrics and assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue vs Costs Risk */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue vs Costs</span>
                {projection.projectedRevenue &&
                (projection.developmentCosts ||
                  projection.marketingCosts ||
                  projection.operationalCosts) ? (
                  <Badge
                    variant={
                      projection.projectedRevenue >
                      (projection.developmentCosts || 0) +
                        (projection.marketingCosts || 0) +
                        (projection.operationalCosts || 0)
                        ? "default"
                        : "destructive"
                    }
                  >
                    {projection.projectedRevenue >
                    (projection.developmentCosts || 0) +
                      (projection.marketingCosts || 0) +
                      (projection.operationalCosts || 0)
                      ? "Low Risk"
                      : "High Risk"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Unknown</Badge>
                )}
              </div>
              <Progress
                value={
                  projection.projectedRevenue &&
                  (projection.developmentCosts ||
                    projection.marketingCosts ||
                    projection.operationalCosts)
                    ? Math.min(
                        (projection.projectedRevenue /
                          ((projection.developmentCosts || 0) +
                            (projection.marketingCosts || 0) +
                            (projection.operationalCosts || 0))) *
                          100,
                        100
                      )
                    : 0
                }
              />
            </div>

            {/* Break-even Risk */}
            {projection.breakEvenPoint && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Break-even Timeline
                  </span>
                  <Badge
                    variant={
                      projection.breakEvenPoint <= 18
                        ? "default"
                        : projection.breakEvenPoint <= 24
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {projection.breakEvenPoint <= 18
                      ? "Low Risk"
                      : projection.breakEvenPoint <= 24
                        ? "Medium Risk"
                        : "High Risk"}
                  </Badge>
                </div>
                <Progress
                  value={Math.max(
                    0,
                    100 - (projection.breakEvenPoint / 36) * 100
                  )} // Invert scale (shorter = better)
                />
              </div>
            )}

            {/* Unit Economics Risk */}
            {projection.customerLifetimeValue &&
              projection.customerAcquisitionCost && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">LTV/CAC Ratio</span>
                    <Badge
                      variant={
                        projection.customerLifetimeValue /
                          projection.customerAcquisitionCost >=
                        3
                          ? "default"
                          : projection.customerLifetimeValue /
                                projection.customerAcquisitionCost >=
                              2
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {projection.customerLifetimeValue /
                        projection.customerAcquisitionCost >=
                      3
                        ? "Low Risk"
                        : projection.customerLifetimeValue /
                              projection.customerAcquisitionCost >=
                            2
                          ? "Medium Risk"
                          : "High Risk"}
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(
                      (projection.customerLifetimeValue /
                        projection.customerAcquisitionCost /
                        5) *
                        100,
                      100
                    )}
                  />
                </div>
              )}

            {/* Overall Risk Assessment */}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Overall Financial Risk
              </span>
              <Badge variant={riskLevel.variant}>{riskLevel.level}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Alert */}
      {!hasRiskFactors && !hasMitigationStrategies && !hasScenarioAnalysis && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Risk analysis data needed
                </p>
                <p className="text-sm text-orange-700">
                  Add risk factors, mitigation strategies, and scenario analysis
                  for complete risk assessment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
