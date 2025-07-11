"use client";
import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

interface SimpleAnalyticsProps {
  stats: any;
}

const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    month,
    projects: Math.floor(Math.random() * 10) + 5,
    issues: Math.floor(Math.random() * 20) + 10,
  }));
};

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

export const SimpleAnalytics: React.FC<SimpleAnalyticsProps> = ({ stats }) => {
  const monthlyData = generateMonthlyData();

  const statusData = [
    {
      name: "Completed",
      value:
        stats?.projects?.filter((p: any) => p.status === "completed")?.length ||
        0,
    },
    {
      name: "In Progress",
      value:
        stats?.projects?.filter((p: any) => p.status === "in-progress")
          ?.length || 0,
    },
    {
      name: "Planning",
      value:
        stats?.projects?.filter((p: any) => p.status === "planning")?.length ||
        0,
    },
    {
      name: "Review",
      value:
        stats?.projects?.filter((p: any) => p.status === "review")?.length || 0,
    },
  ];

  const chartConfig = {
    projects: {
      label: "Projects",
      color: "hsl(var(--primary))",
    },
    issues: {
      label: "Issues",
      color: "hsl(var(--destructive))",
    },
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="projects"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="issues"
                    stroke="hsl(var(--destructive))"
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="ml-8 space-y-2">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
