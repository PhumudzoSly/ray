"use client";
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
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
  ChartLegend,
  ChartLegendContent,
} from "@workspace/ui/components/chart";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedAnalyticsProps {
  stats: any;
}

// Sample data for demonstration - replace with your actual data
const generateTrendData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, index) => ({
    month,
    projects: Math.floor(Math.random() * 10) + 5,
    issues: Math.floor(Math.random() * 20) + 10,
    completedTasks: Math.floor(Math.random() * 50) + 20,
    teamProductivity: Math.floor(Math.random() * 30) + 70,
  }));
};

const generateProjectHealthData = (projects: any[]) => {
  const healthLevels = ["Excellent", "Good", "Fair", "Poor"];
  return healthLevels.map((level, index) => {
    const count = Math.floor(Math.random() * 5) + 1;
    const colors = [
      "hsl(142, 76%, 36%)",
      "hsl(47, 96%, 53%)",
      "hsl(25, 95%, 53%)",
      "hsl(0, 84%, 60%)",
    ];
    return {
      name: level,
      value: count,
      color: colors[index],
      percentage: Math.floor((count / projects.length) * 100) || 0,
    };
  });
};

const generateVelocityData = () => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  return weeks.map((week) => ({
    week,
    planned: Math.floor(Math.random() * 20) + 15,
    completed: Math.floor(Math.random() * 25) + 10,
    velocity: Math.floor(Math.random() * 15) + 75,
  }));
};

const chartConfig = {
  projects: {
    label: "Projects",
    color: "hsl(var(--primary))",
  },
  issues: {
    label: "Issues",
    color: "hsl(var(--destructive))",
  },
  completedTasks: {
    label: "Completed Tasks",
    color: "hsl(142, 76%, 36%)",
  },
  teamProductivity: {
    label: "Team Productivity",
    color: "hsl(262, 83%, 58%)",
  },
  planned: {
    label: "Planned",
    color: "hsl(var(--muted-foreground))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  velocity: {
    label: "Velocity",
    color: "hsl(47, 96%, 53%)",
  },
};

export const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({
  stats,
}) => {
  const trendData = generateTrendData();
  const projectHealthData = generateProjectHealthData(stats?.projects || []);
  const velocityData = generateVelocityData();

  const totalProjects = stats?.projects?.length || 0;
  const completedProjects =
    stats?.projects?.filter((p: any) => p.status === "completed")?.length || 0;
  const openIssues =
    stats?.issues?.filter((issue: any) => issue.status !== "DONE")?.length || 0;
  const completionRate =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Enhanced Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Deep insights into your project performance
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-background">
          <Activity className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {completionRate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Completion Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedProjects}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-100 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {totalProjects - completedProjects}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {openIssues}
                </div>
                <div className="text-xs text-muted-foreground">Open Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="velocity" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Velocity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project & Issue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Project & Issue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="projects"
                      stackId="1"
                      stroke="var(--color-projects)"
                      fill="var(--color-projects)"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="issues"
                      stackId="1"
                      stroke="var(--color-issues)"
                      fill="var(--color-issues)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Team Productivity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="teamProductivity"
                      stroke="var(--color-teamProductivity)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--color-teamProductivity)",
                        strokeWidth: 2,
                        r: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completedTasks"
                      stroke="var(--color-completedTasks)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{
                        fill: "var(--color-completedTasks)",
                        strokeWidth: 2,
                        r: 3,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Health Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Project Health Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={projectHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {projectHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectHealthData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{item.value}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Sprint Velocity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="planned"
                    fill="var(--color-planned)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    fill="var(--color-completed)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
