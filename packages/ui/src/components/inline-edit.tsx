"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Edit2, Save, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  isTextArea?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  isTextArea = false,
  placeholder = "Enter value...",
  className,
  inputClassName,
  disabled = false,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (!editValue.trim()) return;
    setIsPending(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsPending(false);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-2 border border-dashed", className)}>
        {isTextArea ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className={cn("min-h-[100px]", inputClassName)}
            disabled={isPending}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className={inputClassName}
            disabled={isPending}
          />
        )}
        <div className="flex justify-end space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setEditValue(value);
            }}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!editValue.trim() || isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className={cn("flex-1", inputClassName)}>
        {value || (
          <span className="italic text-muted-foreground">{placeholder}</span>
        )}
      </div>
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
