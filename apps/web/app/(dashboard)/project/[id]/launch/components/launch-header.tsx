"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowLeft, Rocket, RefreshCw } from "lucide-react";
import Link from "next/link";

interface LaunchHeaderProps {
  project: {
    _id: string;
    name: string;
    platform: string;
  };
  launchPlan?: {
    status: string;
  };
  isGenerating: boolean;
  onGenerateLaunchPlan: () => void;
}

export function LaunchHeader({
  project,
  launchPlan,
  isGenerating,
  onGenerateLaunchPlan,
}: LaunchHeaderProps) {
  return (
    <div className="bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold">Launch AI</h1>
              <p className="text-sm text-muted-foreground">
                Launch what's next with the power of AI.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {launchPlan && (
                <Badge
                  variant={
                    launchPlan.status === "launched" ? "default" : "secondary"
                  }
                >
                  {launchPlan.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={onGenerateLaunchPlan}
          disabled={isGenerating}
          variant={launchPlan ? "outline" : "default"}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : launchPlan ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Generate Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
