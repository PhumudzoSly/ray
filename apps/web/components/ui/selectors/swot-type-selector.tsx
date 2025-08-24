"use client";

import { useId, useState } from "react";
import { CheckIcon, Target, TrendingUp, Shield, AlertTriangle } from "lucide-react";
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

export interface SwotTypeSelectorProps {
  swotType: SwotType;
  onChange?: (swotType: SwotType) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export type SwotType = "Strength" | "Weakness" | "Opportunity" | "Threat";

const swotTypeConfig = {
  Strength: {
    label: "Strength",
    icon: Shield,
    colorClass: "text-green-600 dark:text-green-400",
  },
  Weakness: {
    label: "Weakness",
    icon: AlertTriangle,
    colorClass: "text-red-600 dark:text-red-400",
  },
  Opportunity: {
    label: "Opportunity",
    icon: TrendingUp,
    colorClass: "text-blue-600 dark:text-blue-400",
  },
  Threat: {
    label: "Threat",
    icon: Target,
    colorClass: "text-orange-600 dark:text-orange-400",
  },
} as const;

const swotTypes = Object.entries(swotTypeConfig).map(([key, config]) => ({
  id: key as SwotType,
  name: config.label,
  colorClass: config.colorClass,
  icon: config.icon,
}));

export function SwotTypeSelector({
  swotType,
  onChange,
  disabled = false,
  iconOnly = false,
}: SwotTypeSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<SwotType>(swotType);

  const handleSwotTypeChange = (selectedType: SwotType) => {
    setValue(selectedType);
    setOpen(false);
    onChange?.(selectedType);
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
              const selectedItem = swotTypes.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className={cn("size-4", selectedItem.colorClass)} />;
              }
              return null;
            })()}
            {iconOnly ? null : (
              <span>
                {value
                  ? swotTypes.find((p) => p.id === value)?.name
                  : "Select Type"}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Select SWOT type..." />
            <CommandList>
              <CommandEmpty>No SWOT type found.</CommandEmpty>
              <CommandGroup>
                {swotTypes.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSwotTypeChange(item.id)}
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
