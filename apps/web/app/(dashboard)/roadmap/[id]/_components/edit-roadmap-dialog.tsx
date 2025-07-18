"use client";

import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { updatePublicRoadmap } from "@/actions/roadmap";

interface EditRoadmapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  token: string;
  roadmap?: {
    name: string;
    slug: string;
    description: string;
    isPublic: boolean;
    customDomain?: string;
    theme?: string;
    allowVoting: boolean;
    allowFeedback: boolean;
    showChangelog: boolean;
  };
}

export function EditRoadmapDialog({
  isOpen,
  onClose,
  roadmapId,
  token,
  roadmap,
}: EditRoadmapDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isPublic: true,
    customDomain: "",
    theme: "default",
    allowVoting: true,
    allowFeedback: true,
    showChangelog: true,
  });

  // Initialize form data when roadmap is loaded
  useEffect(() => {
    if (roadmap) {
      setFormData({
        name: roadmap.name,
        slug: roadmap.slug,
        description: roadmap.description,
        isPublic: roadmap.isPublic,
        customDomain: roadmap.customDomain || "",
        theme: roadmap.theme || "default",
        allowVoting: roadmap.allowVoting,
        allowFeedback: roadmap.allowFeedback,
        showChangelog: roadmap.showChangelog,
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
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        isPublic: formData.isPublic,
        customDomain: formData.customDomain || undefined,
        theme: formData.theme,
        allowVoting: formData.allowVoting,
        allowFeedback: formData.allowFeedback,
        showChangelog: formData.showChangelog,
      });

      if (result.success) {
        toast.success("Roadmap updated successfully!");
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

          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
            <Input
              id="customDomain"
              value={formData.customDomain}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customDomain: e.target.value,
                })
              }
              placeholder="roadmap.yourdomain.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) =>
                setFormData({ ...formData, theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
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

            <div className="flex items-center space-x-2">
              <Switch
                id="showChangelog"
                checked={formData.showChangelog}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    showChangelog: checked,
                  })
                }
              />
              <Label htmlFor="showChangelog">Show Changelog</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
