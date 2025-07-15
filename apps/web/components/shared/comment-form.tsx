import React, { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  initialValue = "",
  autoFocus = false,
  disabled = false,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmedContent);
      setContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }

    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  const trimmedContent = content.trim();
  const canSubmit = trimmedContent.length > 0 && !isSubmitting && !disabled;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[80px] resize-none pr-12"
          disabled={disabled || isSubmitting}
        />

        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {content.length}/1000
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Press ⌘+Enter to submit
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-8 px-3"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            className="h-8 px-3"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
            ) : (
              <Send className="h-3 w-3 mr-1" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};
