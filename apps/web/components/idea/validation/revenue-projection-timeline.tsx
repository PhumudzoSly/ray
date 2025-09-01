"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueProjectionTimelineProps {
  data?:
    | {
        month: string;
        optimistic: number;
        expected: number;
        pessimistic: number;
      }[]
    | null;
}

export function RevenueProjectionTimeline({
  data = [],
}: RevenueProjectionTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No revenue projection data available
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: "Time", position: "bottom" }}
          />
          <YAxis
            label={{ value: "Revenue ($)", angle: -90, position: "left" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="optimistic"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Optimistic"
          />
          <Line
            type="monotone"
            dataKey="expected"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Expected"
          />
          <Line
            type="monotone"
            dataKey="pessimistic"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Pessimistic"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
