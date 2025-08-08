"use client";

import { useState } from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Diamond, Calendar as CalendarIcon, Building2 } from "lucide-react";
import { MilestoneStatusBadge } from "./milestone-status-badge";
import { MilestoneDetailsSheet } from "./milestone-details-sheet";
import { Calendar } from "@workspace/ui/components/calendar/calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@workspace/ui/components/hover-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllMilestones, updateMilestone } from "@/actions/project/milestone";

interface GlobalMilestoneTimelineProps {
  className?: string;
  milestones?: Array<any>;
}

interface MilestoneEvent {
  id: string;
  title: string;
  date: Date;
  milestone: {
    id: string;
    name: string;
    status: string;
    progress?: number;
    description?: string;
    project?: { id: string; name: string } | null;
  };
}

export function GlobalMilestoneTimeline({ className, milestones: inputMilestones }: GlobalMilestoneTimelineProps) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const { data: fetched } = useQuery({
    queryKey: ["milestones"],
    queryFn: async () => (await getAllMilestones()) ?? [],
    enabled: !inputMilestones,
  });
  const milestones = (inputMilestones ?? fetched ?? []) as any[];

  const queryClient = useQueryClient();

  // Normalize shape for timeline
  const normalized = milestones.map((m: any) => ({
    id: m.id,
    name: m.name,
    status: m.status,
    progress: (m as any).progress,
    description: m.description,
    endDate: m.endDate,
    project: (m as any).project ? { id: (m as any).project.id, name: (m as any).project.name } : null,
  }));

  const mutation = useMutation({
    mutationFn: async (data: any) => updateMilestone(data.milestoneId, { endDate: data.endDate }),
    onSuccess: () => {
      toast.success("End date has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
    onError: () => {
      toast.error("Failed to update milestone end date. Please try again.");
    },
  });

  if (!normalized || normalized.length === 0) {
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
            <p className="text-sm">Add end dates to your milestones to see them on the timeline.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const milestoneEvents: MilestoneEvent[] = useMemo(() => (
    normalized
      .filter((m: any) => m.endDate)
      .map((m: any) => ({
        id: m.id,
        title: m.name,
        date: new Date(m.endDate!),
        milestone: {
          id: m.id,
          name: m.name,
          status: m.status,
          progress: m.progress || 0,
          description: m.description,
          project: m.project,
        },
      }))
  ), [normalized]);
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

  const renderMilestoneEvent = (event: MilestoneEvent, isDragging?: boolean) => {
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
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getStatusColor(milestone.status))} />
              {milestone?.progress && milestone?.progress > 0 ? (
                <Badge variant="outline" className="text-xs font-medium px-1 py-0">
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
            onClick={() => handleMilestoneClick(milestone.id)}
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{milestone.name}</h4>
              {milestone.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-1">
                  {milestone.description}
                </p>
              )}
            </div>
            {milestone.project && (
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Project:</span>
                <span className="font-medium">{milestone.project.name}</span>
              </div>
            )}
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
              <span className="font-medium">{event.date.toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-muted-foreground/70 pt-1 border-t">Click to view details</div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const handleEventClick = (event: MilestoneEvent) => {
    setSelectedMilestoneId(event.milestone.id);
    setIsDetailsSheetOpen(true);
  };

  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setIsDetailsSheetOpen(true);
  };

  return (
    <div className="container">
      <div className="space-y-4">
        <Calendar
          events={milestoneEvents}
          onEventDrop={handleEventDrop}
          onEventClick={handleEventClick}
          renderEvent={renderMilestoneEvent}
          defaultView="month"
          views={["month", "week"]}
          weekStartDay={1}
        />
      </div>

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

export default GlobalMilestoneTimeline;

