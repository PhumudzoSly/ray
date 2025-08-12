"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
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

interface PMFMetricsProps {
  pmfScore?: number | null;
  npsScore?: number | null;
  retentionRateData?: { month: string; rate: number }[] | null;
  mustHaveScore?: number | null;
  dauMauRatio?: number | null;
}

export function PMFMetrics({ 
  pmfScore,
  npsScore,
  retentionRateData = [],
  mustHaveScore,
  dauMauRatio
}: PMFMetricsProps) {
  // PMF score data for gauge visualization
  const pmfScoreData = [
    { name: "Score", value: pmfScore ?? 0 },
    { name: "Remaining", value: pmfScore !== null && pmfScore !== undefined ? 100 - pmfScore : 100 }
  ];

  // NPS score data
  const npsScoreData = [
    { name: "Score", value: npsScore ?? 0 },
    { name: "Remaining", value: npsScore !== null && npsScore !== undefined ? 100 - npsScore : 100 }
  ];

  // DAU/MAU ratio data for visualization
  const dauMauData = dauMauRatio !== null && dauMauRatio !== undefined ? [
    { name: "DAU/MAU", value: dauMauRatio * 100 },
    { name: "Remaining", value: 100 - (dauMauRatio * 100) }
  ] : [];

  // Colors for the charts
  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--muted))"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* PMF Score Gauge */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PMF Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pmfScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {pmfScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="absolute text-2xl font-bold">
              {pmfScore !== null && pmfScore !== undefined ? pmfScore.toFixed(0) : "N/A"}
            </div>
          </CardContent>
        </Card>

        {/* NPS Score Gauge */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={npsScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {npsScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="absolute text-2xl font-bold">
              {npsScore !== null && npsScore !== undefined ? npsScore.toFixed(0) : "N/A"}
            </div>
          </CardContent>
        </Card>

        {/* Retention Rate Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-32">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionRateData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Must-have Score */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Must-have Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mustHaveScore !== null && mustHaveScore !== undefined ? `${mustHaveScore.toFixed(0)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sean Ellis Test</p>
          </CardContent>
        </Card>

        {/* DAU/MAU Ratio */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">DAU/MAU Ratio</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            {dauMauData.length > 0 ? (
              <>
                <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dauMauData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={35}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {dauMauData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="absolute text-2xl font-bold">
                  {dauMauRatio !== null && dauMauRatio !== undefined ? dauMauRatio.toFixed(2) : "N/A"}
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground mt-1">No data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}