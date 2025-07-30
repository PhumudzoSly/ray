"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

interface CodeQualityAnalyticsProps {
  projectId?: string;
  organizationId?: string;
  timeRange?: "7d" | "30d" | "90d" | "1y";
}

export function CodeQualityAnalytics({
  projectId,
  organizationId,
  timeRange = "30d",
}: CodeQualityAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState("maintainability");

  // Mock data - in real implementation, this would come from your analytics API
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: [
      "code-quality-analytics",
      projectId,
      organizationId,
      selectedTimeRange,
    ],
    queryFn: async () => {
      // This would be replaced with actual API call
      return generateMockAnalyticsData(selectedTimeRange);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    overviewMetrics,
    trendData,
    issueDistribution,
    repositoryComparison,
    developerInsights,
    timelineData,
  } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintainability">Maintainability</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="complexity">Complexity</SelectItem>
              <SelectItem value="debt">Technical Debt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      {metric.trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${metric.trend > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {Math.abs(metric.trend)}%
                      </span>
                    </div>
                  </div>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Issue Distribution</TabsTrigger>
          <TabsTrigger value="repositories">Repository Comparison</TabsTrigger>
          <TabsTrigger value="developers">Developer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Code Quality Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="maintainability"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Maintainability"
                  />
                  <Line
                    type="monotone"
                    dataKey="security"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Security"
                  />
                  <Line
                    type="monotone"
                    dataKey="complexity"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Complexity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Debt Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="technicalDebt"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Technical Debt (hours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Issues by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={issueDistribution.byType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {issueDistribution.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={issueDistribution.bySeverity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Issue Resolution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Issues Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Issues Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repositories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Repository Health Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repositoryComparison} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar
                    dataKey="maintainability"
                    fill="#3b82f6"
                    name="Maintainability"
                  />
                  <Bar dataKey="security" fill="#10b981" name="Security" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Debt by Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {repositoryComparison.map((repo) => (
                  <div
                    key={repo.name}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{repo.name}</span>
                        <Badge
                          variant={
                            repo.debt > 8
                              ? "destructive"
                              : repo.debt > 4
                                ? "default"
                                : "secondary"
                          }
                        >
                          {repo.debt}h debt
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Maintainability: {repo.maintainability}%</span>
                        <span>Security: {repo.security}%</span>
                        <span>Issues: {repo.issues}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Developer Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {developerInsights.map((dev) => (
                  <div
                    key={dev.name}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-sm">
                          {dev.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{dev.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dev.commits} commits • {dev.issuesResolved} issues
                          resolved
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Code Quality</div>
                        <div className="text-sm text-muted-foreground">
                          {dev.codeQuality}%
                        </div>
                      </div>
                      <Badge
                        variant={
                          dev.trend === "up"
                            ? "default"
                            : dev.trend === "down"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {dev.trend === "up"
                          ? "↗"
                          : dev.trend === "down"
                            ? "↘"
                            : "→"}{" "}
                        {dev.trendValue}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data generator - replace with actual API calls
function generateMockAnalyticsData(timeRange: string) {
  const days =
    timeRange === "7d"
      ? 7
      : timeRange === "30d"
        ? 30
        : timeRange === "90d"
          ? 90
          : 365;

  const overviewMetrics = [
    {
      name: "Avg Maintainability",
      value: "78%",
      trend: 5.2,
      icon: TrendingUp,
    },
    {
      name: "Security Score",
      value: "85%",
      trend: 2.1,
      icon: TrendingUp,
    },
    {
      name: "Technical Debt",
      value: "24h",
      trend: -8.3,
      icon: TrendingDown,
    },
    {
      name: "Issues Resolved",
      value: "142",
      trend: 12.5,
      icon: TrendingUp,
    },
  ];

  const trendData = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
    date: new Date(
      Date.now() - (days - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    maintainability: 70 + Math.random() * 20,
    security: 75 + Math.random() * 20,
    complexity: 5 + Math.random() * 10,
    technicalDebt: 10 + Math.random() * 20,
  }));

  const issueDistribution = {
    byType: [
      { name: "Code Smell", value: 45, color: "#f59e0b" },
      { name: "Bug", value: 25, color: "#ef4444" },
      { name: "Security", value: 15, color: "#8b5cf6" },
      { name: "Performance", value: 15, color: "#06b6d4" },
    ],
    bySeverity: [
      { severity: "Critical", count: 8 },
      { severity: "Major", count: 23 },
      { severity: "Minor", count: 45 },
      { severity: "Info", count: 67 },
    ],
  };

  const repositoryComparison = [
    {
      name: "frontend",
      maintainability: 82,
      security: 88,
      debt: 6,
      issues: 23,
    },
    {
      name: "backend",
      maintainability: 75,
      security: 92,
      debt: 12,
      issues: 18,
    },
    { name: "mobile", maintainability: 68, security: 78, debt: 15, issues: 31 },
    { name: "shared", maintainability: 85, security: 85, debt: 4, issues: 12 },
  ];

  const developerInsights = [
    {
      name: "Alice Johnson",
      commits: 45,
      issuesResolved: 12,
      codeQuality: 85,
      trend: "up",
      trendValue: 5,
    },
    {
      name: "Bob Smith",
      commits: 38,
      issuesResolved: 8,
      codeQuality: 78,
      trend: "stable",
      trendValue: 0,
    },
    {
      name: "Carol Davis",
      commits: 52,
      issuesResolved: 15,
      codeQuality: 92,
      trend: "up",
      trendValue: 8,
    },
    {
      name: "David Wilson",
      commits: 29,
      issuesResolved: 6,
      codeQuality: 72,
      trend: "down",
      trendValue: -3,
    },
  ];

  const timelineData = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
    date: new Date(
      Date.now() - (days - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    created: Math.floor(Math.random() * 10) + 2,
    resolved: Math.floor(Math.random() * 8) + 1,
  }));

  return {
    overviewMetrics,
    trendData,
    issueDistribution,
    repositoryComparison,
    developerInsights,
    timelineData,
  };
}
