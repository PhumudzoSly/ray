"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";

interface ModuleStatusCardProps {
  title: string;
  status?: string | null;
  score?: number | null;
  progress?: number | null;
}

function ModuleStatusCard({ title, status, score, progress }: ModuleStatusCardProps) {
  // Status badge variants
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
        <div className="flex items-center justify-between">
          <Badge variant={getStatusVariant(status)}>
            {status ? status.replace("_", " ") : "Unknown"}
          </Badge>
          {score !== undefined && score !== null && (
            <span className="text-lg font-bold">{score.toFixed(0)}</span>
          )}
        </div>
        {progress !== undefined && progress !== null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ModuleStatusGridProps {
  modules: ModuleStatusCardProps[];
}

export function ModuleStatusGrid({ modules }: ModuleStatusGridProps) {
  // Filter out modules with no data
  const validModules = modules.filter(module => 
    module.title || 
    module.status || 
    (module.score !== undefined && module.score !== null) ||
    (module.progress !== undefined && module.progress !== null)
  );

  if (validModules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No module data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {validModules.map((module, index) => (
        <ModuleStatusCard key={index} {...module} />
      ))}
    </div>
  );
}