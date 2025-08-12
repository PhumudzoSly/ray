"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
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
  Cell
} from "recharts";

interface FeatureComparisonHeatmapProps {
  features?: string[] | null;
  competitors?: {
    id: string;
    name: string;
    featureScores: Record<string, number>; // feature name -> score (0-100)
  }[] | null;
}

export function FeatureComparisonHeatmap({ features = [], competitors = [] }: FeatureComparisonHeatmapProps) {
  if (!features || features.length === 0 || !competitors || competitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No feature comparison data available
      </div>
    );
  }

  // Prepare data for chart
  const chartData = features.map(feature => {
    const dataPoint: any = { feature };
    competitors.forEach(comp => {
      dataPoint[comp.name] = comp.featureScores[feature] || 0;
    });
    return dataPoint;
  });

  // Get competitor names for chart series
  const competitorNames = competitors.map(comp => comp.name);

  // Colors for the chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis 
            dataKey="feature" 
            type="category" 
            width={90}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {competitorNames.map((name, index) => (
            <Bar 
              key={name} 
              dataKey={name} 
              stackId="a" 
              fill={COLORS[index % COLORS.length]}
              name={name}
            >
              {chartData.map((entry, entryIndex) => (
                <Cell 
                  key={`cell-${entryIndex}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}