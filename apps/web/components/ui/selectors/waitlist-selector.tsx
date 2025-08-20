"use client";

import { useId, useState } from "react";
import { CheckIcon, Users } from "lucide-react";
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
import { getAllWaitlists } from "@/actions/waitlist";

interface WaitlistSelectorProps {
  currentWaitlist?: string | null;
  onChange: (waitlist: string | null) => void;
}

export function WaitlistSelector({
  currentWaitlist,
  onChange,
}: WaitlistSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleWaitlistChange = (waitlistId: string) => {
    onChange(waitlistId);
    setOpen(false);
  };

  const { data: waitlistsResponse, isPending } = useQuery({
    queryKey: ["waitlists"],
    queryFn: async () => {
      const result = await getAllWaitlists();
      return result;
    },
  });

  const waitlists = waitlistsResponse?.success ? waitlistsResponse.data : [];

  const selectedWaitlist = waitlists?.find(
    (waitlist: Waitlist) => waitlist.id === currentWaitlist
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
            ) : selectedWaitlist ? (
              <div className="flex items-center gap-2">
                <Users className="text-blue-500 size-4" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {selectedWaitlist.name}
                  </span>
                </div>
              </div>
            ) : (
              <span>Select Waitlist</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search waitlists..." />
            <CommandList>
              <CommandEmpty>
                {isPending ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="ml-2">Loading waitlists...</span>
                  </div>
                ) : (
                  "No waitlists found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {(waitlists ?? [])?.map((waitlist) => (
                  <CommandItem
                    key={waitlist.id}
                    value={waitlist.id}
                    onSelect={() => handleWaitlistChange(waitlist.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="text-blue-500 size-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{waitlist.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {waitlist.project.name} •{" "}
                          {waitlist.stats.totalEntries} entries •{" "}
                          {waitlist.stats.verifiedEntries} verified
                        </span>
                      </div>
                    </div>
                    {currentWaitlist === waitlist.id && (
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
