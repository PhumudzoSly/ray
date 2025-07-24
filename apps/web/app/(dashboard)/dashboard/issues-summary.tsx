"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { getIssuesSummaryData } from "../../../actions/dashboard/analytics";

export const description = "Issues by label - completed vs non-completed";

interface IssueData {
  label: string;
  completed: number;
  nonCompleted: number;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-4)",
  },
  nonCompleted: {
    label: "Non-Completed",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function IssuesSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["issues-summary"],
    queryFn: getIssuesSummaryData,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues Summary</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues Summary</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Failed to load chart data</div>
        </CardContent>
      </Card>
    );
  }

  const issuesData = data || [];
  const totalIssues = issuesData.reduce(
    (sum, item) => sum + item.completed + item.nonCompleted,
    0
  );
  const totalCompleted = issuesData.reduce(
    (sum, item) => sum + item.completed,
    0
  );
  const completionRate =
    totalIssues > 0 ? ((totalCompleted / totalIssues) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues Summary by Label</CardTitle>
        <CardDescription>Completed vs Non-Completed Issues</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={issuesData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            <Bar
              dataKey="nonCompleted"
              fill="var(--color-nonCompleted)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {completionRate}% completion rate <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing {totalIssues} total issues across all labels
        </div>
      </CardFooter>
    </Card>
  );
}
