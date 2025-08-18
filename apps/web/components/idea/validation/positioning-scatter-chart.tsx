"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

interface PositioningScatterChartProps {
  data?: {
    name: string;
    marketShare: number | null;
    satisfaction: number | null;
    revenue?: number | null;
  }[] | null;
}

export function PositioningScatterChart({
  data = [],
}: PositioningScatterChartProps) {
  const points = (data || [])
    .filter((d) => d.marketShare !== null && d.satisfaction !== null)
    .map((d) => ({
      name: d.name,
      marketShare: (d.marketShare ?? 0) as number,
      satisfaction: (d.satisfaction ?? 0) as number,
      revenue: d.revenue ?? 0,
    }));

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No positioning data available
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="marketShare"
            name="Market Share"
            unit="%"
            domain={[0, 100]}
            label={{ value: "Market Share (%)", position: "bottom" }}
          />
          <YAxis
            type="number"
            dataKey="satisfaction"
            name="Satisfaction"
            domain={[0, 100]}
            label={{ value: "Customer Satisfaction", angle: -90, position: "left" }}
          />
          <ZAxis type="number" dataKey="revenue" range={[100, 1000]} name="Revenue" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Scatter name="Competitors" data={points} fill="hsl(var(--chart-1))" />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
