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
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

interface NeedsOverviewProps {
  primaryNeed?: string | null;
  overallNeedScore?: number | null;
  totalNeedsIdentified?: number | null;
  totalPainPoints?: number | null;
  needUrgency?: number | null;
  solutionGap?: number | null;
  customerWillingness?: number | null;
}

export function NeedsOverview({ 
  primaryNeed,
  overallNeedScore,
  totalNeedsIdentified,
  totalPainPoints,
  needUrgency,
  solutionGap,
  customerWillingness
}: NeedsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Primary Need</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">
            {primaryNeed || "N/A"}
          </Badge>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Need Analysis Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {overallNeedScore !== null && overallNeedScore !== undefined ? 
              `${overallNeedScore.toFixed(0)}/100` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Needs & Pain Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {totalNeedsIdentified !== null && totalNeedsIdentified !== undefined ? 
                  totalNeedsIdentified : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Needs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {totalPainPoints !== null && totalPainPoints !== undefined ? 
                  totalPainPoints : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Pain Points</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Need Urgency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {needUrgency !== null && needUrgency !== undefined ? 
              `${needUrgency.toFixed(0)}/100` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Solution Gap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {solutionGap !== null && solutionGap !== undefined ? 
              `${solutionGap.toFixed(0)}/100` : "N/A"}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Willingness to Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-2">
            {customerWillingness !== null && customerWillingness !== undefined ? 
              `${customerWillingness.toFixed(0)}/100` : "N/A"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface NeedCardsProps {
  needs?: {
    id: string;
    needName: string;
    needCategory: string;
    intensityScore?: number | null;
    frequencyScore?: number | null;
    urgencyScore?: number | null;
    satisfactionGap?: number | null;
  }[] | null;
}

export function NeedCards({ needs = [] }: NeedCardsProps) {
  if (!needs || needs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No customer needs identified
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {needs.map((need) => (
        <Card key={need.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              <span>{need.needName}</span>
              <Badge variant="outline" className="text-xs">
                {need.needCategory}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Intensity</span>
                <span className="text-xs font-medium">
                  {need.intensityScore !== null && need.intensityScore !== undefined ? 
                    `${need.intensityScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Frequency</span>
                <span className="text-xs font-medium">
                  {need.frequencyScore !== null && need.frequencyScore !== undefined ? 
                    `${need.frequencyScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Urgency</span>
                <span className="text-xs font-medium">
                  {need.urgencyScore !== null && need.urgencyScore !== undefined ? 
                    `${need.urgencyScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Satisfaction Gap</span>
                <span className="text-xs font-medium">
                  {need.satisfactionGap !== null && need.satisfactionGap !== undefined ? 
                    `${need.satisfactionGap.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface NeedPriorityMatrixProps {
  needs?: {
    id: string;
    needName: string;
    importance?: number | null;
    satisfaction?: number | null;
  }[] | null;
}

export function NeedPriorityMatrix({ needs = [] }: NeedPriorityMatrixProps) {
  if (!needs || needs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No need priority data available
      </div>
    );
  }

  // Prepare data for chart
  const matrixData = needs.map(need => ({
    name: need.needName,
    importance: need.importance ?? 0,
    satisfaction: need.satisfaction ?? 0
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Need Priority Matrix</CardTitle>
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
                dataKey="importance" 
                name="Importance" 
                domain={[0, 100]}
                label={{ value: "Importance", position: "bottom" }}
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
                name="Needs" 
                data={matrixData} 
                fill="hsl(var(--chart-1))" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface PainPointCardsProps {
  painPoints?: {
    id: string;
    painName: string;
    painCategory: string;
    severityScore?: number | null;
    frequencyScore?: number | null;
    impactScore?: number | null;
    emotionalToll?: number | null;
  }[] | null;
}

export function PainPointCards({ painPoints = [] }: PainPointCardsProps) {
  if (!painPoints || painPoints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pain points identified
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {painPoints.map((pain) => (
        <Card key={pain.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex justify-between">
              <span>{pain.painName}</span>
              <Badge variant="destructive" className="text-xs">
                {pain.painCategory}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Severity</span>
                <span className="text-xs font-medium">
                  {pain.severityScore !== null && pain.severityScore !== undefined ? 
                    `${pain.severityScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Frequency</span>
                <span className="text-xs font-medium">
                  {pain.frequencyScore !== null && pain.frequencyScore !== undefined ? 
                    `${pain.frequencyScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Impact</span>
                <span className="text-xs font-medium">
                  {pain.impactScore !== null && pain.impactScore !== undefined ? 
                    `${pain.impactScore.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Emotional Toll</span>
                <span className="text-xs font-medium">
                  {pain.emotionalToll !== null && pain.emotionalToll !== undefined ? 
                    `${pain.emotionalToll.toFixed(0)}/100` : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}