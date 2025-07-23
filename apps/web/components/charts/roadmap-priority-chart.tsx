"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { PieChart as PieChartIcon } from "lucide-react";

interface PriorityBreakdown {
  CRITICAL?: number;
  HIGH?: number;
  MEDIUM?: number;
  LOW?: number;
}

interface RoadmapPriorityChartProps {
  priorityBreakdown: PriorityBreakdown;
  totalItems: number;
}

const chartConfig = {
  items: {
    label: "Items",
  },
  CRITICAL: {
    label: "Critical",
    color: "var(--chart-1)",
  },
  HIGH: {
    label: "High",
    color: "var(--chart-2)",
  },
  MEDIUM: {
    label: "Medium",
    color: "var(--chart-3)",
  },
  LOW: {
    label: "Low",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function RoadmapPriorityChart({
  priorityBreakdown,
  totalItems,
}: RoadmapPriorityChartProps) {
  const id = "priority-interactive";

  const chartData = React.useMemo(() => {
    return Object.entries(priorityBreakdown)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        priority,
        count,
        fill: `var(--color-${priority})`,
      }));
  }, [priorityBreakdown]);

  const [activePriority, setActivePriority] = React.useState(
    chartData.length > 0 ? chartData[0].priority : ""
  );

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.priority === activePriority),
    [activePriority, chartData]
  );

  const priorities = React.useMemo(
    () => chartData.map((item) => item.priority),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Breakdown of items by priority</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <PieChartIcon className="h-8 w-8 mx-auto mb-2" />
            <p>No priority data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-purple-500" />
          </div>
          <div className="grid gap-1">
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Breakdown of items by priority</CardDescription>
          </div>
        </div>
        <Select value={activePriority} onValueChange={setActivePriority}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a priority"
          >
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {priorities.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="priority"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
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
                          {chartData[activeIndex]?.count.toLocaleString() ||
                            "0"}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {chartConfig[
                            activePriority as keyof typeof chartConfig
                          ]?.label || "Items"}
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
