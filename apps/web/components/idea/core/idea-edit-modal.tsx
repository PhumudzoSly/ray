"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import UpdateIdea from "./edit-idea";

interface IdeaEditModalProps {
  id: string;
  idea: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const IdeaEditModal = ({
  id,
  idea,
  isOpen,
  onOpenChange,
  onSuccess,
}: IdeaEditModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edit Idea: {idea?.name}</DialogTitle>
          <DialogDescription>
            Make changes to your idea details below
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <UpdateIdea
            id={id}
            idea={idea}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaEditModal;
