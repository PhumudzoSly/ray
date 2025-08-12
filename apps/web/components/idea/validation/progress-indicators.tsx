"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";

interface ProgressIndicatorProps {
  title: string;
  progress?: number | null;
  status?: string | null;
}

function ProgressIndicatorCard({ title, progress, status }: ProgressIndicatorProps) {
  const getStatusVariant = (status?: string | null) => {
    if (!status) return "outline";
    switch (status) {
      case "COMPLETED": return "default";
      case "IN_PROGRESS": return "secondary";
      case "PENDING": return "outline";
      default: return "destructive";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {status ? status.replace("_", " ") : "Unknown"}
          </span>
          <span className="text-xs font-medium">
            {progress !== null && progress !== undefined ? `${progress.toFixed(0)}%` : "N/A"}
          </span>
        </div>
        <Progress 
          value={progress !== null && progress !== undefined ? progress : 0} 
          className="h-2" 
        />
      </CardContent>
    </Card>
  );
}

interface ProgressIndicatorsProps {
  modules: ProgressIndicatorProps[];
}

export function ProgressIndicators({ modules }: ProgressIndicatorsProps) {
  // Filter out modules with no data
  const validModules = modules.filter(module => 
    module.title || 
    module.status || 
    (module.progress !== undefined && module.progress !== null)
  );

  if (validModules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No progress data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {validModules.map((module, index) => (
        <ProgressIndicatorCard key={index} {...module} />
      ))}
    </div>
  );
}