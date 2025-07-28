"use client";

import {
  Activity,
  Brain,
  TrendingUp,
  Target,
  Shield,
  BarChart3,
} from "lucide-react";
import DottedMap from "dotted-map";
import { Area, AreaChart, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

export default function IdeaValidation() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl border md:grid-cols-2">
        <div>
          <div className="p-6 sm:p-12">
            <span className="text-muted-foreground flex items-center gap-2">
              <Brain className="size-4" />
              AI-Powered Market Validation
            </span>

            <p className="mt-8 text-2xl font-semibold">
              Start validating with AI-powered insights that give you actionable
              market intelligence.
            </p>
          </div>

          <div aria-hidden className="relative">
            <div className="absolute inset-0 z-10 m-auto size-fit">
              <div className="rounded-[--radius] bg-background z-[1] dark:bg-muted relative flex size-fit w-fit items-center gap-2 border px-3 py-1 text-xs font-medium shadow-md shadow-black/5">
                <span className="text-lg">📊</span> Market Size: $2.4B TAM
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="[background-image:radial-gradient(var(--tw-gradient-stops))] z-1 to-background absolute inset-0 from-transparent to-75%"></div>
              <Map />
            </div>
          </div>
        </div>
        <div className="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
          <div className="relative z-10">
            <span className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4" />
              Competitive Intelligence
            </span>

            <p className="my-8 text-2xl font-semibold">
              Real-time competitor tracking with SWOT analysis and market signal
              detection.
            </p>
          </div>
          <div aria-hidden className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex justify-center items-center size-5 rounded-full border">
                  <span className="size-3 rounded-full bg-green-500" />
                </span>
                <span className="text-muted-foreground text-xs">
                  Market Signal Detected
                </span>
              </div>
              <div className="rounded-[--radius] bg-background mt-1.5 w-3/5 border p-3 text-xs">
                Competitor X launched new feature. Impact: Medium threat level.
              </div>
            </div>

            <div>
              <div className="rounded-[--radius] mb-1 ml-auto w-3/5 bg-blue-600 p-3 text-xs text-white">
                AI Analysis: Market opportunity identified in enterprise
                segment. Recommended action: Accelerate B2B features.
              </div>
              <span className="text-muted-foreground block text-right text-xs">
                Now
              </span>
            </div>
          </div>
        </div>
        <div className="col-span-full border-y p-12">
          <p className="text-center text-4xl font-semibold lg:text-7xl">
            87/100 Validation Score
          </p>
          <p className="text-center text-lg text-muted-foreground mt-4">
            AI-powered confidence scoring with actionable recommendations
          </p>
        </div>
        <div className="relative col-span-full">
          <div className="absolute z-10 max-w-lg px-6 pr-12 pt-6 md:px-12 md:pt-12">
            <span className="text-muted-foreground flex items-center gap-2">
              <BarChart3 className="size-4" />
              Market Analysis Dashboard
            </span>

            <p className="my-8 text-2xl font-semibold">
              Monitor market trends and validation metrics.
              <span className="text-muted-foreground">
                {" "}
                Instantly identify opportunities and threats.
              </span>
            </p>
          </div>
          <ValidationChart />
        </div>
      </div>
    </section>
  );
}

const map = new DottedMap({ height: 55, grid: "diagonal" });

const points = map.getPoints();

const svgOptions = {
  backgroundColor: "var(--color-background)",
  color: "currentColor",
  radius: 0.15,
};

const Map = () => {
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
};

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

const ValidationChart = () => {
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
};
