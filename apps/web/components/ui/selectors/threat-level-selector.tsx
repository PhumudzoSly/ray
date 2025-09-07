"use client";

import { useId, useState, useEffect } from "react";
import {
  CheckIcon,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Minus,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface ThreatLevelSelectorProps {
  threatLevel: ThreatLevel;
  onChange?: (threatLevel: ThreatLevel) => void | Promise<void>;
  disabled?: boolean;
  iconOnly?: boolean;
}

export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const threatLevelConfig = {
  LOW: {
    label: "Low threat",
    colorClass: "text-green-600 dark:text-green-400",
    icon: Minus,
  },
  MEDIUM: {
    label: "Medium threat",
    colorClass: "text-yellow-600 dark:text-yellow-400",
    icon: AlertCircle,
  },
  HIGH: {
    label: "High threat",
    colorClass: "text-orange-600 dark:text-orange-400",
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: "Critical threat",
    colorClass: "text-red-600 dark:text-red-400",
    icon: AlertOctagon,
  },
} as const;

const threatLevels = Object.entries(threatLevelConfig).map(([key, config]) => ({
  id: key as ThreatLevel,
  name: config.label,
  colorClass: config.colorClass,
  icon: config.icon,
}));

export function ThreatLevelSelector({
  threatLevel,
  onChange,
  disabled = false,
  iconOnly = false,
}: ThreatLevelSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<ThreatLevel>(threatLevel);

  // Sync with external prop changes
  useEffect(() => {
    setValue(threatLevel);
  }, [threatLevel]);

  const handleThreatLevelChange = async (selectedThreatLevel: ThreatLevel) => {
    setValue(selectedThreatLevel);
    setOpen(false);
    if (onChange) {
      await onChange(selectedThreatLevel);
    }
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
              const selectedItem = threatLevels.find(
                (item) => item.id === value
              );
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return (
                  <Icon className={cn("size-4", selectedItem.colorClass)} />
                );
              }
              return null;
            })()}
            {iconOnly ? null : (
              <span>
                {value
                  ? threatLevels.find((item) => item.id === value)?.name
                  : "Select threat level"}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search threat level..." />
            <CommandList>
              <CommandEmpty>No threat level found.</CommandEmpty>
              <CommandGroup>
                {threatLevels.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleThreatLevelChange(item.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={cn("size-4", item.colorClass)} />
                      {item.name}
                    </div>
                    {value === item.id && (
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
