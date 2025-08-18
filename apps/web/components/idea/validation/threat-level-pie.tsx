"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ThreatLevelPieChartProps {
  data?: { name: string; value: number }[] | null;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ThreatLevelPieChart({
  data = [],
  colors = DEFAULT_COLORS,
}: ThreatLevelPieChartProps) {
  const valid = (data || []).filter(
    (d) => d && typeof d.value === "number" && d.value > 0
  );

  if (valid.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No threat data available
      </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={valid}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={35}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {valid.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
