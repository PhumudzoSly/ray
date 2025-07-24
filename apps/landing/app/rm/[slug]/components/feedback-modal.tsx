"use client";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  feedbackContent: string;
  setFeedbackContent: (content: string) => void;
  handleSubmitFeedback: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  itemTitle,
  feedbackContent,
  setFeedbackContent,
  handleSubmitFeedback,
}: FeedbackModalProps) {
  const handleSubmit = () => {
    if (!feedbackContent.trim()) return;

    // Submit feedback - sentiment will be analyzed in the background
    handleSubmitFeedback();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your feedback</label>
            <Textarea
              placeholder="Share your thoughts on this feature..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              className="min-h-[100px]"
              rows={4}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!feedbackContent.trim()}>
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
