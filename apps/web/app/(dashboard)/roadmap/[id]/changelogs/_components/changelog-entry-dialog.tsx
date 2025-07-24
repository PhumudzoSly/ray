"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  updateRoadmapChangelog,
  getAvailableItemsForChangelog,
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
import { CommandSelect } from "@workspace/ui/components/command-select";
import { PrioritySelector } from "@/components/ui/selectors/priority-selector";
import { toast } from "sonner";
import { FeatureSelector } from "@/components/ui/selectors/feature-selector";
import { IssueSelector } from "@/components/ui/selectors/issue-selector";
import {
  Sparkles,
  Bug,
  TrendingUp,
  AlertTriangle,
  Shield,
  AlertCircle,
  FileText,
  Zap,
} from "lucide-react";

interface ChangelogEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: any;
  roadmapId: string;
  projectId: string;
}

const CHANGELOG_ENTRY_TYPES = [
  {
    value: "FEATURE",
    label: "Feature",
    icon: Sparkles,
    color: "text-blue-500",
  },
  { value: "FIX", label: "Fix", icon: Bug, color: "text-green-500" },
  {
    value: "IMPROVEMENT",
    label: "Improvement",
    icon: TrendingUp,
    color: "text-purple-500",
  },
  {
    value: "BREAKING",
    label: "Breaking Change",
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    value: "SECURITY",
    label: "Security",
    icon: Shield,
    color: "text-orange-500",
  },
  {
    value: "DEPRECATION",
    label: "Deprecation",
    icon: AlertCircle,
    color: "text-yellow-500",
  },
  {
    value: "DOCUMENTATION",
    label: "Documentation",
    icon: FileText,
    color: "text-gray-500",
  },
  {
    value: "PERFORMANCE",
    label: "Performance",
    icon: Zap,
    color: "text-indigo-500",
  },
];

export function ChangelogEntryDialog({
  isOpen,
  onClose,
  changelog,
  roadmapId,
  projectId,
}: ChangelogEntryDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: "FEATURE",
    title: "",
    description: "",
    issueId: "",
    featureId: "",
    priority: "",
    category: "",
    breaking: false,
  });

  // Fetch available issues and features
  const { data: availableItems } = useQuery({
    queryKey: ["availableItemsForChangelog", roadmapId],
    queryFn: () => getAvailableItemsForChangelog(roadmapId),
    select: (res) => (res?.success ? res.data : { issues: [], features: [] }),
    enabled: isOpen,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      const currentEntries = changelog.entries || [];
      const newEntries = [...currentEntries, entryData];

      return updateRoadmapChangelog(changelog.id, {
        entries: newEntries,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Entry added successfully!");
        resetForm();
        onClose();
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to add entry");
      }
    },
    onError: (error) => {
      toast.error("Failed to add entry");
      console.error("Add entry error:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      type: "FEATURE",
      title: "",
      description: "",
      issueId: "",
      featureId: "",
      priority: "",
      category: "",
      breaking: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Entry title is required");
      return;
    }

    const entryData = {
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      issueId: formData.issueId || undefined,
      featureId: formData.featureId || undefined,
      priority: formData.priority || undefined,
      category: formData.category || undefined,
      breaking: formData.breaking,
    };

    addEntryMutation.mutate(entryData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Changelog Entry</DialogTitle>
          <DialogDescription>
            Add a new entry to "{changelog?.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Brief description of the change"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional details"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <CommandSelect
              options={CHANGELOG_ENTRY_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
                icon: <type.icon className={`h-4 w-4 ${type.color}`} />,
              }))}
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              placeholder="Select type"
              searchPlaceholder="Search types..."
              emptyMessage="No types found."
            />
            <PrioritySelector
              priority={formData.priority}
              onChange={(priority) => setFormData({ ...formData, priority })}
            />
            <IssueSelector
              projectId={projectId}
              onValueChange={(issue) =>
                setFormData({ ...formData, issueId: issue || "" })
              }
              onChange={(issue) => {
                setFormData({
                  ...formData,
                  issueId: issue || "",
                });
              }}
              value={formData.issueId}
            />
            <FeatureSelector
              projectId={projectId}
              onChange={(feature) =>
                setFormData({ ...formData, featureId: feature || "" })
              }
              value={formData.featureId}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="breaking"
              checked={formData.breaking}
              onChange={(e) =>
                setFormData({ ...formData, breaking: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="breaking" className="text-sm">
              Breaking change
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addEntryMutation.isPending}>
            {addEntryMutation.isPending ? "Adding..." : "Add Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
