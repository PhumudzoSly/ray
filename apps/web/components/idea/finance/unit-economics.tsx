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
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatting";

interface UnitEconomicsProps {
  ideaId: string;
}

export function UnitEconomics({ ideaId }: UnitEconomicsProps) {
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
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No unit economics data available</p>
        <p className="text-sm">Add customer metrics to see unit economics</p>
      </div>
    );
  }

  const hasUnitEconomics =
    projection.averageRevenuePerUser &&
    projection.customerLifetimeValue &&
    projection.customerAcquisitionCost;

  const ltvCacRatio =
    hasUnitEconomics &&
    projection.customerLifetimeValue &&
    projection.customerAcquisitionCost
      ? projection.customerLifetimeValue / projection.customerAcquisitionCost
      : null;

  const getLtvCacStatus = (ratio: number | null) => {
    if (!ratio) return { status: "Unknown", variant: "secondary" as const };
    if (ratio >= 3) return { status: "Excellent", variant: "default" as const };
    if (ratio >= 2) return { status: "Good", variant: "secondary" as const };
    if (ratio >= 1) return { status: "Marginal", variant: "outline" as const };
    return { status: "Poor", variant: "destructive" as const };
  };

  const getPaybackStatus = (months: number | null) => {
    if (!months) return { status: "Unknown", variant: "secondary" as const };
    if (months <= 12)
      return { status: "Excellent", variant: "default" as const };
    if (months <= 18) return { status: "Good", variant: "secondary" as const };
    if (months <= 24)
      return { status: "Acceptable", variant: "outline" as const };
    return { status: "Extended", variant: "destructive" as const };
  };

  const ltvCacStatus = getLtvCacStatus(ltvCacRatio);
  const paybackStatus = getPaybackStatus(projection.paybackPeriod);

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      {hasUnitEconomics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Key Unit Economics
            </CardTitle>
            <CardDescription>
              Customer lifetime value, acquisition cost, and revenue per user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ARPU */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ARPU</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(projection.averageRevenuePerUser || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per user per month
                </p>
              </div>

              {/* CLV */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CLV</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(projection.customerLifetimeValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer lifetime value
                </p>
              </div>

              {/* CAC */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CAC</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(projection.customerAcquisitionCost || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer acquisition cost
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LTV/CAC Ratio */}
      {hasUnitEconomics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              LTV/CAC Ratio
            </CardTitle>
            <CardDescription>
              Customer lifetime value to acquisition cost ratio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ratio</p>
                <p className="text-sm text-muted-foreground">CLV ÷ CAC</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {ltvCacRatio ? ltvCacRatio.toFixed(2) : "N/A"}
                </div>
                <Badge variant={ltvCacStatus.variant} className="mt-1">
                  {ltvCacStatus.status}
                </Badge>
              </div>
            </div>

            <Progress
              value={
                ltvCacRatio
                  ? Math.min((ltvCacRatio / 5) * 100, 100) // Scale to 5:1 ratio
                  : 0
              }
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 3:1+ = Excellent (sustainable growth)</p>
              <p>• 2:1-3:1 = Good (profitable growth)</p>
              <p>• 1:1-2:1 = Marginal (needs improvement)</p>
              <p>• &lt;1:1 = Poor (unsustainable)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payback Period */}
      {projection.paybackPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Payback Period
            </CardTitle>
            <CardDescription>
              Time to recover customer acquisition costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Recovery Time</p>
                <p className="text-sm text-muted-foreground">
                  Months to break even on CAC
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    {projection.paybackPeriod} months
                  </span>
                </div>
                <Badge variant={paybackStatus.variant} className="mt-1">
                  {paybackStatus.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unit Economics Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Unit Economics Health
          </CardTitle>
          <CardDescription>
            Overall assessment of unit economics viability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* LTV/CAC Assessment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LTV/CAC Ratio</span>
                <Badge variant={ltvCacStatus.variant}>
                  {ltvCacStatus.status}
                </Badge>
              </div>
              <Progress
                value={ltvCacRatio ? Math.min((ltvCacRatio / 5) * 100, 100) : 0}
              />
            </div>

            {/* Payback Period Assessment */}
            {projection.paybackPeriod && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payback Period</span>
                  <Badge variant={paybackStatus.variant}>
                    {paybackStatus.status}
                  </Badge>
                </div>
                <Progress
                  value={
                    projection.paybackPeriod
                      ? Math.max(0, 100 - (projection.paybackPeriod / 24) * 100) // Invert scale (shorter = better)
                      : 0
                  }
                />
              </div>
            )}

            {/* Overall Assessment */}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <Badge
                variant={
                  ltvCacStatus.variant === "default" &&
                  paybackStatus.variant === "default"
                    ? "default"
                    : ltvCacStatus.variant === "destructive" ||
                        paybackStatus.variant === "destructive"
                      ? "destructive"
                      : "secondary"
                }
              >
                {ltvCacStatus.variant === "default" &&
                paybackStatus.variant === "default"
                  ? "Excellent"
                  : ltvCacStatus.variant === "destructive" ||
                      paybackStatus.variant === "destructive"
                    ? "Needs Improvement"
                    : "Good"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Alert */}
      {!hasUnitEconomics && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Unit economics data needed
                </p>
                <p className="text-sm text-orange-700">
                  Add ARPU, CLV, and CAC data for complete unit economics
                  analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
