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
import { featureRequestPriorities } from "@/utils/constants/feature-requests/priority";

interface FeatureRequestPrioritySelectorProps {
  priority: string;
  onChange?: (priority: string) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function FeatureRequestPrioritySelector({
  priority,
  onChange,
  disabled = false,
  iconOnly = false,
}: FeatureRequestPrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priority);

  const handlePriorityChange = (priorityId: string) => {
    setValue(priorityId);
    setOpen(false);
    onChange?.(priorityId);
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
              const selectedItem = featureRequestPriorities.find(
                (item) => item.id === value
              );
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className={`size-4 ${selectedItem.colorClass}`} />;
              }
              return null;
            })()}
            {iconOnly ? null : (
              <span>
                {value
                  ? featureRequestPriorities.find((p) => p.id === value)?.name
                  : "No priority"}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Set priority..." />
            <CommandList>
              <CommandEmpty>No priority found.</CommandEmpty>
              <CommandGroup>
                {featureRequestPriorities.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handlePriorityChange(item.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={item.colorClass} />
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
