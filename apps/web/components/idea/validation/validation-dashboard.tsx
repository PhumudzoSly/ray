"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { CalendarIcon, ClockIcon, Edit,  } from "lucide-react";

interface ValidationDashboardProps {
  overallScore?: number | null;
  overallStatus?: string | null;
  confidenceLevel?: number | null;
  validationProgress?: number | null;
  overallStrengthScore?: number | null;
  overallRiskScore?: number | null;
  timeToMarket?: number | null;
  fundingRequired?: number | null;
  breakEvenMonth?: number | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  lastUpdatedAt?: Date | null;
}

export function ValidationDashboard({ 
  overallScore,
  overallStatus,
  confidenceLevel,
  validationProgress,
  overallStrengthScore,
  overallRiskScore,
  timeToMarket,
  fundingRequired,
  breakEvenMonth,
  startedAt,
  completedAt,
  lastUpdatedAt
}: ValidationDashboardProps) {
  // Status badge variants
  const getStatusVariant = (status?: string | null) => {
    if (!status) return "outline";
    switch (status) {
      case "COMPLETED": return "default";
      case "IN_PROGRESS": return "secondary";
      case "PENDING": return "outline";
      default: return "destructive";
    }
  };

  // Strength vs Risk data for the bar chart
  const strengthRiskData = [
    { name: "Strength", score: overallStrengthScore ?? 0 },
    { name: "Risk", score: overallRiskScore ?? 0 }
  ];

  // KPI data
  const kpiData = [
    { title: "Time to Market", value: timeToMarket ? `${timeToMarket} months` : "N/A" },
    { title: "Funding Required", value: fundingRequired ? `$${(fundingRequired / 1000000).toFixed(1)}M` : "N/A" },
    { title: "Break-even", value: breakEvenMonth ? `${breakEvenMonth} months` : "N/A" }
  ];

  // Timeline data
  const timelineEvents = [
    { 
      title: "Started", 
      date: startedAt ? new Date(startedAt).toLocaleDateString() : "N/A",
      icon: <CalendarIcon className="h-4 w-4" />
    },
    { 
      title: "Last Updated", 
      date: lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleDateString() : "N/A",
      icon: <Edit className="h-4 w-4" />
    },
    { 
      title: "Completed", 
      date: completedAt ? new Date(completedAt).toLocaleDateString() : "N/A",
      icon: <ClockIcon className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overallScore !== null && overallScore !== undefined ? `${overallScore.toFixed(0)}/100` : "N/A"}
            </div>
            <Badge variant={getStatusVariant(overallStatus)} className="mt-2">
              {overallStatus ? overallStatus.replace("_", " ") : "Unknown"}
            </Badge>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {validationProgress !== null && validationProgress !== undefined ? 
                    `${validationProgress.toFixed(0)}%` : "N/A"}
                </span>
              </div>
              <Progress 
                value={validationProgress !== null && validationProgress !== undefined ? validationProgress : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Confidence Level Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {confidenceLevel !== null && confidenceLevel !== undefined ? `${confidenceLevel.toFixed(0)}/100` : "N/A"}
            </div>
            <div className="mt-4 relative h-32 w-full">
              <div className="absolute inset-0 flex items-end justify-center">
                <div 
                  className="w-16 bg-primary rounded-t transition-all duration-500"
                  style={{ 
                    height: `${confidenceLevel !== null && confidenceLevel !== undefined ? confidenceLevel : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strength vs Risk Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Strength vs Risk</CardTitle>
          </CardHeader>
          <CardContent className="h-40">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengthRiskData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {strengthRiskData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === "Strength" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {kpiData.map((kpi, index) => (
          <Card key={index} className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline Component */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Validation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="bg-muted p-2 rounded-full mb-2">
                  {event.icon}
                </div>
                <div className="text-sm font-medium">{event.title}</div>
                <div className="text-xs text-muted-foreground">{event.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}