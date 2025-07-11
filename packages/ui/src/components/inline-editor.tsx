"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Save, X } from "lucide-react";

interface InlineEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  minimalUI?: boolean;
  autoFocus?: boolean;
}

export function InlineEditor({
  initialContent,
  onSave,
  onCancel,
  placeholder = "Add content...",
  className,
  minimalUI = true,
  autoFocus = false,
}: InlineEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleSave = () => {
    onSave(content);
    setIsFocused(false);
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  return (
    <div
      className={cn(
        "rounded-md transition-all duration-200",
        isFocused
          ? "border border-input shadow-xs"
          : "border border-transparent",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none bg-transparent focus:outline-hidden p-2",
          "min-h-[100px] text-sm",
          !content && !isFocused && "text-muted-foreground italic"
        )}
      />

      {isFocused && !minimalUI && (
        <div className="flex justify-end gap-2 p-2 border-t">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
