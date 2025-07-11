"use client";

import { useId, useState } from "react";
import { CheckIcon } from "lucide-react";
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
import { Badge } from "@workspace/ui/components/badge";

const phases = [
  { id: "DISCOVERY", name: "Discovery", color: "bg-purple-500" },
  { id: "PLANNING", name: "Planning", color: "bg-blue-500" },
  { id: "DEVELOPMENT", name: "Development", color: "bg-yellow-500" },
  { id: "TESTING", name: "Testing", color: "bg-orange-500" },
  { id: "RELEASE", name: "Release", color: "bg-green-500" },
  { id: "LIVE", name: "Live", color: "bg-emerald-500" },
  { id: "DEPRECATED", name: "Deprecated", color: "bg-gray-500" },
];

interface PhaseSelectorProps {
  phase: string;
  onChange?: (phase: string) => void;
  blockedPhases?: string[];
  onBlockedPhaseAttempt?: (phase: string, blockers: string[]) => void;
  disabled?: boolean;
}

export function PhaseSelector({
  phase,
  onChange,
  blockedPhases = [],
  onBlockedPhaseAttempt,
  disabled = false,
}: PhaseSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(phase);

  const handlePhaseChange = (phaseId: string) => {
    if (blockedPhases.includes(phaseId)) {
      onBlockedPhaseAttempt?.(phaseId, blockedPhases);
      return;
    }
    setValue(phaseId);
    setOpen(false);
    onChange?.(phaseId);
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center"
            size="xs"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
          >
            {(() => {
              const selectedItem = phases.find((item) => item.id === value);
              if (selectedItem) {
                return (
                  <div
                    className={`w-2 h-2 rounded-full ${selectedItem.color}`}
                  />
                );
              }
              return null;
            })()}
            <span>
              {value ? phases.find((p) => p.id === value)?.name : "No phase"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Set phase..." />
            <CommandList>
              <CommandEmpty>No phase found.</CommandEmpty>
              <CommandGroup>
                {phases.map((item) => {
                  const isBlocked = blockedPhases.includes(item.id);
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handlePhaseChange(item.id)}
                      className={`flex items-center justify-between ${
                        isBlocked ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isBlocked}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        {item.name}
                        {isBlocked && (
                          <span className="text-xs text-red-500">
                            (Blocked)
                          </span>
                        )}
                      </div>
                      {value === item.id && (
                        <CheckIcon size={16} className="ml-auto" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function getPhaseBadge(phase: string) {
  const phaseData = phases.find((p) => p.id === phase);
  if (!phaseData) return null;

  const colorClasses = {
    "bg-purple-500":
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "bg-blue-500":
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "bg-yellow-500":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "bg-orange-500":
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "bg-green-500":
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "bg-emerald-500":
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    "bg-gray-500":
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <Badge
      variant="secondary"
      className={`${colorClasses[phaseData.color as keyof typeof colorClasses]} text-xs`}
    >
      {phaseData.name}
    </Badge>
  );
}
