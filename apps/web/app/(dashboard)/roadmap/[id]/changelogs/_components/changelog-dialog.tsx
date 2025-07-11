"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import { Id } from "@workspace/backend";
import { DateSelector } from "@workspace/ui/components/selectors";

interface ChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: Id<"publicRoadmaps">;
  token: string;
}

export function ChangelogDialog({
  isOpen,
  onClose,
  roadmapId,
  token,
}: ChangelogDialogProps) {
  //

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    publishDate: new Date(),
    isPublished: false,
  });

  const createChangelog = useMutation(api.roadmap.changelog.createChangelog);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      publishDate: new Date(),
      isPublished: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const publishDate = formData.publishDate
        ? new Date(formData.publishDate).getTime()
        : Date.now();

      await createChangelog({
        roadmapId,
        title: formData.title,
        description: formData.description,
        items: [], // Will be populated later
        publishDate,
        isPublished: formData.isPublished,
        token,
      });

      toast.success("Changelog created successfully!");
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Failed to create changelog");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Changelog</DialogTitle>
          <DialogDescription>
            Create a new changelog entry for your roadmap
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="June 2025 Updates"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe the changes in this release"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <DateSelector
                value={formData.publishDate}
                onChange={(date) =>
                  setFormData({ ...formData, publishDate: date })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Changelog</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
