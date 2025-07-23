"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { BarChart3 } from "lucide-react";

interface StatusBreakdown {
  BACKLOG?: number;
  IN_PROGRESS?: number;
  IN_REVIEW?: number;
  DONE?: number;
  BLOCKED?: number;
  CANCELLED?: number;
}

interface RoadmapStatusChartProps {
  statusBreakdown: StatusBreakdown;
  totalItems: number;
}

const chartConfig = {
  items: {
    label: "Items",
  },
  BACKLOG: {
    label: "Backlog",
    color: "var(--chart-1)",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "var(--chart-2)",
  },
  IN_REVIEW: {
    label: "In Review",
    color: "var(--chart-3)",
  },
  DONE: {
    label: "Done",
    color: "var(--chart-4)",
  },
  BLOCKED: {
    label: "Blocked",
    color: "var(--chart-5)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

export function RoadmapStatusChart({
  statusBreakdown,
  totalItems,
}: RoadmapStatusChartProps) {
  const chartData = React.useMemo(() => {
    return Object.entries(statusBreakdown)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        fill: `var(--color-${status})`,
      }));
  }, [statusBreakdown]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of items by status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalItems.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Items
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
