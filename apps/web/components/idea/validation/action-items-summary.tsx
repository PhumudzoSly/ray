"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
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
  Cell
} from "recharts";

interface ActionItemsSummaryProps {
  immediateActions?: number | null;
  shortTermActions?: number | null;
  longTermActions?: number | null;
  actionItems?: {
    id: string;
    title: string;
    urgency: number; // 1-5
    impact: number; // 1-5
  }[] | null;
}

export function ActionItemsSummary({ 
  immediateActions,
  shortTermActions,
  longTermActions,
  actionItems = []
}: ActionItemsSummaryProps) {
  // Handle case where there's no action data
  if (immediateActions === null && 
      shortTermActions === null && 
      longTermActions === null && 
      (!actionItems || actionItems.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No action items data available
      </div>
    );
  }

  // Action counter data
  const actionCounts = [
    { name: "Immediate", count: immediateActions ?? 0, color: "hsl(var(--chart-1))" },
    { name: "Short-term", count: shortTermActions ?? 0, color: "hsl(var(--chart-2))" },
    { name: "Long-term", count: longTermActions ?? 0, color: "hsl(var(--chart-3))" }
  ];

  // Priority matrix data - mapping urgency (x) and impact (y)
  const priorityMatrixData = (actionItems || []).map(item => ({
    ...item,
    urgencyScore: item.urgency * 20, // Convert 1-5 to 0-100 scale
    impactScore: item.impact * 20 // Convert 1-5 to 0-100 scale
  }));

  return (
    <div className="space-y-6">
      {/* Action Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionCounts.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{item.name} Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{item.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Matrix */}
        {(actionItems || []).length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Priority Matrix</CardTitle>
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
                      dataKey="urgencyScore" 
                      name="Urgency" 
                      domain={[0, 100]}
                      label={{ value: "Urgency", position: "bottom" }}
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
                      name="Actions" 
                      data={priorityMatrixData} 
                      fill="hsl(var(--chart-1))" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Priority Matrix</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No action items for priority matrix</p>
            </CardContent>
          </Card>
        )}

        {/* Progress Tracker */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Action Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionItems && actionItems.length > 0 ? (
                actionItems.slice(0, 5).map((action) => (
                  <div key={action.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{action.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Urgency: {action.urgency}/5
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Impact: {action.impact}/5
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-2 text-right">
                      <div className="text-sm font-medium">
                        {Math.round((action.urgency * action.impact * 4))}%
                      </div>
                      <div className="text-xs text-muted-foreground">Priority</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No action items to track
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}