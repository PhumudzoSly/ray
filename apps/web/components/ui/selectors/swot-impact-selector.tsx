"use client";

import { useId, useState } from "react";
import { CheckIcon, ArrowDown, Minus, ArrowUp, AlertCircle } from "lucide-react";
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

export interface SwotImpactSelectorProps {
  impact: Importance;
  onChange?: (impact: Importance) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const impactConfig = {
  LOW: {
    label: "Low",
    colorClass: "text-muted-foreground",
    icon: ArrowDown,
  },
  MEDIUM: {
    label: "Medium",
    colorClass: "text-yellow-600 dark:text-yellow-400",
    icon: Minus,
  },
  HIGH: {
    label: "High",
    colorClass: "text-orange-600 dark:text-orange-400",
    icon: ArrowUp,
  },
  CRITICAL: {
    label: "Critical",
    colorClass: "text-red-600 dark:text-red-400",
    icon: AlertCircle,
  },
} as const;

const swotImpacts = Object.entries(impactConfig).map(([key, config]) => ({
  id: key as Importance,
  name: config.label,
  colorClass: config.colorClass,
  icon: config.icon,
}));

export function SwotImpactSelector({
  impact,
  onChange,
  disabled = false,
  iconOnly = false,
}: SwotImpactSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Importance>(impact);

  const handleImpactChange = (selectedImpact: Importance) => {
    setValue(selectedImpact);
    setOpen(false);
    onChange?.(selectedImpact);
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
              const selectedItem = swotImpacts.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className={cn("size-4", selectedItem.colorClass)} />;
              }
              return null;
            })()}
            {iconOnly ? null : (
              <span>
                {value
                  ? swotImpacts.find((p) => p.id === value)?.name
                  : "Select Impact"}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Select SWOT impact..." />
            <CommandList>
              <CommandEmpty>No SWOT impact found.</CommandEmpty>
              <CommandGroup>
                {swotImpacts.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleImpactChange(item.id)}
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
