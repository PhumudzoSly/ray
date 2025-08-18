import React from "react";
import { getPricingValidation } from "@/actions/idea/validation-pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line
} from "recharts";
import { 
  TierStructureDiagram 
} from "@/components/idea/validation/tier-structure-diagram";
import { 
  RevenueDistributionChart 
} from "@/components/idea/validation/revenue-distribution-chart";
import { 
  FeatureMatrixTable 
} from "@/components/idea/validation/feature-matrix-table";
import { 
  TierRevenueWaterfall 
} from "@/components/idea/validation/tier-revenue-waterfall";
import { 
  PriceSensitivityCurve 
} from "@/components/idea/validation/price-sensitivity-curve";
import { 
  RevenueProjectionTimeline 
} from "@/components/idea/validation/revenue-projection-timeline";

interface PricingValidationPageProps {
  params: Promise<{ id: string }>;
}

async function PricingValidationContent({ ideaId }: { ideaId: string }) {
  const pricingValidation = await getPricingValidation({ ideaId });

  if (!pricingValidation) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Pricing validation data not found.</p>
        </CardContent>
      </Card>
    );
  }

  // Format primary strategy
  const primaryStrategy = pricingValidation.primaryStrategy
    ?.replace("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A";

  // Prepare pricing tier data
  const tierData = pricingValidation.pricingTiers.map(tier => ({
    name: tier.tierName,
    price: tier.tierPrice,
    conversion: tier.conversionRate,
    popularity: tier.popularityScore,
    profit: tier.profitMargin
  }));

  // Prepare competitor pricing data
  const competitorData = pricingValidation.competitorPricing.map(comp => ({
    name: comp.competitorName,
    price: comp.basePrice,
    value: comp.valueComparison,
    marketPosition: comp.marketPosition
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Pricing Strategy</h1>
      
      {/* Strategy Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Strategy Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Primary Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{primaryStrategy}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recommended Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pricingValidation.recommendedPrice ? 
                  `$${pricingValidation.recommendedPrice.toFixed(2)}` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pricing Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-2">
                {pricingValidation.overallPricingScore ? 
                  `${pricingValidation.overallPricingScore.toFixed(0)}/100` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Price Acceptance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {pricingValidation.priceAcceptance ? 
                  `${pricingValidation.priceAcceptance.toFixed(0)}/100` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Competitiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {pricingValidation.competitivenessScore ? 
                  `${pricingValidation.competitivenessScore.toFixed(0)}/100` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profitability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                {pricingValidation.profitabilityScore ? 
                  `${pricingValidation.profitabilityScore.toFixed(0)}/100` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Tiers Analysis */}
      {pricingValidation.pricingTiers.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Pricing Tiers</h2>
          
          {/* Tier Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tiers Analyzed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center py-2">
                  {pricingValidation.totalTiersAnalyzed || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tier Structure</CardTitle>
              </CardHeader>
              <CardContent className="h-40">
                <TierStructureDiagram 
                  tiers={pricingValidation.pricingTiers.map(tier => ({
                    id: tier.id,
                    tierName: tier.tierName,
                    tierPrice: tier.tierPrice,
                    targetSegment: tier.targetSegment || ""
                  }))}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue Distribution */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Distribution by Tier</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <RevenueDistributionChart 
                tiers={pricingValidation.pricingTiers.map(tier => ({
                  id: tier.id,
                  tierName: tier.tierName,
                  expectedRevenue: tier.tierPrice * 1000, // Mock revenue calculation
                  conversionRate: tier.conversionRate
                }))}
              />
            </CardContent>
          </Card>
          
          {/* Individual Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {pricingValidation.pricingTiers.map((tier) => (
              <Card key={tier.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{tier.tierName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">${tier.tierPrice.toFixed(2)}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Conversion: </span>
                        <span className="font-medium">{tier.conversionRate.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Popularity: </span>
                        <span className="font-medium">{tier.popularityScore.toFixed(0)}/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit: </span>
                        <span className="font-medium">{tier.profitMargin.toFixed(0)}/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Competitive: </span>
                        <span className="font-medium">{tier.competitiveScore.toFixed(0)}/100</span>
                      </div>
                    </div>
                    {tier.targetSegment && (
                      <Badge variant="secondary" className="text-xs">
                        {tier.targetSegment}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Feature Matrix */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Feature Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <FeatureMatrixTable 
                features={["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]}
                tiers={pricingValidation.pricingTiers.map(tier => ({
                  id: tier.id,
                  tierName: tier.tierName,
                  tierFeatures: tier.tierFeatures
                }))}
              />
            </CardContent>
          </Card>
          
          {/* Tier Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate by Tier</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tierData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="conversion" fill="hsl(var(--chart-1))" name="Conversion Rate" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tier Revenue Waterfall</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <TierRevenueWaterfall 
                  tiers={pricingValidation.pricingTiers.map(tier => ({
                    id: tier.id,
                    tierName: tier.tierName,
                    expectedRevenue: tier.tierPrice * 1000, // Mock calculation
                    cumulativeRevenue: null // This would be calculated in the component
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Competitive Pricing Analysis */}
      {pricingValidation.competitorPricing.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Competitive Pricing</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Our Pricing vs Competitors</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="price" 
                        name="Price" 
                        unit="$" 
                        label={{ value: "Price ($)", position: "bottom" }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="value" 
                        name="Value" 
                        domain={[0, 100]}
                        label={{ value: "Value Comparison", angle: -90, position: "left" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Scatter 
                        name="Competitors" 
                        data={competitorData} 
                        fill="hsl(var(--chart-2))" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Market Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Lowest Price</div>
                      <div className="text-lg font-semibold">
                        ${Math.min(...pricingValidation.competitorPricing.map(c => c.basePrice)).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Highest Price</div>
                      <div className="text-lg font-semibold">
                        ${Math.max(...pricingValidation.competitorPricing.map(c => c.basePrice)).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Price</div>
                      <div className="text-lg font-semibold">
                        ${(pricingValidation.competitorPricing.reduce((sum, c) => sum + c.basePrice, 0) / 
                          pricingValidation.competitorPricing.length).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Competitor Pricing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pricingValidation.competitorPricing.slice(0, 5).map((competitor) => (
                      <div key={competitor.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{competitor.competitorName}</div>
                          <div className="text-xs text-muted-foreground">
                            {competitor.pricingModel}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${competitor.basePrice.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            {competitor.marketPosition?.replace("_", " ").toLowerCase() || "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Optimization */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Pricing Optimization</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Price Sensitivity Analysis</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <PriceSensitivityCurve 
                data={[
                  { price: 10, demand: 90, elasticity: -1.2 },
                  { price: 20, demand: 75, elasticity: -0.8 },
                  { price: 30, demand: 60, elasticity: -0.6 },
                  { price: 40, demand: 45, elasticity: -0.4 },
                  { price: 50, demand: 30, elasticity: -0.3 }
                ]}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Projections</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <RevenueProjectionTimeline 
                data={[
                  { month: "Month 1", optimistic: 10000, expected: 8000, pessimistic: 6000 },
                  { month: "Month 2", optimistic: 15000, expected: 12000, pessimistic: 9000 },
                  { month: "Month 3", optimistic: 20000, expected: 16000, pessimistic: 12000 },
                  { month: "Month 4", optimistic: 25000, expected: 20000, pessimistic: 15000 },
                  { month: "Month 5", optimistic: 30000, expected: 24000, pessimistic: 18000 },
                  { month: "Month 6", optimistic: 35000, expected: 28000, pessimistic: 21000 }
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Optimization Recommendations */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pricing Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">Consider value-based pricing</div>
                <div className="text-sm">Test price elasticity</div>
                <div className="text-sm">Monitor competitor moves</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">Roll out in Q2 2024</div>
                <div className="text-sm">A/B test with 10% of users</div>
                <div className="text-sm">Monitor metrics weekly</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">Conversion rate &gt; 5%</div>
                <div className="text-sm">Churn rate &lt; 3%</div>
                <div className="text-sm">LTV/CAC &gt; 3.0</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default async function PricingValidationPage({ params }: PricingValidationPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <PricingValidationContent ideaId={id} />
    </div>
  );
}