"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/context/session-context";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Badge } from "@workspace/ui/components/badge";
import { Check, ChevronsUpDown, Diamond, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MilestoneStatusBadge } from "@/components/project/milestones/milestone-status-badge";
import { getProjectMilestones } from "@/actions/project/milestone";
import { MilestoneStatus } from "@workspace/backend/prisma/generated/client/client";

interface MilestoneSelectorProps {
  projectId: string;
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

interface Milestone {
  id: string;
  name: string;
  status: string;
  progress: number;
}

export function MilestoneSelector({
  projectId,
  value,
  onValueChange,
  placeholder = "Select milestone",
  className,
}: MilestoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const { token } = useSession();

  const { data: milestones } = useQuery<Milestone[]>({
    queryKey: ["milestones", projectId, token],
    queryFn: async () => {
      if (!token || !projectId) return [];
      const raw = await getProjectMilestones(projectId);
      return (raw ?? []).map((m: any) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        progress: m.progress,
      }));
    },
    enabled: !!token && !!projectId,
  });

  const selectedMilestone = (milestones ?? []).find(
    (milestone) => milestone.id === value
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            // variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between cursor-pointer bg-card border p-2 rounded-md"
          >
            {selectedMilestone ? (
              <>
                <div className="flex items-center gap-2">
                  <Diamond className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate font-medium">
                    {selectedMilestone.name}
                  </span>
                </div>
                <MilestoneStatusBadge
                  status={selectedMilestone.status as MilestoneStatus}
                />
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Diamond className="h-3 w-3" />
                <span>{placeholder}</span>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Search milestones..." />
            <CommandEmpty>No milestones found.</CommandEmpty>
            <CommandGroup>
              {(milestones ?? []).map((milestone) => (
                <CommandItem
                  key={milestone.id}
                  value={milestone.name}
                  onSelect={() => {
                    onValueChange(milestone.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === milestone.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2">
                      <Diamond className="h-3 w-3" />
                      <span className="truncate">{milestone.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MilestoneStatusBadge
                        status={milestone.status as MilestoneStatus}
                      />
                      {milestone.progress > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {milestone.progress}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
