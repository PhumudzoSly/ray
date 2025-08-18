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
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface SWOTAnalysisQuadrantProps {
  factors?: {
    id: string;
    factor: string;
    impact: number; // -100 to 100
    urgency: number; // -100 to 100
    type: 'Strength' | 'Weakness' | 'Opportunity' | 'Threat';
  }[] | null;
}

export function SWOTAnalysisQuadrant({ factors = [] }: SWOTAnalysisQuadrantProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No SWOT analysis data available
      </div>
    );
  }

  // Prepare data for chart
  const chartData = factors.map(factor => ({
    ...factor,
    x: factor.urgency,
    y: factor.impact
  }));

  // Colors for different SWOT types
  const getColorForType = (type: string) => {
    switch (type) {
      case 'Strength': return "hsl(var(--chart-1))"; // Green
      case 'Weakness': return "hsl(var(--chart-2))"; // Red
      case 'Opportunity': return "hsl(var(--chart-3))"; // Blue
      case 'Threat': return "hsl(var(--chart-4))"; // Orange
      default: return "hsl(var(--chart-5))"; // Gray
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Badge variant="default" className="justify-center">Strengths</Badge>
        <Badge variant="destructive" className="justify-center">Weaknesses</Badge>
        <Badge variant="secondary" className="justify-center">Opportunities</Badge>
        <Badge variant="outline" className="justify-center">Threats</Badge>
      </div>
      
      <ChartContainer config={{}} className="h-80 w-full">
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
              dataKey="x" 
              name="Urgency" 
              domain={[-100, 100]}
              label={{ value: "Urgency", position: "bottom" }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Impact" 
              domain={[-100, 100]}
              label={{ value: "Impact", angle: -90, position: "left" }}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name, props) => {
                    if (name === 'x') return [value, 'Urgency'];
                    if (name === 'y') return [value, 'Impact'];
                    return [value, name];
                  }}
                />
              } 
            />
            <Scatter 
              name="SWOT Factors" 
              data={chartData} 
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColorForType(entry.type)} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="text-center">
          <div className="font-medium">Low Urgency</div>
          <div className="text-muted-foreground">← ← → →</div>
          <div className="font-medium">High Urgency</div>
        </div>
        <div className="text-center">
          <div className="font-medium">High Impact</div>
          <div className="text-muted-foreground">↑ ↑ ↓ ↓</div>
          <div className="font-medium">Low Impact</div>
        </div>
      </div>
    </div>
  );
}