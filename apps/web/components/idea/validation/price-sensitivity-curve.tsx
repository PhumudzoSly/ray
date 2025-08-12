"use client";

import React from "react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@workspace/ui/components/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts";

interface PriceSensitivityCurveProps {
  data?: {
    price: number;
    demand: number; // 0-100 percentage
    elasticity?: number | null; // -100 to 100
  }[] | null;
}

export function PriceSensitivityCurve({ data = [] }: PriceSensitivityCurveProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No price sensitivity data available
      </div>
    );
  }

  // Prepare data for chart
  const chartData = data.map(point => ({
    price: point.price,
    demand: point.demand,
    elasticity: point.elasticity || 0
  }));

  return (
    <ChartContainer config={{}} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="price" 
            name="Price" 
            unit="$"
            label={{ value: "Price ($)", position: "bottom" }}
          />
          <YAxis 
            domain={[0, 100]} 
            label={{ value: "Demand (%)", angle: -90, position: "left" }}
          />
          <ChartTooltip 
            content={
              <ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'price') return [`$${Number(value).toFixed(2)}`, 'Price'];
                  if (name === 'demand') return [`${Number(value).toFixed(1)}%`, 'Demand'];
                  if (name === 'elasticity') return [Number(value).toFixed(2), 'Elasticity'];
                  return [value, name];
                }}
              />
            } 
          />
          <Line 
            type="monotone" 
            dataKey="demand" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2} 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }} 
            name="Demand"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}