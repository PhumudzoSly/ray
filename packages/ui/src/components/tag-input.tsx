"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "outline";
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  maxTags = 10,
  className,
  disabled = false,
  variant = "default",
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = React.useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();
      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
        onTagsChange([...tags, trimmedTag]);
        setInputValue("");
      }
    },
    [tags, onTagsChange, maxTags]
  );

  const removeTag = React.useCallback(
    (tagToRemove: string) => {
      onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onTagsChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    },
    [inputValue, addTag, removeTag, tags]
  );

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  }, [inputValue, addTag]);

  const containerClasses = cn(
    "flex flex-wrap gap-2 min-h-[40px] px-3 py-2 rounded-md border transition-colors",
    variant === "outline"
      ? "border-muted-foreground/20 bg-transparent"
      : "border-input bg-background",
    isFocused && "ring-2 ring-ring ring-offset-2",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <div
      className={containerClasses}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-medium",
            "bg-muted/50 text-muted-foreground border border-muted-foreground/20",
            "hover:bg-muted/70 transition-colors"
          )}
        >
          <span className="truncate max-w-[120px]">{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </Badge>
      ))}

      {tags.length < maxTags && (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={cn(
            "flex-1 min-w-[120px] border-0 p-0 h-auto text-sm",
            "bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground"
          )}
          disabled={disabled}
        />
      )}

      {tags.length >= maxTags && (
        <span className="text-xs text-muted-foreground self-center">
          Max {maxTags} tags
        </span>
      )}
    </div>
  );
}
