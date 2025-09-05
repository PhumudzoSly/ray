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
import { actionItemPriority } from "@/utils/constants/action-items/status";
import { Importance } from "@workspace/backend/prisma/generated/client/client";
import { cn } from "@/lib/utils";

interface ActionItemPrioritySelectorProps {
  priority: Importance;
  onChange?: (priority: Importance) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function ActionItemPrioritySelector({
  priority,
  onChange,
  disabled = false,
  iconOnly = false,
}: ActionItemPrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priority);

  const handlePriorityChange = (priorityId: string) => {
    setValue(priorityId);
    setOpen(false);
    onChange?.(priorityId as Importance);
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center h-6 px-2"
            size="xs"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
          >
            {(() => {
              const selectedItem = actionItemPriority.find(
                (item) => item.id === value
              );
              if (selectedItem) {
                return (
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mr-1",
                      // Convert color classes to background classes
                      selectedItem.id === "LOW"
                        ? "bg-gray-400"
                        : selectedItem.id === "MEDIUM"
                          ? "bg-yellow-500"
                          : selectedItem.id === "HIGH"
                            ? "bg-orange-500"
                            : selectedItem.id === "CRITICAL"
                              ? "bg-red-500"
                              : "bg-gray-400"
                    )}
                  />
                );
              }
              return null;
            })()}
            {iconOnly ? null : (
              <span className="text-xs">
                {value
                  ? actionItemPriority.find((p) => p.id === value)?.name
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
                {actionItemPriority.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handlePriorityChange(item.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          item.id === "LOW"
                            ? "bg-gray-400"
                            : item.id === "MEDIUM"
                              ? "bg-yellow-500"
                              : item.id === "HIGH"
                                ? "bg-orange-500"
                                : item.id === "CRITICAL"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                        )}
                      />
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
