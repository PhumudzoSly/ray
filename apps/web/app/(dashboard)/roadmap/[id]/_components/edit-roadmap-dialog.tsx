"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

import { toast } from "sonner";
import { updatePublicRoadmap } from "@/actions/roadmap";
import { useSession } from "@/context/session-context";
import { PublicRoadmapOptionalDefaults } from "@workspace/backend";

interface EditRoadmapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  roadmap?: {
    name: string;
    slug: string;
    description: string;
    isPublic: boolean;
    allowVoting: boolean;
    allowFeedback: boolean;
    project: string;
  };
}

export function EditRoadmapDialog({
  isOpen,
  onClose,
  roadmapId,
  roadmap,
}: EditRoadmapDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { org } = useSession();

  const [formData, setFormData] = useState<PublicRoadmapOptionalDefaults>({
    name: "",
    slug: "",
    description: "",
    isPublic: true,
    allowVoting: true,
    allowFeedback: true,
    projectId: "",
  });

  // Initialize form data when roadmap is loaded
  useEffect(() => {
    if (roadmap) {
      setFormData({
        name: roadmap.name,
        slug: roadmap.slug,
        description: roadmap.description,
        isPublic: roadmap.isPublic,
        allowVoting: roadmap.allowVoting,
        allowFeedback: roadmap.allowFeedback,
        projectId: roadmap.project,
      });
    }
  }, [roadmap]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await updatePublicRoadmap(roadmapId, {
        ...formData,
      });

      if (result.success) {
        toast.success("Roadmap updated successfully!");

        // Comprehensive data revalidation
        // Invalidate roadmap-specific queries
        queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
        queryClient.invalidateQueries({ queryKey: ["roadmap", formData.slug] });

        // Invalidate roadmap items and related data
        queryClient.invalidateQueries({
          queryKey: ["roadmapItems", roadmapId],
        });
        queryClient.invalidateQueries({
          queryKey: ["publicRoadmapItems", roadmapId],
        });
        queryClient.invalidateQueries({ queryKey: ["roadmapItem"] });

        // Invalidate changelogs
        queryClient.invalidateQueries({ queryKey: ["changelogs", roadmapId] });
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });

        // Invalidate feature requests
        queryClient.invalidateQueries({
          queryKey: ["featureRequests", roadmapId],
        });

        // Invalidate votes and feedback
        queryClient.invalidateQueries({
          queryKey: ["roadmapVotes", roadmapId],
        });
        queryClient.invalidateQueries({
          queryKey: ["roadmapFeedback", roadmapId],
        });

        // Invalidate all roadmaps list (for the main roadmap page)
        queryClient.invalidateQueries({ queryKey: ["roadmaps", org] });

        // Invalidate project-related queries if roadmap has a project
        queryClient.invalidateQueries({ queryKey: ["projects", org] });

        // Refresh the current route to ensure server-side data is updated
        router.refresh();

        onClose();
      } else {
        toast.error("Failed to update roadmap");
      }
    } catch (error) {
      toast.error("Failed to update roadmap");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Roadmap</DialogTitle>
          <DialogDescription>Update your roadmap settings</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Roadmap Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/roadmap/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value,
                  })
                }
                className="flex-1"
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isPublic: checked,
                  })
                }
              />
              <Label htmlFor="isPublic">Public Roadmap</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allowVoting"
                checked={formData.allowVoting}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    allowVoting: checked,
                  })
                }
              />
              <Label htmlFor="allowVoting">Allow Voting</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allowFeedback"
                checked={formData.allowFeedback}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    allowFeedback: checked,
                  })
                }
              />
              <Label htmlFor="allowFeedback">Allow Feedback</Label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 py-2.5 px-4 w-full border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
