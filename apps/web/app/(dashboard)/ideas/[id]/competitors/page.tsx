import React from "react";
import { getCompetitorValidation } from "@/actions/idea/validation-competitors";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { MarketShareChart } from "@/components/idea/validation/market-share-chart";
import { FeatureComparisonHeatmap } from "@/components/idea/validation/feature-comparison-heatmap";
import { PricingDistributionHistogram } from "@/components/idea/validation/pricing-distribution-histogram";
import { SWOTAnalysisQuadrant } from "@/components/idea/validation/swot-analysis-quadrant";

interface CompetitorsValidationPageProps {
  params: Promise<{ id: string }>;
}

async function CompetitorsValidationContent({ ideaId }: { ideaId: string }) {
  const idea = await getCompetitorValidation({ ideaId });

  if (!idea) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Competitor data not found.</p>
        </CardContent>
      </Card>
    );
  }

  const competitors = idea.Competitor;

  // Prepare data for competitive positioning chart
  const positioningData = competitors
    .filter(comp => comp.marketShare !== null && comp.customerSatisfaction !== null)
    .map(comp => ({
      name: comp.name,
      marketShare: comp.marketShare,
      satisfaction: comp.customerSatisfaction,
      revenue: comp.annualRevenue
    }));

  // Threat level distribution
  const threatLevelCounts = competitors.reduce((acc, comp) => {
    acc[comp.threatLevel] = (acc[comp.threatLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const threatLevelData = Object.entries(threatLevelCounts).map(([level, count]) => ({
    name: level.toLowerCase(),
    value: count
  }));

  // Colors for charts
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))", 
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Competitor Analysis</h1>
        <Button variant="outline">Find More Competitors</Button>
      </div>
      
      {/* Market Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Market Landscape</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Competitors Identified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-2">{competitors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Market Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-2">
                {competitors.length > 0 && competitors.some(c => c.marketShare !== null) 
                  ? `${(competitors
                      .filter(c => c.marketShare !== null)
                      .reduce((sum, c) => sum + (c.marketShare || 0), 0) / 
                    competitors.filter(c => c.marketShare !== null).length).toFixed(1)}%` 
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Threat Level Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-40">
              {threatLevelData.length > 0 ? (
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={threatLevelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={35}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {threatLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No threat data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Market Share Distribution */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Market Share Distribution</h2>
        <Card className="h-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Competitor Market Share</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketShareChart 
              competitors={competitors.map(comp => ({
                id: comp.id,
                name: comp.name,
                marketShare: comp.marketShare
              }))}
            />
          </CardContent>
        </Card>
      </section>

      {/* Competitive Positioning */}
      {positioningData.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Competitive Positioning</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Share vs Customer Satisfaction</CardTitle>
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
                      dataKey="marketShare" 
                      name="Market Share" 
                      unit="%" 
                      domain={[0, 100]}
                      label={{ value: "Market Share (%)", position: "bottom" }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="satisfaction" 
                      name="Satisfaction" 
                      domain={[0, 100]}
                      label={{ value: "Customer Satisfaction", angle: -90, position: "left" }}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="revenue" 
                      range={[100, 1000]} 
                      name="Revenue" 
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter 
                      name="Competitors" 
                      data={positioningData} 
                      fill="hsl(var(--chart-1))" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Direct Competitors Analysis */}
      {competitors.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Direct Competitors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor) => (
              <Card key={competitor.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex justify-between">
                    <span>{competitor.name}</span>
                    <Badge variant={
                      competitor.threatLevel === "CRITICAL" ? "destructive" :
                      competitor.threatLevel === "HIGH" ? "default" :
                      competitor.threatLevel === "MEDIUM" ? "secondary" : "outline"
                    }>
                      {competitor.threatLevel.toLowerCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {competitor.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {competitor.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {competitor.marketShare !== null && (
                        <div>
                          <span className="text-muted-foreground">Market Share: </span>
                          <span className="font-medium">{competitor.marketShare.toFixed(1)}%</span>
                        </div>
                      )}
                      {competitor.customerSatisfaction !== null && (
                        <div>
                          <span className="text-muted-foreground">Satisfaction: </span>
                          <span className="font-medium">{competitor.customerSatisfaction.toFixed(0)}/100</span>
                        </div>
                      )}
                      {competitor.annualRevenue !== null && (
                        <div>
                          <span className="text-muted-foreground">Revenue: </span>
                          <span className="font-medium">${(competitor.annualRevenue / 1000).toFixed(0)}M</span>
                        </div>
                      )}
                      {competitor.foundedYear && (
                        <div>
                          <span className="text-muted-foreground">Founded: </span>
                          <span className="font-medium">{competitor.foundedYear}</span>
                        </div>
                      )}
                      {competitor.headquarters && (
                        <div>
                          <span className="text-muted-foreground">HQ: </span>
                          <span className="font-medium">{competitor.headquarters}</span>
                        </div>
                      )}
                      {competitor.employeeCount && (
                        <div>
                          <span className="text-muted-foreground">Employees: </span>
                          <span className="font-medium">{competitor.employeeCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Feature Comparison */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Feature Comparison</h2>
        <Card className="h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feature Availability Across Competitors</CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureComparisonHeatmap 
              features={["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]}
              competitors={competitors.slice(0, 5).map(comp => ({
                id: comp.id,
                name: comp.name,
                featureScores: {
                  "Feature 1": Math.floor(Math.random() * 100),
                  "Feature 2": Math.floor(Math.random() * 100),
                  "Feature 3": Math.floor(Math.random() * 100),
                  "Feature 4": Math.floor(Math.random() * 100),
                  "Feature 5": Math.floor(Math.random() * 100)
                }
              }))}
            />
          </CardContent>
        </Card>
      </section>

      {/* Pricing Distribution */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Pricing Analysis</h2>
        <Card className="h-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Competitor Pricing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PricingDistributionHistogram 
              competitors={competitors.map(comp => ({
                id: comp.id,
                name: comp.name,
                basePrice: comp.annualRevenue ? comp.annualRevenue / 12 : undefined,
                premiumPrice: comp.annualRevenue ? (comp.annualRevenue / 12) * 1.5 : undefined
              }))}
            />
          </CardContent>
        </Card>
      </section>

      {/* SWOT Analysis */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Strategic Analysis</h2>
        <Card className="h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SWOT Analysis Quadrant</CardTitle>
          </CardHeader>
          <CardContent>
            <SWOTAnalysisQuadrant 
              factors={[
                { id: "1", factor: "Strong Brand", impact: 80, urgency: 70, type: "Strength" },
                { id: "2", factor: "Limited Market Reach", impact: -60, urgency: -50, type: "Weakness" },
                { id: "3", factor: "Emerging Market", impact: 75, urgency: 85, type: "Opportunity" },
                { id: "4", factor: "New Regulations", impact: -70, urgency: -80, type: "Threat" }
              ]}
            />
          </CardContent>
        </Card>
      </section>

      {/* Competitive Intelligence */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Competitive Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">Innovative Technology</div>
                <div className="text-sm">Strong Customer Base</div>
                <div className="text-sm">Experienced Team</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">Limited Marketing Budget</div>
                <div className="text-sm">Smaller Team Size</div>
                <div className="text-sm">New to Market</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">Market Expansion</div>
                <div className="text-sm">Partnership Opportunities</div>
                <div className="text-sm">Technology Trends</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">New Entrants</div>
                <div className="text-sm">Economic Downturn</div>
                <div className="text-sm">Changing Regulations</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default async function CompetitorsValidationPage({ params }: CompetitorsValidationPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <CompetitorsValidationContent ideaId={id} />
    </div>
  );
}