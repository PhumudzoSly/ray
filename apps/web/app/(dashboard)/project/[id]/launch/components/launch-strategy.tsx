"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Calendar, Target, Users, BarChart3 } from "lucide-react";

interface StrategyPhase {
  _id: string;
  name: string;
  description: string;
  phase: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  targetAudience: string[];
  keyMetrics?: Array<{
    name: string;
    target: string;
  }>;
}

interface LaunchStrategyProps {
  strategyPhases: StrategyPhase[];
}

const phaseColors = {
  "pre-launch": "#3b82f6",
  "soft-launch": "#10b981",
  "main-launch": "#ef4444",
  "post-launch": "#8b5cf6",
};

export function LaunchStrategy({ strategyPhases }: LaunchStrategyProps) {
  if (strategyPhases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No launch strategy yet</h3>
        <p className="text-muted-foreground">
          Generate a launch plan to see your phased strategy
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {strategyPhases.map((phase, index) => (
        <div key={phase._id} className="relative">
          {/* Timeline connector */}
          {index < strategyPhases.length - 1 && (
            <div className="absolute left-6 top-16 w-0.5 h-12 bg-border" />
          )}

          <div className="flex gap-4">
            {/* Phase indicator */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                style={{
                  backgroundColor:
                    phaseColors[phase.phase as keyof typeof phaseColors] ||
                    "#6b7280",
                }}
              >
                {index + 1}
              </div>
              <Badge variant="outline" className="mt-2 text-xs capitalize">
                {phase.phase.replace("-", " ")}
              </Badge>
            </div>

            {/* Phase content */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{phase.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {phase.description}
                </p>
              </div>

              {/* Phase details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Timeline</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {phase.startDate} → {phase.endDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Platforms</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {phase.platforms.map((platform) => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className="text-xs"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Target Audience</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {phase.targetAudience.map((audience) => (
                      <Badge
                        key={audience}
                        variant="outline"
                        className="text-xs"
                      >
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>

                {phase.keyMetrics && phase.keyMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Key Metrics</span>
                    </div>
                    <div className="space-y-1">
                      {phase.keyMetrics.map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">
                            {metric.name}
                          </span>
                          <span className="font-medium">{metric.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
