"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import { Id } from "@workspace/backend";
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

interface MilestoneSelectorProps {
  projectId: Id<"projects">;
  value?: Id<"milestones">;
  onValueChange: (value: Id<"milestones"> | undefined) => void;
  placeholder?: string;
  className?: string;
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

  const milestones = useQuery(api.milestones.getProjectMilestones, {
    projectId,
    token,
  });
  const selectedMilestone = milestones?.find(
    (milestone) => milestone._id === value
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
                <MilestoneStatusBadge status={selectedMilestone.status} />
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
              {value && (
                <CommandItem
                  onSelect={() => {
                    onValueChange(undefined);
                    setOpen(false);
                  }}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear milestone
                </CommandItem>
              )}
              {milestones?.map((milestone) => (
                <CommandItem
                  key={milestone._id}
                  value={milestone.name}
                  onSelect={() => {
                    onValueChange(milestone._id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === milestone._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2">
                      <Diamond className="h-3 w-3" />
                      <span className="truncate">{milestone.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MilestoneStatusBadge status={milestone.status} />
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
