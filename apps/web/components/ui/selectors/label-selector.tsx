"use client";

import { useId, useState } from "react";
import { CheckIcon, TagIcon } from "lucide-react";
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
import { LabelInterface, labels } from "@/utils/constants/issues/labels";

interface LabelSelectorProps {
  selectedLabel?: LabelInterface;
  onChange: (label: LabelInterface) => void;
}

export function LabelSelector({ selectedLabel, onChange }: LabelSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleLabelSelect = (label: LabelInterface) => {
    onChange(label);
    setOpen(false);
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className={cn(
              "flex items-center justify-center gap-1.5",
              !selectedLabel && "size-7"
            )}
            size={selectedLabel ? "sm" : "icon"}
            variant="secondary"
            role="combobox"
            aria-expanded={open}
          >
            <TagIcon className="size-4" />
            {selectedLabel ? (
              <div className="flex items-center gap-1.5">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: selectedLabel.color }}
                />
                <span className="text-sm font-medium">
                  {selectedLabel.name}
                </span>
              </div>
            ) : (
              <span className="sr-only">Select label</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search labels..." />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {labels.map((label) => {
                  const isSelected = selectedLabel?.id === label.id;
                  return (
                    <CommandItem
                      key={label.id}
                      value={label.id}
                      onSelect={() => handleLabelSelect(label)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-3 rounded-full`}
                          style={{ backgroundColor: label.color }}
                        />
                        <span>{label.name}</span>
                      </div>
                      {isSelected && (
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
