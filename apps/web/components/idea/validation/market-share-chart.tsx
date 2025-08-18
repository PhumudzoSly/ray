"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MarketShareChartProps {
  competitors?: {
    id: string;
    name: string;
    marketShare?: number | null;
  }[] | null;
}

export function MarketShareChart({ competitors = [] }: MarketShareChartProps) {
  // Filter out competitors with no market share data
  const validCompetitors = (competitors || []).filter(
    comp => comp.marketShare !== null && comp.marketShare !== undefined && comp.marketShare > 0
  );

  if (validCompetitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No market share data available
      </div>
    );
  }

  // Prepare data for chart
  const chartData = validCompetitors.map(comp => ({
    name: comp.name,
    value: comp.marketShare || 0
  }));

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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <ChartTooltip 
            content={
              <ChartTooltipContent 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, "Market Share"]}
              />
            } 
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}