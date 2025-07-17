"use client";

import { useState } from "react";
import { useSession } from "@/context/session-context";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Diamond, Calendar as CalendarIcon } from "lucide-react";
import { MilestoneStatusBadge } from "./milestone-status-badge";
import { MilestoneDetailsSheet } from "./milestone-details-sheet";
import { Calendar } from "@workspace/ui/components/calendar/calendar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProjectMilestones, updateMilestone } from "@/actions/project/milestone";

interface MilestoneTimelineProps {
  projectId: string;
  className?: string;
}

interface MilestoneEvent {
  id: string;
  title: string;
  date: Date;
  milestone: {
    _id: string;
    name: string;
    status: string;
    progress?: number;
    description?: string;
  };
}

export function MilestoneTimeline({
  projectId,
  className,
}: MilestoneTimelineProps) {
  const [selectedMilestoneId, setSelectedMilestoneId] =
    useState<string | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  const { token } = useSession();
  const { data: milestones } = useQuery({
    queryKey: ["milestones", projectId, token],
    queryFn: async () => {
      if (!token || !projectId) return [];
      const raw = await getProjectMilestones(projectId);
      return (raw ?? []).map((m: any) => ({
        _id: m.id,
        name: m.name,
        status: m.status,
        progress: m.progress,
        description: m.description,
        endDate: m.endDate,
      }));
    },
    enabled: !!token && !!projectId,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => updateMilestone(data.milestoneId, { endDate: data.endDate }),
    onSuccess: () => {
      toast.success("End date has been updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update milestone end date. Please try again.");
    },
  });

  if (!milestones || milestones.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Diamond className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Milestone Timeline</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No milestones with end dates found.</p>
            <p className="text-sm">
              Add end dates to your milestones to see them on the timeline.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert milestones to calendar events
  const milestoneEvents: MilestoneEvent[] = milestones
    .filter((milestone: any) => milestone.endDate)
    .map((milestone: any) => ({
      id: milestone._id,
      title: milestone.name,
      date: new Date(milestone.endDate!),
      milestone: {
        _id: milestone._id,
        name: milestone.name,
        status: milestone.status,
        progress: milestone.progress || 0,
        description: milestone.description,
      },
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 dark:bg-green-400";
      case "at-risk":
        return "bg-orange-500 dark:bg-orange-400";
      case "delayed":
        return "bg-red-500 dark:bg-red-400";
      case "in-progress":
        return "bg-blue-500 dark:bg-blue-400";
      default:
        return "bg-muted-foreground";
    }
  };

  const handleEventDrop = async (eventId: string, newDate: Date) => {
    mutation.mutate({ milestoneId: eventId, endDate: newDate.getTime() });
  };

  const renderMilestoneEvent = (
    event: MilestoneEvent,
    isDragging?: boolean
  ) => {
    const { milestone } = event;

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div
            className={cn(
              "space-y-1 gap-2 p-2 rounded-lg border transition-all cursor-pointer",
              "bg-background/95 backdrop-blur-sm shadow-sm",
              isDragging && "opacity-50 scale-95",
              "hover:shadow-md hover:scale-[1.02]"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  getStatusColor(milestone.status)
                )}
              />
              {milestone?.progress && milestone?.progress > 0 ? (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-1 py-0"
                >
                  {milestone.progress}% progress
                </Badge>
              ) : null}
            </div>
            <div className=" gap-2 text-xs">
              <MilestoneStatusBadge status={milestone.status as any} />
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div
            className="space-y-3 cursor-pointer hover:bg-muted/50  rounded-md transition-colors"
            onClick={() => handleMilestoneClick(milestone._id)}
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{milestone.name}</h4>
              {milestone.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-1">
                  {milestone.description}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <MilestoneStatusBadge status={milestone.status as any} />
              </div>
              {milestone?.progress && milestone?.progress > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Progress:</span>
                  <Badge variant="outline" className="text-xs font-medium">
                    {milestone.progress}%
                  </Badge>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <span>End Date: </span>
              <span className="font-medium">
                {event.date.toLocaleDateString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground/70 pt-1 border-t">
              Click to view details
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const handleEventClick = (event: MilestoneEvent) => {
    setSelectedMilestoneId(event.milestone._id);
    setIsDetailsSheetOpen(true);
  };

  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setIsDetailsSheetOpen(true);
  };

  return (
    <div className="container">
      <div className="space-y-4">
        {/* Calendar */}
        <Calendar
          events={milestoneEvents}
          onEventDrop={handleEventDrop}
          onEventClick={handleEventClick}
          renderEvent={renderMilestoneEvent}
          defaultView="month"
          views={["month", "week"]}
          weekStartDay={1} // Monday
        />

        {/* Milestone Legend */}
        <div className="py-4 border-y">
          <h4 className="text-sm font-medium mb-3">Status Legend</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span>Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Details Sheet */}
      {selectedMilestoneId && (
        <MilestoneDetailsSheet
          milestoneId={selectedMilestoneId}
          open={isDetailsSheetOpen}
          onOpenChange={setIsDetailsSheetOpen}
        />
      )}
    </div>
  );
}
