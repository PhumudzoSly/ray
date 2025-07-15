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
import { status as allStatus } from "@/utils/constants/issues/status";

interface StatusSelectorProps {
  status: string;
  onChange?: (status: string) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function StatusSelector({
  status,
  onChange,
  disabled,
  iconOnly,
}: StatusSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(status);

  // Filter out "DONE" option when disabled (blocked by dependencies)
  const availableStatuses = disabled
    ? allStatus.filter((s) => s.id !== "DONE")
    : allStatus;

  const handleStatusChange = (statusId: string) => {
    setValue(statusId);
    setOpen(false);
    onChange?.(statusId);
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            disabled={disabled}
            className="flex items-center justify-center"
            size="xs"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
          >
            {(() => {
              const selectedItem = allStatus.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className={`size-4 ${selectedItem.colorClass}`} />;
              }
              return (
                <div className="size-4 rounded-full border border-dashed border-muted-foreground/30" />
              );
            })()}
            {iconOnly ? null : (
              <span
                className={!value && !iconOnly ? "text-muted-foreground" : ""}
              >
                {value
                  ? allStatus.find((s) => s.id === value)?.name
                  : "Set status..."}
              </span>
            )}
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
                {availableStatuses.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleStatusChange(item.id)}
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
