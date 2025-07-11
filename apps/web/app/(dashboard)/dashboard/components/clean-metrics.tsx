"use client";
import React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
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
} from "recharts";
import { Users, Briefcase, Lightbulb, AlertCircle } from "lucide-react";

interface CleanMetricsProps {
  stats: any;
}

const generateChartData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: ["M", "T", "W", "T", "F", "S", "S"][i],
    value: Math.floor(Math.random() * 60) + 40,
  }));
};

export const CleanMetrics: React.FC<CleanMetricsProps> = ({ stats }) => {
  const totalProjects = stats?.projects?.length || 0;
  const completedProjects =
    stats?.projects?.filter((p: any) => p.status === "completed")?.length || 0;
  const openIssues =
    stats?.issues?.filter((issue: any) => issue.status !== "DONE")?.length || 0;
  const totalMembers = stats?.members?.length || 0;

  const completionRate =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;
  const chartData = generateChartData();

  const metrics = [
    {
      icon: <Users className="h-4 w-4" />,
      value: totalMembers,
      label: "Members",
      color: "bg-blue-500",
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      value: totalProjects,
      label: "Projects",
      color: "bg-purple-500",
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      value: stats?.ideas?.length || 0,
      label: "Ideas",
      color: "bg-yellow-500",
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      value: openIssues,
      label: "Issues",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Metrics Cards */}
      <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div
                className={`w-8 h-8 rounded-lg ${metric.color} bg-opacity-20 flex items-center justify-center mb-3`}
              >
                <div className={`${metric.color} bg-opacity-100 text-white`}>
                  {metric.icon}
                </div>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-4">Activity</p>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card className="lg:col-span-3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Project Completion</p>
            <p className="text-sm font-medium">{completionRate}%</p>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
};
