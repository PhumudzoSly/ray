"use client";

import { useId, useState } from "react";
import { CheckIcon, Map } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useQuery } from "@tanstack/react-query";
import { getAllPublicRoadmaps } from "@/actions/roadmap";

interface RoadmapSelectorProps {
  currentRoadmap?: string | null;
  onChange: (roadmap: string | null) => void;
}

export function RoadmapSelector({
  currentRoadmap,
  onChange,
}: RoadmapSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleRoadmapChange = (roadmapId: string) => {
    onChange(roadmapId);
    setOpen(false);
  };

  const { data: roadmapsResponse, isPending } = useQuery({
    queryKey: ["public-roadmaps"],
    queryFn: async () => {
      const result = await getAllPublicRoadmaps();
      return result;
    },
  });

  const roadmaps = roadmapsResponse?.success ? roadmapsResponse.data : [];

  const selectedRoadmap = roadmaps?.find(
    (roadmap) => roadmap.id === currentRoadmap
  );

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center"
            size="sm"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
              </div>
            ) : selectedRoadmap ? (
              <div className="flex items-center gap-2">
                <Map className="text-green-500 size-4" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {selectedRoadmap.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedRoadmap.stats.totalItems} items •{" "}
                    {selectedRoadmap.stats.totalVotes} votes
                  </span>
                </div>
              </div>
            ) : (
              <span>Select Roadmap</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search roadmaps..." />
            <CommandList>
              <CommandEmpty>
                {isPending ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Loading roadmaps...</span>
                  </div>
                ) : (
                  "No roadmaps found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {(roadmaps ?? [])?.map((roadmap) => (
                  <CommandItem
                    key={roadmap.id}
                    value={roadmap.id}
                    onSelect={() => handleRoadmapChange(roadmap.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Map className="text-green-500 size-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{roadmap.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {roadmap.project.name} • {roadmap.stats.totalItems}{" "}
                          items • {roadmap.stats.totalVotes} votes •{" "}
                          {roadmap.stats.totalFeedback} feedback
                        </span>
                      </div>
                    </div>
                    {currentRoadmap === roadmap.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
