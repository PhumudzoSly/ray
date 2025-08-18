"use client";

import React from "react";
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

interface JourneyOverviewProps {
  overallJourneyScore?: number | null;
  totalJourneyStages?: number | null;
  averageJourneyTime?: number | null;
  conversionRate?: number | null;
  dropOffRate?: number | null;
  customerSatisfaction?: number | null;
}

export function JourneyOverview({ 
  overallJourneyScore,
  totalJourneyStages,
  averageJourneyTime,
  conversionRate,
  dropOffRate,
  customerSatisfaction
}: JourneyOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Journey Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {overallJourneyScore !== null && overallJourneyScore !== undefined ? 
              `${overallJourneyScore.toFixed(0)}/100` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Journey Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {totalJourneyStages !== null && totalJourneyStages !== undefined ? 
              totalJourneyStages : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg. Journey Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {averageJourneyTime !== null && averageJourneyTime !== undefined ? 
              `${averageJourneyTime} days` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {conversionRate !== null && conversionRate !== undefined ? 
              `${conversionRate.toFixed(1)}%` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {dropOffRate !== null && dropOffRate !== undefined ? 
              `${dropOffRate.toFixed(1)}%` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {customerSatisfaction !== null && customerSatisfaction !== undefined ? 
              `${customerSatisfaction.toFixed(0)}/100` : "N/A"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StageCardsProps {
  stages?: {
    id: string;
    stageName: string;
    stageOrder: number;
    averageDuration?: number | null;
    conversionRate?: number | null;
    satisfactionScore?: number | null;
    frictionScore?: number | null;
    emotionalState?: number | null;
  }[] | null;
}

export function StageCards({ stages = [] }: StageCardsProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No journey stages available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stages.map((stage) => (
        <Card key={stage.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              <span>{stage.stageName}</span>
              <Badge variant="secondary">Stage {stage.stageOrder}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Duration</span>
                <span className="text-xs font-medium">
                  {stage.averageDuration !== null && stage.averageDuration !== undefined ? 
                    `${stage.averageDuration} hrs` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Conversion</span>
                <span className="text-xs font-medium">
                  {stage.conversionRate !== null && stage.conversionRate !== undefined ? 
                    `${stage.conversionRate.toFixed(0)}%` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Satisfaction</span>
                <span className="text-xs font-medium">
                  {stage.satisfactionScore !== null && stage.satisfactionScore !== undefined ? 
                    `${stage.satisfactionScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Friction</span>
                <span className="text-xs font-medium">
                  {stage.frictionScore !== null && stage.frictionScore !== undefined ? 
                    `${stage.frictionScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface TouchpointMatrixProps {
  touchpoints?: {
    id: string;
    touchpointName: string;
    touchpointType: string;
    channel: string;
    stageInJourney: string;
    effectivenessScore?: number | null;
    satisfactionScore?: number | null;
  }[] | null;
}

export function TouchpointMatrix({ touchpoints = [] }: TouchpointMatrixProps) {
  if (!touchpoints || touchpoints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No touchpoint data available
      </div>
    );
  }

  // Prepare data for chart
  const touchpointData = touchpoints.map(tp => ({
    name: tp.touchpointName,
    effectiveness: tp.effectivenessScore ?? 0,
    satisfaction: tp.satisfactionScore ?? 0
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Touchpoint Effectiveness vs Satisfaction</CardTitle>
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
                dataKey="effectiveness" 
                name="Effectiveness" 
                domain={[0, 100]}
                label={{ value: "Effectiveness", position: "bottom" }}
              />
              <YAxis 
                type="number" 
                dataKey="satisfaction" 
                name="Satisfaction" 
                domain={[0, 100]}
                label={{ value: "Satisfaction", angle: -90, position: "left" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Scatter 
                name="Touchpoints" 
                data={touchpointData} 
                fill="hsl(var(--chart-1))" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface PainPointHeatmapProps {
  painPoints?: {
    id: string;
    painPointName: string;
    journeyStage: string;
    severityScore?: number | null;
    frequencyScore?: number | null;
  }[] | null;
}

export function PainPointHeatmap({ painPoints = [] }: PainPointHeatmapProps) {
  if (!painPoints || painPoints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pain point data available
      </div>
    );
  }

  // Group pain points by stage
  const stagePainPoints: Record<string, any[]> = {};
  painPoints.forEach(pp => {
    if (!stagePainPoints[pp.journeyStage]) {
      stagePainPoints[pp.journeyStage] = [];
    }
    stagePainPoints[pp.journeyStage].push({
      name: pp.painPointName,
      severity: pp.severityScore ?? 0,
      frequency: pp.frequencyScore ?? 0
    });
  });

  // Convert to chart data format
  const heatmapData = Object.entries(stagePainPoints).flatMap(([stage, points]) => 
    points.map(point => ({
      stage,
      painPoint: point.name,
      intensity: (point.severity + point.frequency) / 2
    }))
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Pain Point Intensity by Stage</CardTitle>
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
                type="category" 
                dataKey="stage" 
                name="Stage" 
                label={{ value: "Journey Stage", position: "bottom" }}
              />
              <YAxis 
                type="category" 
                dataKey="painPoint" 
                name="Pain Point" 
                label={{ value: "Pain Point", angle: -90, position: "left" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Scatter 
                name="Pain Points" 
                data={heatmapData} 
                fill="hsl(var(--chart-1))" 
              >
                {heatmapData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColorForIntensity(entry.intensity)} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Helper function to get color based on intensity
function getColorForIntensity(intensity: number): string {
  if (intensity >= 80) return "hsl(var(--chart-1))"; // High intensity - red
  if (intensity >= 60) return "hsl(var(--chart-2))"; // Medium-high intensity - orange
  if (intensity >= 40) return "hsl(var(--chart-3))"; // Medium intensity - yellow
  if (intensity >= 20) return "hsl(var(--chart-4))"; // Low-medium intensity - light green
  return "hsl(var(--chart-5))"; // Low intensity - green
}