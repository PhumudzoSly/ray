"use client";

import {
  Brain,
  TrendingUp,
  BarChart3,
  Target,
  DollarSign,
  UsersRound,
  TrendingUp as TrendingUpIcon,
  HeartHandshake,
  ShieldAlert,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Map, ValidationChart } from "./validation-chart";
import { Cover } from "@workspace/ui/components/cover";

export function ValidationSection() {
  return (
    <div className="grid border md:grid-cols-2">
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
              AI Analysis: Market opportunity identified in enterprise segment.
              Recommended action: Accelerate B2B features.
            </div>
            <span className="text-muted-foreground block text-right text-xs">
              Now
            </span>
          </div>
        </div>
      </div>
      <div className="col-span-full border-y p-12">
        <p className="text-center text-4xl font-semibold lg:text-7xl">
          97/100 Validation Score
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

      <div className="col-span-full">
        <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
          Build, launch and grow <br /> at <Cover>warp speed</Cover>
        </h1>
      </div>
    </div>
  );
}
