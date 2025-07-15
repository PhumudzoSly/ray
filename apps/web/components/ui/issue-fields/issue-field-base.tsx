"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface IssueFieldOption {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  description?: string;
  disabled?: boolean;
}

interface IssueFieldBaseProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  options: IssueFieldOption[];
  displayValue?: React.ReactNode;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  errorMessage?: string;
  align?: "start" | "center" | "end";
  loadingData?: boolean;
}

export function IssueFieldBase({
  value,
  onSave,
  options,
  displayValue,
  className,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  errorMessage = "Failed to update field",
  align = "start",
  loadingData,
}: IssueFieldBaseProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSelect = React.useCallback(
    async (currentValue: string) => {
      if (currentValue === value) {
        setOpen(false);
        return;
      }

      // Check if the selected option is disabled
      const selectedOption = options.find((opt) => opt.id === currentValue);
      if (selectedOption?.disabled) {
        return; // Don't proceed with selection
      }

      setIsLoading(true);
      setOpen(false);

      try {
        await onSave(currentValue);
      } catch (error) {
        toast.error(errorMessage);
        setOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [value, onSave, errorMessage, options]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto w-full justify-start hover:bg-transparent px-0 font-normal",
            "opacity-100 hover:opacity-70 transition-opacity",
            isLoading && "opacity-50 cursor-progress",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={isLoading || disabled || loadingData}
        >
          {isLoading || loadingData ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            displayValue || placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align={align}
        side="bottom"
        sideOffset={8}
      >
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandEmpty className="py-2 text-sm">{emptyText}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => handleSelect(option.id)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer py-1.5",
                    option.id === value && "aria-selected:bg-accent",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={option.disabled}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {Icon && (
                      <Icon className={cn("h-3.5 w-3.5", option.colorClass)} />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{option.name}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {option.id === value && (
                    <Check
                      className={cn("h-3.5 w-3.5 ml-auto", option.colorClass)}
                    />
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
