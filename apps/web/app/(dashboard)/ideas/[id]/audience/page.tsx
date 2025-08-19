import React from "react";
import { getAudienceValidation } from "@/actions/idea/validation-audience";
import { getCustomerJourneyMapping } from "@/actions/idea/validation-journey";
import { getCustomerNeedAnalysis } from "@/actions/idea/validation-needs";
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from "recharts";
import { 
  JourneyOverview, 
  StageCards, 
  TouchpointMatrix, 
  PainPointHeatmap 
} from "@/components/idea/validation/journey-components";
import { 
  NeedsOverview, 
  NeedCards, 
  NeedPriorityMatrix, 
  PainPointCards 
} from "@/components/idea/validation/need-components";

interface AudienceValidationPageProps {
  params: Promise<{ id: string }>;
}

async function AudienceValidationContent({ ideaId }: { ideaId: string }) {
  const [audienceValidation, journeyMapping, needAnalysis] = await Promise.all([
    getAudienceValidation({ ideaId: ideaId }),
    getCustomerJourneyMapping({ ideaId: ideaId }),
    getCustomerNeedAnalysis({ ideaId: ideaId })
  ]);

  if (!audienceValidation && !journeyMapping && !needAnalysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Audience validation data not found.</p>
        </CardContent>
      </Card>
    );
  }

  // Format primary segment
  const primarySegment = audienceValidation?.primarySegment
    ?.replace("_", " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, l => l.toUpperCase()) || "N/A";

  // Prepare segment data for charts
  const segmentData = audienceValidation?.audienceSegments.map(segment => ({
    name: segment.segmentName,
    size: segment.segmentSize,
    attractiveness: segment.attractivenessScore,
    accessibility: segment.accessibilityScore,
    profitability: segment.profitabilityScore
  })) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Audience Validation</h1>
      
      {/* Target Audience Segmentation Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Target Audience Segmentation</h2>
        
        {/* Segmentation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Primary Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{primarySegment}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{audienceValidation?.totalSegments || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Market Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {audienceValidation?.totalMarketSize ? 
                  audienceValidation.totalMarketSize.toLocaleString() : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Segmentation Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-2">
                {audienceValidation?.overallSegmentationScore ? 
                  `${audienceValidation.overallSegmentationScore.toFixed(0)}/100` : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Segment Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-2">
                {audienceValidation?.averageSegmentSize ? 
                  audienceValidation.averageSegmentSize.toLocaleString() : "N/A"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Segment Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-2">
                {audienceValidation?.segmentAccessibility ? 
                  `${audienceValidation.segmentAccessibility.toFixed(0)}/100` : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Penetration</CardTitle>
            </CardHeader>
            <CardContent className="h-40">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {audienceValidation?.marketPenetration ? 
                      `${audienceValidation.marketPenetration.toFixed(1)}%` : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Expected market penetration</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Segment Penetration</CardTitle>
            </CardHeader>
            <CardContent className="h-40">
              {segmentData.length > 0 ? (
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={segmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="size" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No segment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Segment Size Comparison */}
        {segmentData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Segment Size Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={segmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="size" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Segment Scores</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={segmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="attractiveness" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Attractiveness" />
                      <Bar dataKey="accessibility" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Accessibility" />
                      <Bar dataKey="profitability" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Profitability" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Individual Audience Segments */}
        {audienceValidation?.audienceSegments.length ? (
          <div>
            <h3 className="text-lg font-medium mb-4">Audience Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audienceValidation.audienceSegments.map((segment) => (
                <Card key={segment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{segment.segmentName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Market Size</span>
                        <span className="text-sm font-medium">{segment.segmentSize.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Attractiveness</span>
                        <span className="text-sm font-medium">{segment.attractivenessScore.toFixed(0)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Accessibility</span>
                        <span className="text-sm font-medium">{segment.accessibilityScore.toFixed(0)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Profitability</span>
                        <span className="text-sm font-medium">{segment.profitabilityScore.toFixed(0)}/100</span>
                      </div>
                      {segment.primaryNeed && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Primary Need</span>
                          <span className="text-sm font-medium">{segment.primaryNeed}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Customer Journey Mapping Section */}
      {journeyMapping && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Customer Journey Mapping</h2>
          
          {/* Journey Overview */}
          <JourneyOverview
            overallJourneyScore={journeyMapping.overallJourneyScore}
            totalJourneyStages={journeyMapping.totalJourneyStages}
            averageJourneyTime={journeyMapping.averageJourneyTime}
            conversionRate={journeyMapping.conversionRate}
            dropOffRate={journeyMapping.dropOffRate}
            customerSatisfaction={journeyMapping.customerSatisfaction}
          />
          
          {/* Journey Stages Analysis */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Journey Stages</h3>
            <StageCards 
              stages={journeyMapping.journeyStages.map(stage => ({
                id: stage.id,
                stageName: stage.stageName,
                stageOrder: stage.stageOrder,
                averageDuration: stage.averageDuration,
                conversionRate: stage.conversionRate,
                satisfactionScore: stage.satisfactionScore,
                frictionScore: stage.frictionScore,
                emotionalState: stage.emotionalState
              }))}
            />
          </div>
          
          {/* Touchpoint Analysis */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Touchpoints</h3>
            <TouchpointMatrix 
              touchpoints={journeyMapping.touchpoints.map(tp => ({
                id: tp.id,
                touchpointName: tp.touchpointName,
                touchpointType: tp.touchpointType,
                channel: tp.channel,
                stageInJourney: tp.stageInJourney,
                effectivenessScore: tp.effectivenessScore,
                satisfactionScore: tp.satisfactionScore
              }))}
            />
          </div>
          
          {/* Pain Point Analysis */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Journey Pain Points</h3>
            <PainPointHeatmap 
              painPoints={journeyMapping.journeyPainPoints.map(pp => ({
                id: pp.id,
                painPointName: pp.painPointName,
                journeyStage: pp.journeyStage,
                severityScore: pp.severityScore,
                frequencyScore: pp.frequencyScore
              }))}
            />
          </div>
        </section>
      )}

      {/* Customer Need Analysis Section */}
      {needAnalysis && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Customer Need Analysis</h2>
          
          {/* Needs Overview */}
          <NeedsOverview
            primaryNeed={needAnalysis.primaryNeed}
            overallNeedScore={needAnalysis.overallNeedScore}
            totalNeedsIdentified={needAnalysis.totalNeedsIdentified}
            totalPainPoints={needAnalysis.totalPainPoints}
            needUrgency={needAnalysis.needUrgency}
            solutionGap={needAnalysis.solutionGap}
            customerWillingness={needAnalysis.customerWillingness}
          />
          
          {/* Individual Customer Needs */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Customer Needs</h3>
            <NeedCards 
              needs={needAnalysis.customerNeeds.map(need => ({
                id: need.id,
                needName: need.needName,
                needCategory: need.needCategory,
                intensityScore: need.intensityScore,
                frequencyScore: need.frequencyScore,
                urgencyScore: need.urgencyScore,
                satisfactionGap: need.satisfactionGap
              }))}
            />
          </div>
          
          {/* Need Priority Matrix */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Need Priority Matrix</h3>
            <NeedPriorityMatrix 
              needs={needAnalysis.customerNeeds.map(need => ({
                id: need.id,
                needName: need.needName,
                importance: need.intensityScore, // Using intensity as importance
                satisfaction: 100 - (need.satisfactionGap || 0) // Inverting gap to satisfaction
              }))}
            />
          </div>
          
          {/* Pain Points Analysis */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Customer Pain Points</h3>
            <PainPointCards 
              painPoints={needAnalysis.painPoints.map(pain => ({
                id: pain.id,
                painName: pain.painName,
                painCategory: pain.painCategory,
                severityScore: pain.severityScore,
                frequencyScore: pain.frequencyScore,
                impactScore: pain.impactScore,
                emotionalToll: pain.emotionalToll
              }))}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default async function AudienceValidationPage({ params }: AudienceValidationPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <AudienceValidationContent ideaId={id} />
    </div>
  );
}