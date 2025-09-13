"use client";

import DottedMap from "dotted-map";
import { Area, AreaChart, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

const map = new DottedMap({ height: 55, grid: "diagonal" });
const points = map.getPoints();

const svgOptions = {
  backgroundColor: "var(--color-background)",
  color: "currentColor",
  radius: 0.15,
};

export function Map() {
  const viewBox = `0 0 120 60`;
  return (
    <svg viewBox={viewBox} style={{ background: svgOptions.backgroundColor }}>
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={svgOptions.radius}
          fill={svgOptions.color}
        />
      ))}
    </svg>
  );
}

const chartConfig = {
  marketSize: {
    label: "TAM",
    color: "#2563eb",
  },
  validationScore: {
    label: "Validation %",
    color: "#10b981",
  },
  competitiveThreat: {
    label: "Threat Level",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const chartData = [
  {
    month: "Jan",
    marketSize: 10,
    validationScore: 8,
    competitiveThreat: 5,
  },
  {
    month: "Feb",
    marketSize: 18,
    validationScore: 14,
    competitiveThreat: 9,
  },
  {
    month: "Mar",
    marketSize: 27,
    validationScore: 22,
    competitiveThreat: 13,
  },
  {
    month: "Apr",
    marketSize: 36,
    validationScore: 30,
    competitiveThreat: 18,
  },
  {
    month: "May",
    marketSize: 48,
    validationScore: 39,
    competitiveThreat: 22,
  },
  {
    month: "Jun",
    marketSize: 60,
    validationScore: 50,
    competitiveThreat: 28,
  },
];

export function ValidationChart() {
  return (
    <ChartContainer className="h-120 aspect-auto md:h-96" config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 0,
          right: 0,
        }}
      >
        <defs>
          <linearGradient id="fillMarketSize" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-marketSize)"
              stopOpacity={0.8}
            />
            <stop
              offset="55%"
              stopColor="var(--color-marketSize)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillValidationScore" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-validationScore)"
              stopOpacity={0.8}
            />
            <stop
              offset="55%"
              stopColor="var(--color-validationScore)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient
            id="fillCompetitiveThreat"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="var(--color-competitiveThreat)"
              stopOpacity={0.8}
            />
            <stop
              offset="55%"
              stopColor="var(--color-competitiveThreat)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          active
          cursor={false}
          content={<ChartTooltipContent className="dark:bg-muted" />}
        />
        <Area
          strokeWidth={2}
          dataKey="marketSize"
          type="step"
          fill="url(#fillMarketSize)"
          fillOpacity={0.1}
          stroke="var(--color-marketSize)"
        />
        <Area
          strokeWidth={2}
          dataKey="validationScore"
          type="step"
          fill="url(#fillValidationScore)"
          fillOpacity={0.1}
          stroke="var(--color-validationScore)"
        />
        <Area
          strokeWidth={2}
          dataKey="competitiveThreat"
          type="step"
          fill="url(#fillCompetitiveThreat)"
          fillOpacity={0.1}
          stroke="var(--color-competitiveThreat)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
