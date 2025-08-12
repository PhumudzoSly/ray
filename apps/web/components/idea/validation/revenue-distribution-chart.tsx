"use client";

import React from "react";
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

interface RevenueDistributionChartProps {
  tiers?: {
    id: string;
    tierName: string;
    expectedRevenue?: number | null;
    conversionRate?: number | null;
  }[] | null;
}

export function RevenueDistributionChart({ tiers = [] }: RevenueDistributionChartProps) {
  if (!tiers || tiers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No revenue distribution data available
      </div>
    );
  }

  // Prepare data for chart
  const chartData = tiers.map(tier => ({
    name: tier.tierName,
    revenue: tier.expectedRevenue || 0,
    conversion: tier.conversionRate || 0
  }));

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip 
            content={
              <ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue'];
                  if (name === 'conversion') return [`${Number(value).toFixed(1)}%`, 'Conversion'];
                  return [value, name];
                }}
              />
            } 
          />
          <Bar 
            dataKey="revenue" 
            fill="hsl(var(--chart-1))" 
            name="Expected Revenue"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill="hsl(var(--chart-1))" 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}