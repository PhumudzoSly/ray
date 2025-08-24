"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompetitor } from "@/actions/idea/competitor";
import { Badge } from "@workspace/ui/components/badge";
import { Users, DollarSign, TrendingUp, Star } from "lucide-react";
import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import { Separator } from "@workspace/ui/components/separator";
import { CollaborativeEditor } from "@/components/collaborative-editor";

interface CompetitorDetailsViewProps {
  competitorId: string;
}

interface MetricCardProps {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "positive":
        return "text-emerald-600 dark:text-emerald-400";
      case "negative":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-foreground";
    }
  };

  const getTrendIndicator = () => {
    switch (trend) {
      case "positive":
        return (
          <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
          </div>
        );
      case "negative":
        return (
          <div className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
            <TrendingUp className="h-3 w-3 rotate-180" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group border p-3">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              {label}
            </span>
            {getTrendIndicator()}
          </div>
          <div
            className={`text-xl font-semibold tracking-tight ${getTrendColor()}`}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompetitorDetailsView({
  competitorId,
}: CompetitorDetailsViewProps) {
  const { data: competitor, isLoading } = useQuery({
    queryKey: ["competitor", competitorId],
    queryFn: () => getCompetitor({ id: competitorId }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Competitor not found</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not disclosed";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 1000000);
  };

  const formatPercentage = (value: number | null) => {
    if (!value) return "Not available";
    return `${value.toFixed(1)}%`;
  };

  const getMarketShareDescription = (share: number | null) => {
    if (!share) return "Market share data not available for analysis";
    if (share < 1) return "Niche player with minimal market presence";
    if (share < 5) return "Small market player with growth potential";
    if (share < 15) return "Established competitor with significant presence";
    if (share < 30) return "Major market player with strong position";
    return "Market leader with dominant position";
  };

  const getGrowthDescription = (rate: number | null) => {
    if (!rate) return "Growth metrics not publicly available";
    if (rate < 0)
      return "Experiencing user decline, potential market challenges";
    if (rate < 10) return "Steady growth, maintaining market position";
    if (rate < 25) return "Strong growth trajectory, expanding market share";
    return "Rapid expansion, aggressive market capture";
  };

  const getChurnDescription = (churn: number | null) => {
    if (!churn) return "Customer retention data not disclosed";
    if (churn < 5)
      return "Excellent customer retention, strong product-market fit";
    if (churn < 10) return "Good retention rates, competitive offering";
    if (churn < 20) return "Average retention, room for improvement";
    return "High churn rate, potential customer satisfaction issues";
  };

  const getSatisfactionDescription = (score: number | null) => {
    if (!score) return "Customer satisfaction metrics not available";
    if (score < 6)
      return "Below average satisfaction, significant improvement needed";
    if (score < 7.5)
      return "Average customer satisfaction, competitive baseline";
    if (score < 9) return "Good customer satisfaction, strong market position";
    return "Excellent customer satisfaction, market-leading experience";
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Annual Revenue"
          value={formatCurrency(competitor.annualRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Market Share"
          value={formatPercentage(competitor.marketShare)}
          icon={<Star className="h-4 w-4" />}
        />
        <MetricCard
          label="User Growth Rate"
          value={formatPercentage(competitor.userGrowthRate)}
          icon={<Users className="h-4 w-4" />}
          trend={
            competitor.userGrowthRate
              ? competitor.userGrowthRate > 15
                ? "positive"
                : competitor.userGrowthRate < 0
                  ? "negative"
                  : "neutral"
              : "neutral"
          }
        />
        <MetricCard
          label="Customer Satisfaction"
          value={
            competitor.customerSatisfaction
              ? `${competitor.customerSatisfaction.toFixed(1)}/10`
              : "Not rated"
          }
          icon={<Star className="h-4 w-4" />}
          trend={
            competitor.customerSatisfaction
              ? competitor.customerSatisfaction > 8
                ? "positive"
                : competitor.customerSatisfaction < 6
                  ? "negative"
                  : "neutral"
              : "neutral"
          }
        />
      </div>

      <Separator />
      <CollaborativeEditor entityId={competitor.id} entityType="competitor" />
    </div>
  );
}
