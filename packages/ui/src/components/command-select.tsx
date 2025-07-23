"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Circle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
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
import { Button } from "@workspace/ui/components/button";

export type CommandSelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
  disabled?: boolean;
};

export type CommandSelectProps = {
  options: CommandSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  variant?: "default" | "status" | "priority" | "outline-solid" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  popoverClassName?: string;
  align?: "center" | "start" | "end";
  sideOffset?: number;
  showSearch?: boolean;
  groupLabel?: string;
  clearable?: boolean;
  onClear?: () => void;
  isPending?: boolean;
  iconOnly?: boolean;
};

export function CommandSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select value",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  variant = "default",
  size = "default",
  className,
  popoverClassName,
  align = "start",
  sideOffset = 4,
  showSearch = true,
  groupLabel,
  clearable = false,
  onClear,
  isPending = false,
  iconOnly = false,
}: CommandSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      onValueChange?.(currentValue);
      setOpen(false);
    },
    [onValueChange]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear?.();
    },
    [onClear]
  );

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size={"xs"}
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex items-center justify-center max-w-[200px]"
          >
            {selectedOption ? (
              <div className="flex items-center gap-1.5 truncate">
                {selectedOption.icon && (
                  <span className="shrink-0">{selectedOption.icon}</span>
                )}
                {!iconOnly && (
                  <span
                    className={cn(
                      "truncate text-sm",
                      variant === "status" &&
                        selectedOption.color &&
                        "px-1.5 py-0.5 rounded",
                      selectedOption.color
                    )}
                  >
                    {selectedOption.label}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {placeholder}
              </span>
            )}
            {!iconOnly && (
              <div className="flex items-center">
                {clearable && selectedOption && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-50 hover:opacity-100 hover:bg-transparent"
                    onClick={handleClear}
                  >
                    <span className="sr-only">Clear</span>
                    <Circle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 shadow-md border border-muted-foreground/10",
            popoverClassName
          )}
          align={align}
          sideOffset={sideOffset}
        >
          <Command className="w-full overflow-hidden rounded-md">
            {showSearch && (
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-9 border-0 border-b border-muted-foreground/10 focus-visible:ring-0 px-3"
              />
            )}

            <CommandList className="max-h-[310px] overflow-auto py-1">
              <CommandEmpty className="py-3 text-sm text-center text-muted-foreground">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup heading={groupLabel} className="px-1">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={handleSelect}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 mx-1 rounded-sm text-sm aria-selected:bg-muted/50 data-[selected=true]:bg-muted/50",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span
                      className={cn(
                        "flex-1 truncate",
                        variant === "status" &&
                          option.color &&
                          "px-1.5 py-0.5 rounded",
                        option.color
                      )}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground/70">
                        {option.description}
                      </span>
                    )}
                    {value === option.value && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 opacity-80" />
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
