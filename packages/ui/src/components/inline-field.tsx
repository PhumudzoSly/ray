"use client";

import { useState, ReactNode, useRef, useEffect } from "react";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";
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
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

interface InlineEditFieldProps {
  value: string | number;
  displayValue?: ReactNode;
  onSave: (value: string) => Promise<any>;
  type?: "text" | "select";
  options?: { label: string; value: string }[];
  className?: string;
  disabled?: boolean;
}

export function InlineEditField({
  value,
  displayValue,
  onSave,
  type = "text",
  options = [],
  className,
  disabled = false,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current && type === "text") {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (inputValue === value.toString()) {
      setIsEditing(false);
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(inputValue);
      setIsEditing(false);
      setOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      setInputValue(value.toString()); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setInputValue(value.toString());
      setIsEditing(false);
      setOpen(false);
    }
  };

  if (!isEditing && type === "text") {
    return (
      <div
        className={cn(
          "h-auto font-normal border border-dashed line-clamp-1 hover:cursor-text hover:bg-muted/50 px-2 py-0.5 -mx-2 rounded",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {displayValue ?? value}
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-0 font-normal hover:bg-transparent data-[state=open]:bg-muted/50",
                disabled && "cursor-not-allowed opacity-50",
                className
              )}
              onClick={() => !disabled && setOpen(true)}
            >
              {displayValue ?? value}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]" align="start">
            <Command>
              <CommandInput placeholder="Search..." className="h-9" />
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={async (value) => {
                      setOpen(false); // Close immediately
                      const oldValue = inputValue;
                      setInputValue(value);
                      setIsLoading(true);
                      try {
                        await onSave(value);
                      } catch (error) {
                        console.error("Error saving:", error);
                        setInputValue(oldValue); // Reset on error
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-8 px-2", className)}
        disabled={isLoading}
      />
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
}
