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
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatting";

interface FinancialProjectionsProps {
  ideaId: string;
}

export function FinancialProjections({ ideaId }: FinancialProjectionsProps) {
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
        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No financial projections available</p>
        <p className="text-sm">Add financial data to see projections</p>
      </div>
    );
  }

  const hasRevenueData =
    projection.projectedRevenue && projection.revenueGrowthRate;
  const hasCostData =
    projection.developmentCosts ||
    projection.marketingCosts ||
    projection.operationalCosts;
  const hasBreakEvenData = projection.breakEvenPoint;

  return (
    <div className="space-y-6">
      {/* Revenue Projections */}
      {hasRevenueData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue Projections
            </CardTitle>
            <CardDescription>
              Projected revenue and growth analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Projected Revenue</span>
                  <Badge variant="secondary">
                    {formatCurrency(projection.projectedRevenue || 0)}
                  </Badge>
                </div>
                <Progress
                  value={Math.min(
                    ((projection.projectedRevenue || 0) / 1000000) * 100,
                    100
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <Badge
                    variant={
                      projection.revenueGrowthRate &&
                      projection.revenueGrowthRate > 20
                        ? "default"
                        : "secondary"
                    }
                  >
                    {projection.revenueGrowthRate
                      ? `${projection.revenueGrowthRate.toFixed(1)}%`
                      : "N/A"}
                  </Badge>
                </div>
                <Progress
                  value={Math.min(projection.revenueGrowthRate || 0, 100)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Break-even Analysis */}
      {hasBreakEvenData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Break-even Analysis
            </CardTitle>
            <CardDescription>Time to reach profitability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Break-even Point</p>
                <p className="text-sm text-muted-foreground">
                  Time to reach profitability
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    {projection.breakEvenPoint} months
                  </span>
                </div>
                <Badge
                  variant={
                    projection.breakEvenPoint && projection.breakEvenPoint <= 18
                      ? "default"
                      : "secondary"
                  }
                  className="mt-1"
                >
                  {projection.breakEvenPoint && projection.breakEvenPoint <= 18
                    ? "Good"
                    : "Extended"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      {hasCostData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Cost Breakdown
            </CardTitle>
            <CardDescription>
              Development, marketing, and operational costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {projection.developmentCosts && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Development Costs</span>
                  <span className="font-medium">
                    {formatCurrency(projection.developmentCosts)}
                  </span>
                </div>
              )}

              {projection.marketingCosts && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing Costs</span>
                  <span className="font-medium">
                    {formatCurrency(projection.marketingCosts)}
                  </span>
                </div>
              )}

              {projection.operationalCosts && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Operational Costs</span>
                  <span className="font-medium">
                    {formatCurrency(projection.operationalCosts)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Costs</span>
              <span className="font-semibold">
                {formatCurrency(
                  (projection.developmentCosts || 0) +
                    (projection.marketingCosts || 0) +
                    (projection.operationalCosts || 0)
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Financial Health
          </CardTitle>
          <CardDescription>
            Key financial indicators and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue vs Costs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue vs Costs</span>
                {projection.projectedRevenue && hasCostData ? (
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
                      ? "Profitable"
                      : "At Risk"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Incomplete</Badge>
                )}
              </div>
              <Progress
                value={
                  projection.projectedRevenue && hasCostData
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

            {/* Growth Potential */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Potential</span>
                <Badge
                  variant={
                    projection.revenueGrowthRate &&
                    projection.revenueGrowthRate > 20
                      ? "default"
                      : projection.revenueGrowthRate &&
                          projection.revenueGrowthRate > 10
                        ? "secondary"
                        : "outline"
                  }
                >
                  {projection.revenueGrowthRate &&
                  projection.revenueGrowthRate > 20
                    ? "High"
                    : projection.revenueGrowthRate &&
                        projection.revenueGrowthRate > 10
                      ? "Medium"
                      : "Low"}
                </Badge>
              </div>
              <Progress
                value={Math.min(projection.revenueGrowthRate || 0, 100)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Alert */}
      {!hasRevenueData && !hasCostData && !hasBreakEvenData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Financial data needed
                </p>
                <p className="text-sm text-orange-700">
                  Add revenue projections, costs, and break-even data for
                  complete analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
