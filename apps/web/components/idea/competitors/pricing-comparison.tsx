"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompetitors } from "@/actions/idea/competitive-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { DollarSign, Check, X, Star, TrendingUp, Target } from "lucide-react";

interface PricingComparisonProps {
  ideaId: string;
}

function formatPrice(price: number, billingCycle: string) {
  if (price === 0) return "Free";

  const formattedPrice =
    price >= 1000 ? `$${(price / 1000).toFixed(1)}k` : `$${price.toFixed(0)}`;

  return `${formattedPrice}/${billingCycle}`;
}

function getValueRating(price: number, features: string[]) {
  if (price === 0) return 5;
  if (features.length === 0) return 1;

  const featureCount = features.length;
  const pricePerFeature = price / featureCount;

  if (pricePerFeature < 10) return 5;
  if (pricePerFeature < 25) return 4;
  if (pricePerFeature < 50) return 3;
  if (pricePerFeature < 100) return 2;
  return 1;
}

export function PricingComparison({ ideaId }: PricingComparisonProps) {
  const {
    data: competitors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competitors", ideaId],
    queryFn: () => getCompetitors(ideaId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Comparison
          </CardTitle>
          <CardDescription>
            Competitive pricing analysis and feature comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load pricing data</p>
        </CardContent>
      </Card>
    );
  }

  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Comparison
          </CardTitle>
          <CardDescription>
            Competitive pricing analysis and feature comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No competitor pricing data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Collect all pricing plans from all competitors
  const allPricingPlans = competitors.flatMap((competitor) =>
    (competitor.pricing || []).map((plan) => ({
      ...plan,
      competitorName: competitor.name,
      competitorId: competitor.id,
    }))
  );

  // Collect all unique features
  const allFeatures = new Set<string>();
  allPricingPlans.forEach((plan) => {
    if (plan.features) {
      plan.features.split(",").forEach((feature) => {
        allFeatures.add(feature.trim());
      });
    }
  });

  const uniqueFeatures = Array.from(allFeatures);

  if (allPricingPlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Comparison
          </CardTitle>
          <CardDescription>
            Competitive pricing analysis and feature comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No pricing plans available for comparison
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Comparison
        </CardTitle>
        <CardDescription>
          Analysis of {allPricingPlans.length} pricing plans across{" "}
          {competitors.length} competitors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing Plans Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPricingPlans.map((plan) => {
              const features = plan.features
                ? plan.features.split(",").map((f) => f.trim())
                : [];
              const valueRating = getValueRating(plan.price || 0, features);

              return (
                <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{plan.name}</h4>
                      <Badge variant="outline">{plan.competitorName}</Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {formatPrice(
                          plan.price || 0,
                          plan.billingCycle || "month"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Value Rating */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Value:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= valueRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Key Features */}
                  {features.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Key Features</h5>
                      <div className="space-y-1">
                        {features.slice(0, 3).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {features.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Comparison Table */}
        {uniqueFeatures.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Feature</th>
                    {allPricingPlans.map((plan) => (
                      <th key={plan.id} className="text-center p-2 font-medium">
                        {plan.name}
                        <div className="text-xs text-muted-foreground">
                          {plan.competitorName}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueFeatures.map((feature) => (
                    <tr key={feature} className="border-b">
                      <td className="p-2 font-medium">{feature}</td>
                      {allPricingPlans.map((plan) => {
                        const features = plan.features
                          ? plan.features.split(",").map((f) => f.trim())
                          : [];
                        const hasFeature = features.includes(feature);

                        return (
                          <td key={plan.id} className="text-center p-2">
                            {hasFeature ? (
                              <Check className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-gray-300 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Price Range
              </div>
              <div className="text-2xl font-bold">
                $
                {Math.min(...allPricingPlans.map((p) => p.price || 0)).toFixed(
                  0
                )}{" "}
                - $
                {Math.max(...allPricingPlans.map((p) => p.price || 0)).toFixed(
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly pricing range
              </p>
            </div>

            {/* Average Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4" />
                Average Price
              </div>
              <div className="text-2xl font-bold">
                $
                {(
                  allPricingPlans.reduce((sum, p) => sum + (p.price || 0), 0) /
                  allPricingPlans.length
                ).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Per month</p>
            </div>

            {/* Free Plans */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Free Plans
              </div>
              <div className="text-2xl font-bold">
                {allPricingPlans.filter((p) => p.price === 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {allPricingPlans.length} total
              </p>
            </div>
          </div>
        </div>

        {/* Competitive Positioning */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Competitive Positioning</h3>
          <div className="space-y-3">
            {competitors.map((competitor) => {
              const competitorPlans = allPricingPlans.filter(
                (p) => p.competitorId === competitor.id
              );
              if (competitorPlans.length === 0) return null;

              const avgPrice =
                competitorPlans.reduce((sum, p) => sum + (p.price || 0), 0) /
                competitorPlans.length;
              const marketAvg =
                allPricingPlans.reduce((sum, p) => sum + (p.price || 0), 0) /
                allPricingPlans.length;
              const positioning =
                avgPrice < marketAvg * 0.8
                  ? "Low-cost"
                  : avgPrice > marketAvg * 1.2
                    ? "Premium"
                    : "Mid-market";

              return (
                <div
                  key={competitor.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{competitor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {competitorPlans.length} pricing plan
                      {competitorPlans.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={
                        positioning === "Premium"
                          ? "default"
                          : positioning === "Low-cost"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {positioning}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Avg: ${avgPrice.toFixed(0)}/mo
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
