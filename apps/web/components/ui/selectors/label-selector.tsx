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
import { LabelInterface, labels } from "@/utils/constants/issues/labels";

interface LabelSelectorProps {
  selectedLabel?: any;
  onChange?: (label: any) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

export function LabelSelector({
  selectedLabel,
  onChange,
  disabled,
  iconOnly,
}: LabelSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleLabelSelect = (label: LabelInterface) => {
    onChange?.(label);
    setOpen(false);
  };

  // Helper function to get the selected label ID
  const getSelectedLabelId = () => {
    if (typeof selectedLabel === "string") {
      return selectedLabel;
    }
    if (
      selectedLabel &&
      typeof selectedLabel === "object" &&
      "id" in selectedLabel
    ) {
      return selectedLabel.id;
    }
    return null;
  };

  const selectedLabelId = getSelectedLabelId();

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
              const selectedItem = labels.find(
                (item) => item.id === selectedLabelId
              );
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className={`size-4 ${selectedItem.colorClass}`} />;
              }
              return null;
            })()}
            {iconOnly ? null : (
              <span>
                {selectedLabelId
                  ? labels.find((p) => p.id === selectedLabelId)?.name
                  : "No label"}
              </span>
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
                  const isSelected = selectedLabelId === label.id;
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
