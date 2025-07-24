"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRoadmapChangelog,
  updateRoadmapChangelog,
} from "@/actions/roadmap/changelogs";
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
import { DateSelector } from "@/components/ui/selectors";

interface ChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  editingChangelog?: any;
}

export function ChangelogDialog({
  isOpen,
  onClose,
  roadmapId,
  editingChangelog,
}: ChangelogDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingChangelog;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    version: "",
    publishDate: new Date(),
    isPublished: false,
  });

  // Initialize form with editing data
  useEffect(() => {
    if (editingChangelog) {
      setFormData({
        title: editingChangelog.title || "",
        description: editingChangelog.description || "",
        version: editingChangelog.version || "",
        publishDate: new Date(editingChangelog.publishDate),
        isPublished: editingChangelog.isPublished || false,
      });
    } else {
      resetForm();
    }
  }, [editingChangelog, isOpen]);

  const createChangelogMutation = useMutation({
    mutationFn: async (data: {
      roadmapId: string;
      title: string;
      description: string;
      version: string;
      publishDate: Date;
      isPublished: boolean;
    }) => {
      return createRoadmapChangelog(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog created successfully!");
        resetForm();
        onClose();
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to create changelog");
      }
    },
    onError: (error) => {
      toast.error("Failed to create changelog");
      console.error("Changelog creation error:", error);
    },
  });

  const updateChangelogMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      description: string;
      version: string;
      publishDate: Date;
      isPublished: boolean;
    }) => {
      return updateRoadmapChangelog(data.id, {
        title: data.title,
        description: data.description,
        version: data.version,
        publishDate: data.publishDate,
        isPublished: data.isPublished,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog updated successfully!");
        resetForm();
        onClose();
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to update changelog");
      }
    },
    onError: (error) => {
      toast.error("Failed to update changelog");
      console.error("Changelog update error:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      version: "",
      publishDate: new Date(),
      isPublished: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const publishDate = formData.publishDate
      ? new Date(formData.publishDate).getTime()
      : Date.now();

    const submitData = {
      title: formData.title,
      description: formData.description,
      version: formData.version,
      publishDate: new Date(publishDate),
      isPublished: formData.isPublished,
    };

    if (isEditing && editingChangelog) {
      updateChangelogMutation.mutate({
        id: editingChangelog.id,
        ...submitData,
      });
    } else {
      createChangelogMutation.mutate({
        roadmapId,
        ...submitData,
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isLoading =
    createChangelogMutation.isPending || updateChangelogMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Changelog" : "Create Changelog"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your changelog details"
              : "Create a new changelog entry for your roadmap"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="1.2.0"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <DateSelector
                value={formData.publishDate}
                onChange={(date) =>
                  setFormData({ ...formData, publishDate: date || new Date() })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Changelog"
                : "Create Changelog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
