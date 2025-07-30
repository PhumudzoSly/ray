"use client";

import { useEffect, useState } from "react";
import {
  useRoom,
  useBroadcastEvent,
  useEventListener,
} from "@liveblocks/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Activity,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CodeAnalysisEvent {
  type:
    | "analysis_started"
    | "analysis_completed"
    | "analysis_failed"
    | "issue_created"
    | "issue_resolved";
  repositoryId: string;
  repositoryName: string;
  userId: string;
  userName: string;
  timestamp: number;
  data?: {
    analysisId?: string;
    issuesFound?: number;
    criticalIssues?: number;
    overallScore?: number;
    issueId?: string;
    issueTitle?: string;
  };
}

interface RealTimeCodeAnalysisProps {
  projectId: string;
  repositoryIds: string[];
}

export function RealTimeCodeAnalysis({
  projectId,
  repositoryIds,
}: RealTimeCodeAnalysisProps) {
  const room = useRoom();
  const broadcast = useBroadcastEvent();
  const [recentEvents, setRecentEvents] = useState<CodeAnalysisEvent[]>([]);
  const [activeAnalyses, setActiveAnalyses] = useState<Set<string>>(new Set());

  // Listen for code analysis events
  useEventListener(({ event }) => {
    if (event.type === "code-analysis") {
      const analysisEvent = event.data as CodeAnalysisEvent;

      // Update recent events
      setRecentEvents((prev) => [analysisEvent, ...prev.slice(0, 9)]);

      // Update active analyses
      setActiveAnalyses((prev) => {
        const newSet = new Set(prev);
        if (analysisEvent.type === "analysis_started") {
          newSet.add(analysisEvent.repositoryId);
        } else if (
          analysisEvent.type === "analysis_completed" ||
          analysisEvent.type === "analysis_failed"
        ) {
          newSet.delete(analysisEvent.repositoryId);
        }
        return newSet;
      });

      // Show toast notifications for important events
      if (analysisEvent.type === "analysis_completed") {
        const { issuesFound = 0, criticalIssues = 0 } =
          analysisEvent.data || {};
        if (criticalIssues > 0) {
          toast.error(
            `${analysisEvent.repositoryName}: ${criticalIssues} critical issues found`
          );
        } else if (issuesFound === 0) {
          toast.success(`${analysisEvent.repositoryName}: No issues found!`);
        } else {
          toast.info(
            `${analysisEvent.repositoryName}: ${issuesFound} issues found`
          );
        }
      } else if (analysisEvent.type === "analysis_failed") {
        toast.error(`Analysis failed for ${analysisEvent.repositoryName}`);
      }
    }
  });

  // Broadcast analysis events (this would be called from the Inngest functions)
  const broadcastAnalysisEvent = (event: CodeAnalysisEvent) => {
    broadcast({
      type: "code-analysis",
      data: event,
    });
  };

  const getEventIcon = (type: CodeAnalysisEvent["type"]) => {
    switch (type) {
      case "analysis_started":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "analysis_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "analysis_failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "issue_created":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "issue_resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: CodeAnalysisEvent["type"]) => {
    switch (type) {
      case "analysis_started":
        return "blue";
      case "analysis_completed":
        return "green";
      case "analysis_failed":
        return "red";
      case "issue_created":
        return "orange";
      case "issue_resolved":
        return "green";
      default:
        return "gray";
    }
  };

  const getEventMessage = (event: CodeAnalysisEvent) => {
    switch (event.type) {
      case "analysis_started":
        return `${event.userName} started code analysis`;
      case "analysis_completed":
        const {
          issuesFound = 0,
          criticalIssues = 0,
          overallScore = 0,
        } = event.data || {};
        return `Analysis completed: ${issuesFound} issues found (${criticalIssues} critical), score: ${overallScore}%`;
      case "analysis_failed":
        return `Analysis failed`;
      case "issue_created":
        return `New issue created: ${event.data?.issueTitle}`;
      case "issue_resolved":
        return `Issue resolved: ${event.data?.issueTitle}`;
      default:
        return "Unknown event";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Code Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          {activeAnalyses.size > 0 && (
            <Badge variant="default" className="text-xs animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              {activeAnalyses.size} analyzing
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {room.getOthers().length + 1} online
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {recentEvents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No recent code analysis activity</p>
            <p className="text-xs">
              Analysis events will appear here in real-time
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div
                key={`${event.repositoryId}-${event.timestamp}-${index}`}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm truncate">
                      {event.repositoryName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs text-${getEventColor(event.type)}-600 border-${getEventColor(event.type)}-200`}
                    >
                      {event.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getEventMessage(event)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{event.userName}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(event.timestamp, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Analyses */}
        {activeAnalyses.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-600">
                Active Analyses ({activeAnalyses.size})
              </span>
            </div>
            <div className="text-xs text-blue-600/80">
              Code analysis is running in the background. Results will appear
              here when complete.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook to broadcast analysis events from other components
export function useCodeAnalysisBroadcast() {
  const broadcast = useBroadcastEvent();

  const broadcastAnalysisStarted = (
    repositoryId: string,
    repositoryName: string,
    userId: string,
    userName: string
  ) => {
    broadcast({
      type: "code-analysis",
      data: {
        type: "analysis_started",
        repositoryId,
        repositoryName,
        userId,
        userName,
        timestamp: Date.now(),
      } as CodeAnalysisEvent,
    });
  };

  const broadcastAnalysisCompleted = (
    repositoryId: string,
    repositoryName: string,
    userId: string,
    userName: string,
    analysisData: {
      analysisId: string;
      issuesFound: number;
      criticalIssues: number;
      overallScore: number;
    }
  ) => {
    broadcast({
      type: "code-analysis",
      data: {
        type: "analysis_completed",
        repositoryId,
        repositoryName,
        userId,
        userName,
        timestamp: Date.now(),
        data: analysisData,
      } as CodeAnalysisEvent,
    });
  };

  const broadcastAnalysisFailed = (
    repositoryId: string,
    repositoryName: string,
    userId: string,
    userName: string
  ) => {
    broadcast({
      type: "code-analysis",
      data: {
        type: "analysis_failed",
        repositoryId,
        repositoryName,
        userId,
        userName,
        timestamp: Date.now(),
      } as CodeAnalysisEvent,
    });
  };

  const broadcastIssueCreated = (
    repositoryId: string,
    repositoryName: string,
    userId: string,
    userName: string,
    issueData: {
      issueId: string;
      issueTitle: string;
    }
  ) => {
    broadcast({
      type: "code-analysis",
      data: {
        type: "issue_created",
        repositoryId,
        repositoryName,
        userId,
        userName,
        timestamp: Date.now(),
        data: issueData,
      } as CodeAnalysisEvent,
    });
  };

  const broadcastIssueResolved = (
    repositoryId: string,
    repositoryName: string,
    userId: string,
    userName: string,
    issueData: {
      issueId: string;
      issueTitle: string;
    }
  ) => {
    broadcast({
      type: "code-analysis",
      data: {
        type: "issue_resolved",
        repositoryId,
        repositoryName,
        userId,
        userName,
        timestamp: Date.now(),
        data: issueData,
      } as CodeAnalysisEvent,
    });
  };

  return {
    broadcastAnalysisStarted,
    broadcastAnalysisCompleted,
    broadcastAnalysisFailed,
    broadcastIssueCreated,
    broadcastIssueResolved,
  };
}
