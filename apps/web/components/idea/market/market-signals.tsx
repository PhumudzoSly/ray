"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMarketSignals } from "@/actions/idea/market-research";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Target,
  Zap,
  Clock,
  BarChart3,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketSignalsProps {
  ideaId: string;
}

export const MarketSignals: React.FC<MarketSignalsProps> = ({ ideaId }) => {
  const { data: marketSignals, isPending } = useQuery({
    queryKey: ["market-signals", ideaId],
    queryFn: () => getMarketSignals(ideaId),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!marketSignals || marketSignals.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        No market signals data available
      </div>
    );
  }

  const getSignalStrengthColor = (strength: string) => {
    switch (strength) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "STRONG":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "WEAK":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSignalTypeIcon = (type: string) => {
    const signalType = type.toLowerCase();
    if (signalType.includes("funding"))
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (signalType.includes("product"))
      return <Zap className="h-4 w-4 text-blue-600" />;
    if (signalType.includes("partnership"))
      return <Target className="h-4 w-4 text-purple-600" />;
    if (signalType.includes("acquisition"))
      return <BarChart3 className="h-4 w-4 text-orange-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getImpactColor = (impact: string | null) => {
    if (!impact) return "text-gray-600";
    
    const impactLower = impact.toLowerCase();
    if (impactLower.includes("high") || impactLower.includes("critical"))
      return "text-red-600";
    if (impactLower.includes("medium") || impactLower.includes("moderate"))
      return "text-orange-600";
    if (impactLower.includes("low") || impactLower.includes("minimal"))
      return "text-green-600";
    return "text-gray-600";
  };

  const getConfidenceLevel = (confidence: number | null) => {
    if (!confidence) return "Unknown";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    if (confidence >= 0.4) return "Low";
    return "Very Low";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Market Signals</h3>
      </div>

      <div className="space-y-4">
        {marketSignals.map((signal) => (
          <Card key={signal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getSignalTypeIcon(signal.signalType)}
                    <CardTitle className="text-base">
                      {signal.title}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {signal.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getSignalStrengthColor(signal.strength)
                  )}
                >
                  {signal.strength}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Signal Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>Strength</span>
                    </div>
                    <div className="font-medium capitalize">
                      {signal.strength.toLowerCase()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>Confidence</span>
                    </div>
                    <div className="font-medium capitalize">
                      {getConfidenceLevel(signal.confidence)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      <span>Market Impact</span>
                    </div>
                    <div
                      className={cn(
                        "font-medium capitalize",
                        getImpactColor(signal.marketImpact)
                      )}
                    >
                      {signal.marketImpact?.toLowerCase() || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Timing</span>
                    </div>
                    <div className="font-medium capitalize">
                      {signal.timing?.toLowerCase() || "N/A"}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Impact Analysis */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Impact Analysis
                  </h4>

                  {/* Market Impact */}
                  {signal.marketImpact && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Market Impact</div>
                      <p className="text-sm text-muted-foreground">
                        {signal.marketImpact}
                      </p>
                    </div>
                  )}

                  {/* Competitive Impact */}
                  {signal.competitiveImpact && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Competitive Impact
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signal.competitiveImpact}
                      </p>
                    </div>
                  )}

                  {/* Timing */}
                  {signal.timing && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Timing Considerations
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signal.timing}
                      </p>
                    </div>
                  )}
                </div>

                {/* Source Information */}
                {signal.source && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Source
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {signal.source}
                      </p>
                    </div>
                  </>
                )}

                {/* Monitoring Status */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        signal.isMonitored ? "bg-green-500" : "bg-gray-400"
                      )}
                    />
                    <span>
                      {signal.isMonitored
                        ? "Actively Monitoring"
                        : "Not Monitoring"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
