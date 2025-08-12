import React from "react";
import { getBusinessValidation } from "@/actions/idea/validation-business";
import { getMarketValidation } from "@/actions/idea/validation-market";
import { getRiskValidation } from "@/actions/idea/validation-risk";
import { getMarketTrendAnalysis } from "@/actions/idea/validation-trends";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Legend,
  FunnelChart,
  Funnel,
  Cell,
  PieChart,
  Pie,
  ScatterChart,
  Scatter
} from "recharts";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { RiskMitigationTable } from "@/components/idea/validation/risk-mitigation-table";

interface BusinessValidationPageProps {
  params: Promise<{ id: string }>;
}

async function BusinessValidationContent({ ideaId }: { ideaId: string }) {
  const [businessValidation, marketValidation, riskValidation, trendValidation] = await Promise.all([
    getBusinessValidation({ ideaId }),
    getMarketValidation({ ideaId }),
    getRiskValidation({ ideaId }),
    getMarketTrendAnalysis({ ideaId })
  ]);

  if (!businessValidation && !marketValidation && !riskValidation && !trendValidation) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Validation data not found.</p>
        </CardContent>
      </Card>
    );
  }

  // Format revenue model and pricing strategy
  const revenueModel = businessValidation?.primaryRevenueModel
    ?.replace("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A";
    
  const pricingStrategy = businessValidation?.pricingStrategy
    ?.replace("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A";
    
  const goToMarketStrategy = businessValidation?.goToMarketStrategy
    ?.replace("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A";

  // Prepare financial projection data
  const projectionData = businessValidation?.monthlyProjections.map(proj => ({
    month: `Month ${proj.month}`,
    revenue: proj.revenue,
    costs: proj.costs,
    profit: proj.revenue - proj.costs
  })) || [];

  // Prepare acquisition channel data
  const channelData = businessValidation?.acquisitionChannels.map(channel => ({
    name: channel.channel,
    effectiveness: channel.effectiveness,
    cost: channel.cost
  })) || [];

  // Format customer segment
  const customerSegment = marketValidation?.primaryCustomerSegment
    ?.replace("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A";

  // Prepare market size funnel data
  const marketSizeData = [
    { name: "TAM", value: marketValidation?.totalAddressableMarket || 0 },
    { name: "SAM", value: marketValidation?.serviceableAddressableMarket || 0 },
    { name: "SOM", value: marketValidation?.serviceableObtainableMarket || 0 }
  ];

  // Prepare region data
  const regionData = marketValidation?.regionScores.map(region => ({
    name: region.region,
    score: region.score
  })) || [];

  // Risk matrix data
  const riskMatrixData = riskValidation?.riskItems.map(item => ({
    ...item,
    probabilityScore: item.probability * 20, // Convert 1-5 to 0-100 scale
    impactScore: item.impact * 20 // Convert 1-5 to 0-100 scale
  })) || [];

  // Risk category distribution
  const categoryCounts = (riskValidation?.riskItems || []).reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: category,
    value: count
  }));

  // Market trend data
  const trendData = (trendValidation?.marketTrends || []).slice(0, 5).map(trend => ({
    name: trend.trendName,
    impact: trend.impactScore,
    timeline: trend.timelineMonths || 0,
    certainty: trend.certaintyLevel
  })) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Business Validation</h1>
      
      {/* Revenue Model & Strategy */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Revenue Model & Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Primary Revenue Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{revenueModel}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pricing Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{pricingStrategy}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Primary Price Point</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {businessValidation?.pricePoint ? `$${businessValidation.pricePoint.toFixed(2)}` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Go-to-Market Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{goToMarketStrategy}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sales Cycle Length</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {businessValidation?.salesCycleLength ? `${businessValidation.salesCycleLength} days` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Unit Economics */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Unit Economics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer Acquisition Cost (CAC)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessValidation?.customerAcquisitionCost ? 
                  `$${businessValidation.customerAcquisitionCost.toFixed(2)}` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer Lifetime Value (LTV)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessValidation?.customerLifetimeValue ? 
                  `$${businessValidation.customerLifetimeValue.toFixed(2)}` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">LTV/CAC Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessValidation?.customerLifetimeValue && businessValidation?.customerAcquisitionCost && 
                 businessValidation?.customerAcquisitionCost > 0 ?
                  (businessValidation.customerLifetimeValue / businessValidation.customerAcquisitionCost).toFixed(2) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {businessValidation?.customerLifetimeValue && businessValidation?.customerAcquisitionCost && 
                 businessValidation?.customerAcquisitionCost > 0 ?
                  (businessValidation.customerLifetimeValue / businessValidation.customerAcquisitionCost) >= 3 ? 
                  "Healthy (>3)" : "Needs improvement (<3)" : ""}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businessValidation?.monthlyChurnRate ? 
                  `${businessValidation.monthlyChurnRate.toFixed(2)}%` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Financial Projections */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Financial Projections</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue vs Costs Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {projectionData.length > 0 ? (
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2} 
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }} 
                        name="Revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="costs" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2} 
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }} 
                        name="Costs"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2} 
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }} 
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No financial projection data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Break-even Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold">
                    {businessValidation?.breakEvenMonth ? `Month ${businessValidation.breakEvenMonth}` : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {businessValidation?.breakEvenMonth ? 
                      `Expected to break even in ${businessValidation.breakEvenMonth} months` : 
                      "Break-even point not calculated"}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Investment Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Initial Investment</div>
                  <div className="text-lg font-semibold">
                    {businessValidation?.initialInvestment ? 
                      `$${businessValidation.initialInvestment.toLocaleString()}` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Funding Needed</div>
                  <div className="text-lg font-semibold">
                    {businessValidation?.totalFundingNeeded ? 
                      `$${businessValidation.totalFundingNeeded.toLocaleString()}` : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Validation Section */}
      {marketValidation && (
        <>
          {/* Market Size Analysis */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Market Validation</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Market Size Analysis (Millions USD)</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  {marketSizeData.some(item => item.value > 0) ? (
                    <ChartContainer config={{}} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <FunnelChart>
                          <Tooltip content={<ChartTooltipContent />} />
                          <Funnel
                            dataKey="value"
                            data={marketSizeData}
                            isAnimationActive
                          >
                            {marketSizeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                            ))}
                          </Funnel>
                        </FunnelChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No market size data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Market Size Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">TAM</div>
                      <div className="text-lg font-semibold">
                        {marketValidation.totalAddressableMarket ? 
                          `$${marketValidation.totalAddressableMarket.toFixed(1)}M` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SAM</div>
                      <div className="text-lg font-semibold">
                        {marketValidation.serviceableAddressableMarket ? 
                          `$${marketValidation.serviceableAddressableMarket.toFixed(1)}M` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SOM</div>
                      <div className="text-lg font-semibold">
                        {marketValidation.serviceableObtainableMarket ? 
                          `$${marketValidation.serviceableObtainableMarket.toFixed(1)}M` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Growth Rate</div>
                      <div className="text-lg font-semibold">
                        {marketValidation.marketGrowthRate ? 
                          `${marketValidation.marketGrowthRate.toFixed(1)}%` : "N/A"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Customer Research</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Primary Segment</div>
                        <Badge variant="secondary" className="mt-1">
                          {customerSegment}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interviews</span>
                        <span className="font-medium">{marketValidation.customerInterviews || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Survey Responses</span>
                        <span className="font-medium">{marketValidation.surveyResponses || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Geographic Analysis */}
          {regionData.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Geographic Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Regional Market Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ChartContainer config={{}} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Primary Regions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {marketValidation?.primaryRegions.map((region, index) => (
                        <Badge key={index} variant="outline">
                          {region}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      {regionData.slice(0, 5).map((region, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm">{region.name}</span>
                          <span className="font-medium">{region.score.toFixed(0)}/100</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Market Insights */}
          {marketValidation.marketInsights.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Market Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketValidation.marketInsights.map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex justify-between">
                        <span>{insight.label || insight.category}</span>
                        <Badge variant="secondary">{insight.category}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {insight.description || "No description available"}
                      </p>
                      <div className="flex justify-between mt-3">
                        <span className="text-xs">Impact: {insight.impact.toFixed(0)}/100</span>
                        <span className="text-xs">Urgency: {insight.urgency.toFixed(0)}/100</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Market Trends Section */}
      {trendValidation && trendValidation.marketTrends.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Market Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trend Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Primary Trend</div>
                    <div className="font-medium">{trendValidation.primaryTrend || "N/A"}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Trends Tracked</span>
                    <span className="font-medium">{trendValidation.totalTrendsTracked || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Timeframe</span>
                    <span className="font-medium">{trendValidation.analysisTimeframe || 0} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="font-medium">
                      {trendValidation.overallTrendScore ? `${trendValidation.overallTrendScore.toFixed(0)}/100` : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trend Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
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
                        dataKey="timeline" 
                        name="Timeline" 
                        unit="months" 
                        label={{ value: "Timeline (months)", position: "bottom" }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="impact" 
                        name="Impact" 
                        domain={[0, 100]}
                        label={{ value: "Impact Score", angle: -90, position: "left" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Scatter 
                        name="Trends" 
                        data={trendData} 
                        fill="hsl(var(--chart-1))" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Individual Market Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {trendValidation.marketTrends.slice(0, 6).map((trend) => (
              <Card key={trend.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex justify-between">
                    <span>{trend.trendName}</span>
                    <Badge variant="outline" className="text-xs">
                      {trend.trendCategory}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Impact</span>
                      <span className="text-xs font-medium">{trend.impactScore.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Certainty</span>
                      <span className="text-xs font-medium">{trend.certaintyLevel.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Opportunity</span>
                      <span className="text-xs font-medium">{trend.opportunityScore.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Threat</span>
                      <span className="text-xs font-medium">{trend.threatScore.toFixed(0)}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Acquisition Channels */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Acquisition Channels</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Channel Effectiveness</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {channelData.length > 0 ? (
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="effectiveness" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Effectiveness" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No acquisition channel data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cost Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelData.slice(0, 5).map((channel, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{channel.name}</span>
                    <span className="font-medium">
                      {channel.cost ? `$${channel.cost.toFixed(2)}` : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Channel Recommendations */}
        {channelData.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Channel Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {channelData
                  .sort((a, b) => (b.effectiveness - a.effectiveness))
                  .slice(0, 3)
                  .map((channel, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{channel.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {channel.effectiveness >= 80 ? "Highly effective - prioritize investment" :
                           channel.effectiveness >= 60 ? "Moderately effective - maintain current investment" :
                           "Low effectiveness - consider optimization or reallocation"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Risk Management */}
      {riskValidation && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Risk Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center py-4">
                  {riskValidation.overallRiskScore ? 
                    `${riskValidation.overallRiskScore.toFixed(0)}/100` : "N/A"}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {riskValidation.overallRiskScore ? (
                    riskValidation.overallRiskScore < 30 ? "Low Risk" : 
                    riskValidation.overallRiskScore < 60 ? "Moderate Risk" : 
                    riskValidation.overallRiskScore < 80 ? "High Risk" : "Critical Risk"
                  ) : "Risk level unknown"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-40">
                {categoryData.length > 0 ? (
                  <ChartContainer config={{}} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={35}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No risk category data
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-full">
                  <Badge variant={
                    riskValidation.status === "COMPLETED" ? "default" :
                    riskValidation.status === "IN_PROGRESS" ? "secondary" :
                    riskValidation.status === "PENDING" ? "outline" : "destructive"
                  }>
                    {riskValidation.status?.replace("_", " ") || "Unknown"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Risk Matrix */}
          {riskMatrixData.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Matrix</CardTitle>
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
                        dataKey="probabilityScore" 
                        name="Probability" 
                        domain={[0, 100]}
                        label={{ value: "Probability", position: "bottom" }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="impactScore" 
                        name="Impact" 
                        domain={[0, 100]}
                        label={{ value: "Impact", angle: -90, position: "left" }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Scatter 
                        name="Risks" 
                        data={riskMatrixData} 
                        fill="hsl(var(--chart-1))" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
          
          {/* Risk Mitigation Table */}
          <div className="mt-6">
            <RiskMitigationTable 
              riskItems={riskValidation.riskItems.map(item => ({
                id: item.id,
                category: item.category,
                description: item.description,
                impact: item.impact,
                probability: item.probability,
                mitigation: item.mitigation
              }))} 
            />
          </div>
          
          {/* Top Risks */}
          {riskValidation.riskItems.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskValidation.riskItems.slice(0, 5).map((risk) => (
                    <div key={risk.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{risk.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {risk.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Impact: {risk.impact}/5, Probability: {risk.probability}/5
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{(risk.impact * risk.probability * 4).toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Business Insights */}
      {businessValidation && businessValidation.businessInsights.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Business Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessValidation.businessInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex justify-between">
                    <span>{insight.label || insight.category}</span>
                    <Badge variant="secondary">{insight.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {insight.description || "No description available"}
                  </p>
                  <div className="flex justify-between mt-3">
                    <span className="text-xs">Impact: {insight.impact.toFixed(0)}/100</span>
                    <span className="text-xs">Urgency: {insight.urgency.toFixed(0)}/100</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function BusinessValidationPage({ params }: BusinessValidationPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <BusinessValidationContent ideaId={id} />
    </div>
  );
}