"use client";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { usePricingStrategy } from "@/lib/queries/validation";
import { SectionHeader } from "./shared/SectionHeader";
import {
  ReportSection,
  ReportParagraph,
  ReportHighlight,
  ReportList,
} from "./shared/ReportComponents";
import { ReportMetric } from "./shared/ReportMetric";

interface PricingStrategyProps {
  ideaId: string;
}

export function PricingStrategy({ ideaId }: PricingStrategyProps) {
  const { data, isLoading, error } = usePricingStrategy(ideaId);

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

  if (error || !data) {
    return null;
  }

  const getPricingAssessment = (score: number) => {
    if (score >= 80)
      return "Excellent pricing strategy with strong market acceptance and competitive positioning";
    if (score >= 70)
      return "Strong pricing strategy supporting business objectives and market penetration";
    if (score >= 60)
      return "Adequate pricing strategy requiring optimization for maximum market impact";
    if (score >= 40)
      return "Suboptimal pricing strategy necessitating significant adjustments and market testing";
    return "Poor pricing strategy requiring fundamental revision and market research";
  };

  const primaryStrategy = data.primaryStrategy || "Value-Based";
  const recommendedPrice = data.recommendedPrice || 0;
  const priceAcceptance = data.priceAcceptance || 0;
  const competitiveness = data.competitivenessScore || 0;
  const tiers = data.pricingTiers || [];

  const averageTierPrice =
    tiers.length > 0
      ? Math.round(
          tiers.reduce((sum, tier) => sum + tier.tierPrice, 0) / tiers.length
        )
      : 0;
  const popularTier =
    tiers.length > 0
      ? tiers.reduce((prev, current) =>
          prev.popularityScore > current.popularityScore ? prev : current
        )
      : null;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title="Pricing Strategy Analysis"
          score={data.overallPricingScore}
          subtitle="Pricing Optimization & Revenue Strategy"
          description="Comprehensive analysis of pricing tiers, competitive positioning, and revenue optimization strategies"
        />
      </CardHeader>

      <CardContent>
        <ReportSection>
          <ReportParagraph emphasis>
            Our pricing strategy analysis centers on a{" "}
            <strong>{primaryStrategy}</strong> approach with a recommended price
            point of{" "}
            <strong>
              ${recommendedPrice > 0 ? Math.round(recommendedPrice) : "TBD"}
            </strong>
            , achieving
            <strong>{Math.round(priceAcceptance)}%</strong> market acceptance
            and
            <strong>{Math.round(competitiveness)}%</strong> competitive
            positioning score.
          </ReportParagraph>

          <ReportHighlight
            type={
              data.overallPricingScore >= 70
                ? "success"
                : data.overallPricingScore >= 50
                  ? "info"
                  : "warning"
            }
          >
            <ReportParagraph emphasis>
              <strong>Pricing Assessment:</strong>{" "}
              {getPricingAssessment(data.overallPricingScore)}
            </ReportParagraph>
          </ReportHighlight>

          {/* Pricing Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
            <div className="space-y-2 text-center p-4 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">
                Primary Strategy
              </div>
              <Badge variant="outline" className="text-sm font-medium">
                {primaryStrategy}
              </Badge>
            </div>
            <ReportMetric
              label="Recommended Price"
              value={
                recommendedPrice > 0
                  ? `$${Math.round(recommendedPrice)}`
                  : "TBD"
              }
              description="Optimal price point for market entry"
            />
            <ReportMetric
              label="Market Acceptance"
              value={Math.round(priceAcceptance)}
              unit="%"
              description="Customer willingness to pay"
            />
            <ReportMetric
              label="Competitive Position"
              value={Math.round(competitiveness)}
              unit="%"
              description="Relative market positioning"
            />
          </div>

          {/* Pricing Strategy Analysis */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Pricing Strategy Evaluation</h3>
            <ReportParagraph>
              The <strong>{primaryStrategy}</strong> pricing strategy
              {priceAcceptance >= 70
                ? "demonstrates strong market validation"
                : priceAcceptance >= 50
                  ? "shows moderate market acceptance"
                  : "faces market resistance requiring adjustment"}
              . Competitive analysis indicates
              {competitiveness >= 70
                ? "strong positioning"
                : competitiveness >= 50
                  ? "adequate positioning"
                  : "weak positioning"}
              relative to market alternatives.
            </ReportParagraph>
          </div>

          {/* Pricing Tiers Analysis */}
          {tiers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Pricing Tier Strategy</h3>
              <ReportParagraph>
                Our tiered pricing strategy includes{" "}
                <strong>{tiers.length}</strong> distinct pricing levels with an
                average price point of <strong>${averageTierPrice}</strong>.
                {popularTier && (
                  <>
                    The <strong>{popularTier.tierName}</strong> tier shows
                    highest market appeal with{" "}
                    <strong>{Math.round(popularTier.popularityScore)}%</strong>{" "}
                    popularity score.
                  </>
                )}
              </ReportParagraph>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers
                  .sort((a, b) => a.tierPrice - b.tierPrice)
                  .map((tier, index) => {
                    const isPopular = popularTier && tier.id === popularTier.id;
                    const tierValue =
                      tier.tierPrice >= averageTierPrice
                        ? "Premium"
                        : tier.tierPrice >= averageTierPrice * 0.5
                          ? "Standard"
                          : "Basic";

                    return (
                      <div
                        key={tier.id}
                        className={`p-4 border rounded-lg ${
                          isPopular
                            ? "border-blue-500 bg-blue-50"
                            : "border-muted"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <h4 className="font-bold text-lg">
                                {tier.tierName}
                              </h4>
                              {isPopular && (
                                <Badge variant="secondary" className="text-xs">
                                  Most Popular
                                </Badge>
                              )}
                            </div>
                            <div className="text-3xl font-bold text-blue-600">
                              ${Math.round(tier.tierPrice)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tier.targetSegment}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-center">
                              <div className="text-muted-foreground">
                                Conversion
                              </div>
                              <div
                                className={`font-bold ${
                                  tier.conversionRate >= 20
                                    ? "text-green-600"
                                    : tier.conversionRate >= 10
                                      ? "text-blue-600"
                                      : "text-yellow-600"
                                }`}
                              >
                                {Math.round(tier.conversionRate)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">
                                Popularity
                              </div>
                              <div
                                className={`font-bold ${
                                  tier.popularityScore >= 70
                                    ? "text-green-600"
                                    : tier.popularityScore >= 50
                                      ? "text-blue-600"
                                      : "text-yellow-600"
                                }`}
                              >
                                {Math.round(tier.popularityScore)}%
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {tierValue} Tier
                            </Badge>
                          </div>

                          {tier.tierFeatures &&
                            tier.tierFeatures.length > 0 && (
                              <div>
                                <div className="font-medium text-sm mb-2 text-center">
                                  Key Features
                                </div>
                                <div className="text-xs space-y-1">
                                  {tier.tierFeatures
                                    .slice(0, 4)
                                    .map((feature, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-1"
                                      >
                                        <span className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                                        <span className="text-xs">
                                          {feature}
                                        </span>
                                      </div>
                                    ))}
                                  {tier.tierFeatures.length > 4 && (
                                    <div className="text-center text-muted-foreground text-xs">
                                      +{tier.tierFeatures.length - 4} more
                                      features
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Pricing Insights & Recommendations */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Strategic Pricing Recommendations
            </h3>
            <ReportList
              items={[
                priceAcceptance >= 70
                  ? "Strong price acceptance supports premium positioning and revenue optimization"
                  : "Limited price acceptance requires value proposition enhancement or price adjustment",
                competitiveness >= 70
                  ? "Strong competitive positioning enables pricing power and market leadership"
                  : "Competitive positioning requires improvement through differentiation or cost optimization",
                tiers.length >= 3
                  ? "Multi-tier strategy captures diverse customer segments and maximizes revenue potential"
                  : "Consider expanding tier options to capture broader market segments",
                popularTier
                  ? `${popularTier.tierName} tier shows strongest market appeal and should drive primary marketing focus`
                  : "Tier performance data suggests need for pricing strategy refinement",
              ]}
            />
          </div>

          {/* Pricing Optimization */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              Pricing Optimization Opportunities
            </h3>
            <ReportParagraph>
              Based on our analysis, key opportunities for pricing optimization
              include:
            </ReportParagraph>

            <div className="space-y-2">
              {priceAcceptance < 70 && (
                <ReportParagraph>
                  <strong>Price Sensitivity:</strong> Market shows resistance to
                  current pricing, suggesting need for value proposition
                  enhancement or strategic price adjustment to improve
                  acceptance.
                </ReportParagraph>
              )}

              {competitiveness < 70 && (
                <ReportParagraph>
                  <strong>Competitive Position:</strong> Pricing position
                  relative to competitors requires improvement through
                  differentiation, feature optimization, or strategic
                  repositioning.
                </ReportParagraph>
              )}

              {tiers.length > 0 && tiers.some((t) => t.conversionRate < 15) && (
                <ReportParagraph>
                  <strong>Tier Performance:</strong> Some pricing tiers show low
                  conversion rates, indicating opportunities for tier
                  restructuring, feature rebalancing, or price point adjustment.
                </ReportParagraph>
              )}

              {averageTierPrice > 0 &&
                recommendedPrice > 0 &&
                Math.abs(averageTierPrice - recommendedPrice) /
                  recommendedPrice >
                  0.2 && (
                  <ReportParagraph>
                    <strong>Price Alignment:</strong> Gap between recommended
                    price and tier averages suggests opportunity for pricing
                    strategy alignment and optimization.
                  </ReportParagraph>
                )}
            </div>
          </div>

          <ReportParagraph>
            The pricing strategy analysis indicates{" "}
            {data.overallPricingScore >= 70
              ? "strong pricing fundamentals"
              : "optimization opportunities"}
            with{" "}
            {priceAcceptance >= 70
              ? "good market acceptance"
              : "price sensitivity challenges"}{" "}
            and
            {competitiveness >= 70
              ? "competitive advantages"
              : "positioning improvements needed"}
            . Success depends on{" "}
            {priceAcceptance < 70 ? "addressing price acceptance issues, " : ""}
            {competitiveness < 70 ? "improving competitive positioning, " : ""}
            and leveraging{" "}
            {popularTier
              ? `the ${popularTier.tierName} tier's popularity`
              : "tier optimization opportunities"}
            for revenue maximization.
          </ReportParagraph>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
