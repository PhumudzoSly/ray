"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMarketResearch } from "@/actions/idea/market-research";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { 
  AlertCircle, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  BarChart3,
  Zap,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickMetricsDashboardProps {
  ideaId: string;
}

export const QuickMetricsDashboard: React.FC<QuickMetricsDashboardProps> = ({
  ideaId,
}) => {
  const { data: marketResearch, isPending } = useQuery({
    queryKey: ["market-research", ideaId],
    queryFn: () => getMarketResearch(ideaId),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!marketResearch) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No market research data available
      </div>
    );
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "N/A";
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case "EMERGING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "GROWING":
        return "bg-green-100 text-green-800 border-green-200";
      case "MATURE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DECLINING":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "HIGH":
        return "bg-green-100 text-green-800 border-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const metrics = [
    {
      label: "Market Size",
      value: formatCurrency(marketResearch.marketSize),
      subtitle: "Total market value",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Growth Rate",
      value: formatPercentage(marketResearch.marketGrowthRate),
      subtitle: "Annual growth",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Validation Score",
      value: marketResearch.validationScore ? `${Math.round(marketResearch.validationScore)}/100` : "N/A",
      subtitle: "AI confidence",
      icon: Target,
      color: "text-purple-600",
    },
    {
      label: "Market Maturity",
      value: marketResearch.marketMaturity ? marketResearch.marketMaturity.replace("_", " ") : "N/A",
      subtitle: "Market stage",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Quick Metrics</h3>
      
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center gap-2">
              <metric.icon className={cn("h-4 w-4", metric.color)} />
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-semibold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Size Breakdown */}
      {(marketResearch.totalAddressableMarket || marketResearch.serviceableAddressableMarket || marketResearch.serviceableObtainableMarket) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Market Size Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketResearch.totalAddressableMarket && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">TAM</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(marketResearch.totalAddressableMarket)}
                </div>
                <div className="text-xs text-muted-foreground">Total Addressable Market</div>
              </div>
            )}
            {marketResearch.serviceableAddressableMarket && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">SAM</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(marketResearch.serviceableAddressableMarket)}
                </div>
                <div className="text-xs text-muted-foreground">Serviceable Addressable Market</div>
              </div>
            )}
            {marketResearch.serviceableObtainableMarket && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">SOM</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(marketResearch.serviceableObtainableMarket)}
                </div>
                <div className="text-xs text-muted-foreground">Serviceable Obtainable Market</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confidence Level */}
      {marketResearch.confidenceLevel && (
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-muted-foreground">Confidence:</span>
          <Badge variant="outline" className={getConfidenceColor(marketResearch.confidenceLevel)}>
            {marketResearch.confidenceLevel}
          </Badge>
        </div>
      )}
    </div>
  );
}; 