"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface InlineEditTextAreaProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEditTextArea({
  value,
  onSave,
  className,
  placeholder,
  disabled = false,
}: InlineEditTextAreaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (inputValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(inputValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        className={cn(
          "min-h-[40px] p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line rounded-md hover:bg-muted/50 bg-muted/60 transition-colors cursor-text",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {value || placeholder}
      </div>
    );
  }

  return (
    <div>
      <Textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="min-h-[100px] border border-dashed"
        placeholder={placeholder}
        disabled={isLoading}
      />
      <div className="flex items-center p-2 gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setInputValue(value);
            setIsEditing(false);
          }}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
