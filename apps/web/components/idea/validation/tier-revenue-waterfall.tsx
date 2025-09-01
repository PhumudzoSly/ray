"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TierRevenueWaterfallProps {
  tiers?:
    | {
        id: string;
        tierName: string;
        expectedRevenue?: number | null;
        cumulativeRevenue?: number | null;
      }[]
    | null;
}

export function TierRevenueWaterfall({
  tiers = [],
}: TierRevenueWaterfallProps) {
  if (!tiers || tiers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No revenue waterfall data available
      </div>
    );
  }

  // Prepare data for waterfall chart
  let cumulative = 0;
  const chartData = tiers.map((tier) => {
    const revenue = tier.expectedRevenue || 0;
    const previousCumulative = cumulative;
    cumulative += revenue;

    return {
      name: tier.tierName,
      revenue: revenue,
      cumulative: cumulative,
      previousCumulative: previousCumulative,
    };
  });

  // Colors for the chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

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
                  if (name === "revenue")
                    return [`$${Number(value).toLocaleString()}`, "Revenue"];
                  if (name === "cumulative")
                    return [`$${Number(value).toLocaleString()}`, "Cumulative"];
                  return [value, name];
                }}
              />
            }
          />
          <Bar
            dataKey="cumulative"
            fill="hsl(var(--chart-1))"
            name="Cumulative Revenue"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
