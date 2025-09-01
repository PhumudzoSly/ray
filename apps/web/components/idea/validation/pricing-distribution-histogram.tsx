"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
} from "recharts";

interface PricingDistributionHistogramProps {
  competitors?:
    | {
        id: string;
        name: string;
        basePrice?: number | null;
        premiumPrice?: number | null;
      }[]
    | null;
}

export function PricingDistributionHistogram({
  competitors = [],
}: PricingDistributionHistogramProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No pricing data available
      </div>
    );
  }

  // Prepare data for histogram - group competitors by price ranges
  const priceRanges = [
    { range: "$0-20", min: 0, max: 20, count: 0 },
    { range: "$21-50", min: 21, max: 50, count: 0 },
    { range: "$51-100", min: 51, max: 100, count: 0 },
    { range: "$101-200", min: 101, max: 200, count: 0 },
    { range: "$201+", min: 201, max: Infinity, count: 0 },
  ];

  competitors.forEach((comp) => {
    const price = comp.basePrice || 0;
    const range = priceRanges.find((r) => price >= r.min && price <= r.max);
    if (range) {
      range.count++;
    }
  });

  // Filter out empty ranges
  const chartData = priceRanges.filter((range) => range.count > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No pricing data available
      </div>
    );
  }

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
          <XAxis dataKey="range" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="count"
            fill="hsl(var(--chart-1))"
            name="Competitors"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
