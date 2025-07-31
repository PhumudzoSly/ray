"use client";

import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { useResearchSession } from "./useResearchSession";
import { formatDuration } from "@/lib/config/researchConfig";

interface ResearchProgressProps {
  ideaId: string;
}

export function ResearchProgress({ ideaId }: ResearchProgressProps) {
  const { data, isLoading, error } = useResearchSession(ideaId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load research progress
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const session = data;
  const totalPhases = session.phases.length;
  const completedPhases = session.phases.filter(
    (p: any) => p.status === "COMPLETED"
  ).length;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "INITIALIZING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      case "PAUSED":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "IN_PROGRESS":
        return "In Progress";
      case "INITIALIZING":
        return "Starting...";
      case "FAILED":
        return "Failed";
      case "PAUSED":
        return "Paused";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Research Progress</h3>
        <Badge
          variant="secondary"
          className={`${getStatusColor(session.status)} text-white`}
        >
          {getStatusText(session.status)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Research Phases</div>
        <div className="space-y-1">
          {session.phases.map((phase: any, index: any) => (
            <div
              key={phase.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(phase.status)}`}
                />
                <span className="capitalize">
                  {phase.phaseName.toLowerCase().replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {phase.confidence && (
                  <span className="text-xs text-gray-500">
                    {Math.round(phase.confidence)}% confidence
                  </span>
                )}
                {phase.duration && (
                  <span className="text-xs text-gray-500">
                    {formatDuration(phase.duration)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {session.status === "COMPLETED" && (
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span>Overall Confidence</span>
            <span className="font-medium">
              {Math.round(session.overallConfidence)}%
            </span>
          </div>
          {session.totalCost > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Total Cost</span>
              <span>${session.totalCost.toFixed(3)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
