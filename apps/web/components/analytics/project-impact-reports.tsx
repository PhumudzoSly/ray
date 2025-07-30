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
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
} from "lucide-react";
import {
  getProjectTechnicalDebt,
  getDebtTimelineImpact,
} from "@/actions/technical-debt";

interface ProjectImpactReportsProps {
  projectId: string;
  timeRange?: "30d" | "90d" | "6m" | "1y";
}

export function ProjectImpactReports({
  projectId,
  timeRange = "90d",
}: ProjectImpactReportsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState("velocity");

  const { data: debtData, isLoading: debtLoading } = useQuery({
    queryKey: ["technical-debt", projectId],
    queryFn: () => getProjectTechnicalDebt(projectId),
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["debt-timeline-impact", projectId],
    queryFn: () => getDebtTimelineImpact(projectId),
  });

  // Mock data for demonstration - in real implementation, this would come from your analytics API
  const { data: impactData, isLoading: impactLoading } = useQuery({
    queryKey: ["project-impact", projectId, selectedTimeRange],
    queryFn: async () => {
      // This would be replaced with actual API call
      return generateMockImpactData(selectedTimeRange);
    },
  });

  if (debtLoading || timelineLoading || impactLoading) {
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

  const debt = debtData?.data;
  const timeline = timelineData?.data;
  const impact = impactData;

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
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="velocity">Velocity Impact</SelectItem>
              <SelectItem value="quality">Quality Correlation</SelectItem>
              <SelectItem value="delivery">Delivery Performance</SelectItem>
              <SelectItem value="satisfaction">Team Satisfaction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Velocity Impact</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    -{debt?.impactOnVelocity?.toFixed(0) || 0}%
                  </p>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Delay</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {timeline?.milestoneImpacts?.reduce(
                      (sum, m) => sum + m.additionalDays,
                      0
                    ) || 0}
                    d
                  </p>
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {impact?.qualityScore || 0}%
                  </p>
                  {(impact?.qualityScore || 0) >= 80 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Efficiency</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {impact?.teamEfficiency || 0}%
                  </p>
                  <Badge
                    variant={
                      impact?.teamEfficiency >= 75 ? "default" : "secondary"
                    }
                  >
                    {impact?.teamEfficiency >= 75
                      ? "Good"
                      : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="velocity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="velocity">Velocity Impact</TabsTrigger>
          <TabsTrigger value="quality-correlation">
            Quality Correlation
          </TabsTrigger>
          <TabsTrigger value="delivery-performance">
            Delivery Performance
          </TabsTrigger>
          <TabsTrigger value="timeline-impact">Timeline Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Velocity vs Technical Debt Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={impact?.velocityCorrelation || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="technicalDebt"
                    name="Technical Debt (hours)"
                    label={{
                      value: "Technical Debt (hours)",
                      position: "insideBottom",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    dataKey="velocity"
                    name="Velocity (story points)"
                    label={{
                      value: "Velocity (story points)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter dataKey="velocity" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sprint Velocity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={impact?.velocityTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Velocity (Story Points)"
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Team Capacity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality-correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Quality vs Delivery Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={impact?.qualityCorrelation || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="codeQuality"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Code Quality %"
                  />
                  <Area
                    type="monotone"
                    dataKey="deliverySuccess"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Delivery Success %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bug Rate vs Code Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={impact?.bugRateCorrelation || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bugRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Bug Rate (per 1000 LOC)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="codeQuality"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Code Quality %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {impact?.deliveryMetrics?.onTimeDelivery || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    On-Time Delivery
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {impact?.deliveryMetrics?.avgLeadTime || 0}d
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Lead Time
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {impact?.deliveryMetrics?.cycleTime || 0}d
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cycle Time
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={impact?.deliveryTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="delivered"
                    fill="#10b981"
                    name="Features Delivered"
                  />
                  <Bar
                    dataKey="planned"
                    fill="#3b82f6"
                    name="Features Planned"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline-impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Timeline Impact</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline?.milestoneImpacts &&
              timeline.milestoneImpacts.length > 0 ? (
                <div className="space-y-4">
                  {timeline.milestoneImpacts.map((impact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {impact.milestoneName}
                          </span>
                          <Badge
                            variant={
                              impact.riskLevel === "high"
                                ? "destructive"
                                : impact.riskLevel === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {impact.riskLevel} risk
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {impact.additionalDays > 0 ? (
                            <>Expected delay: {impact.additionalDays} days</>
                          ) : (
                            <>On track</>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {impact.originalEndDate && (
                          <div className="text-sm text-muted-foreground">
                            Original:{" "}
                            {new Date(
                              impact.originalEndDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {impact.adjustedEndDate &&
                          impact.additionalDays > 0 && (
                            <div className="text-sm font-medium">
                              Adjusted:{" "}
                              {new Date(
                                impact.adjustedEndDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No milestone data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {timeline?.recommendations && timeline.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeline.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded"
                    >
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {rec.description}
                        </div>
                        {rec.estimatedImpact && (
                          <div className="text-xs text-green-600 mt-1">
                            Impact: {rec.estimatedImpact}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data generator - replace with actual API calls
function generateMockImpactData(timeRange: string) {
  const qualityScore = 75 + Math.random() * 20;
  const teamEfficiency = 70 + Math.random() * 25;

  return {
    qualityScore: Math.round(qualityScore),
    teamEfficiency: Math.round(teamEfficiency),
    velocityCorrelation: Array.from({ length: 20 }, (_, i) => ({
      technicalDebt: Math.random() * 50,
      velocity: 20 + Math.random() * 30 - i * 0.5,
    })),
    velocityTrend: Array.from({ length: 12 }, (_, i) => ({
      sprint: `Sprint ${i + 1}`,
      velocity: 25 + Math.random() * 10 - i * 0.2,
      capacity: 30 + Math.random() * 5,
    })),
    qualityCorrelation: Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      codeQuality: 70 + Math.random() * 25,
      deliverySuccess: 75 + Math.random() * 20,
    })),
    bugRateCorrelation: Array.from({ length: 24 }, (_, i) => ({
      week: `W${i + 1}`,
      bugRate: 2 + Math.random() * 3,
      codeQuality: 80 - Math.random() * 20,
    })),
    deliveryMetrics: {
      onTimeDelivery: Math.round(75 + Math.random() * 20),
      avgLeadTime: Math.round(5 + Math.random() * 10),
      cycleTime: Math.round(3 + Math.random() * 5),
    },
    deliveryTrend: Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      delivered: Math.round(8 + Math.random() * 6),
      planned: Math.round(10 + Math.random() * 4),
    })),
  };
}
