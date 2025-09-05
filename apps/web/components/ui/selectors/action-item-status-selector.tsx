"use client";

import { useState } from "react";
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
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { actionItemStatus } from "@/utils/constants/action-items/status";
import { ActionItemStatus } from "@workspace/backend/prisma/generated/client/client";

interface ActionItemStatusSelectorProps {
  status: ActionItemStatus;
  onChange?: (status: ActionItemStatus) => void;
  disabled?: boolean;
}

export function ActionItemStatusSelector({
  status,
  onChange,
  disabled = false,
}: ActionItemStatusSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedStatus = actionItemStatus.find((s) => s.id === status);

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            className="flex items-center justify-center"
            size="xs"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
          >
            {(() => {
              const selectedItem = actionItemStatus.find(
                (item) => item.id === selectedStatus?.id
              );
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className={`size-4 ${selectedItem.colorClass}`} />;
              }
              return (
                <div className="size-4 rounded-full border border-dashed border-muted-foreground/30" />
              );
            })()}

            <span>{selectedStatus?.name || "Set status..."}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Set status..." />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {actionItemStatus.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => {
                      onChange?.(item.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={item.colorClass} />
                      {item.name}
                    </div>
                    {selectedStatus?.id === item.id && (
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
