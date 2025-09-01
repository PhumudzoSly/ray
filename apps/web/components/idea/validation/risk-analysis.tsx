"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RiskItem {
  id: string;
  category: string;
  description: string;
  impact: number;
  probability: number;
}

interface RiskAnalysisProps {
  overallRiskScore?: number | null;
  riskItems?: RiskItem[] | null;
}

export function RiskAnalysis({
  overallRiskScore,
  riskItems = [],
}: RiskAnalysisProps) {
  // Handle case where there's no risk data
  if (!overallRiskScore && (!riskItems || riskItems.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No risk analysis data available
      </div>
    );
  }

  // Risk matrix data - mapping probability (x) and impact (y)
  const riskMatrixData = (riskItems || []).map((item) => ({
    ...item,
    probabilityScore: item.probability * 20, // Convert 1-5 to 0-100 scale
    impactScore: item.impact * 20, // Convert 1-5 to 0-100 scale
  }));

  // Risk category distribution
  const categoryCounts = (riskItems || []).reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryData = Object.entries(categoryCounts).map(
    ([category, count]) => ({
      name: category,
      value: count,
    })
  );

  // Colors for the charts
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Risk Score Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center py-4">
            {overallRiskScore !== null && overallRiskScore !== undefined
              ? `${overallRiskScore.toFixed(0)}/100`
              : "N/A"}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {overallRiskScore !== null && overallRiskScore !== undefined
              ? overallRiskScore < 30
                ? "Low Risk"
                : overallRiskScore < 60
                  ? "Moderate Risk"
                  : overallRiskScore < 80
                    ? "High Risk"
                    : "Critical Risk"
              : "Risk level unknown"}
          </div>
        </CardContent>
      </Card>

      {/* Risk Category Distribution */}
      {categoryData.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Risk Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="h-40">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Risk Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">No risk categories data</p>
          </CardContent>
        </Card>
      )}

      {/* Risk Matrix */}
      {(riskItems || []).length > 0 ? (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="probabilityScore"
                    name="Probability"
                    domain={[0, 100]}
                    label={{ value: "Probability", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="impactScore"
                    name="Impact"
                    domain={[0, 100]}
                    label={{ value: "Impact", angle: -90, position: "left" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Scatter
                    name="Risks"
                    data={riskMatrixData}
                    fill="hsl(var(--chart-1))"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">
              No risk matrix data available
            </p>
          </CardContent>
        </Card>
      )}

      {/* Top Risks List */}
      {(riskItems || []).length > 0 ? (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(riskItems || []).slice(0, 5).map((risk) => (
                <div
                  key={risk.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{risk.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {risk.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Impact: {risk.impact}/5, Probability: {risk.probability}
                        /5
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {(risk.impact * risk.probability * 4).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Risks</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No risk items identified</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
