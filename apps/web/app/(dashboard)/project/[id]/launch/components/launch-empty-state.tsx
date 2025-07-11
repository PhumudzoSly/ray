"use client";

import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import {
  Rocket,
  CheckSquare,
  MessageSquare,
  Target,
  BarChart3,
} from "lucide-react";

interface LaunchEmptyStateProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

export function LaunchEmptyState({
  isGenerating,
  onGenerate,
}: LaunchEmptyStateProps) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6" />
        <h2 className="text-xl font-semibold mb-2">Generating Launch Plan</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Analyzing your project and creating a comprehensive launch strategy
          with interactive checklists, platform copy, and timeline phases...
        </p>
        <div className="w-full max-w-md">
          <Progress value={75} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Rocket className="h-16 w-16 text-muted-foreground mb-6" />
      <h2 className="text-2xl font-bold mb-2">Ready for Launch?</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Generate a comprehensive, structured launch plan with interactive
        checklists, platform-specific copy, and timeline management.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-8">
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <CheckSquare className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-medium text-sm">Smart Checklist</h3>
          <p className="text-xs text-muted-foreground text-center">
            Interactive, categorized tasks
          </p>
        </div>
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <MessageSquare className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-medium text-sm">Platform Copy</h3>
          <p className="text-xs text-muted-foreground text-center">
            Optimized for each platform
          </p>
        </div>
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <Target className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-medium text-sm">Launch Strategy</h3>
          <p className="text-xs text-muted-foreground text-center">
            Phased timeline approach
          </p>
        </div>
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <BarChart3 className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-medium text-sm">Progress Tracking</h3>
          <p className="text-xs text-muted-foreground text-center">
            Real-time launch readiness
          </p>
        </div>
      </div>

      <Button size="lg" onClick={onGenerate} className="gap-2">
        <Rocket className="h-4 w-4" />
        Generate Launch Plan
      </Button>
    </div>
  );
}
