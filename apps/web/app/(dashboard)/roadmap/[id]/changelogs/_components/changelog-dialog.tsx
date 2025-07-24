"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createRoadmapChangelog,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { toast } from "sonner";
import { DateSelector } from "@/components/ui/selectors";
import { Plus, X, Link, ExternalLink } from "lucide-react";

interface ChangelogEntry {
  type: string;
  title: string;
  description?: string;
  issueId?: string;
  featureId?: string;
  priority?: string;
  category?: string;
  breaking?: boolean;
}

interface ChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
}

const CHANGELOG_ENTRY_TYPES = [
  { value: "FEATURE", label: "Feature", color: "bg-green-500" },
  { value: "FIX", label: "Fix", color: "bg-blue-500" },
  { value: "IMPROVEMENT", label: "Improvement", color: "bg-purple-500" },
  { value: "BREAKING", label: "Breaking Change", color: "bg-red-500" },
  { value: "SECURITY", label: "Security", color: "bg-orange-500" },
  { value: "DEPRECATION", label: "Deprecation", color: "bg-yellow-500" },
  { value: "DOCUMENTATION", label: "Documentation", color: "bg-gray-500" },
  { value: "PERFORMANCE", label: "Performance", color: "bg-indigo-500" },
];

export function ChangelogDialog({
  isOpen,
  onClose,
  roadmapId,
}: ChangelogDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    version: "",
    publishDate: new Date(),
    isPublished: false,
  });

  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [newEntry, setNewEntry] = useState<ChangelogEntry>({
    type: "FEATURE",
    title: "",
    description: "",
  });

  // Fetch available issues and features
  const { data: availableItems } = useQuery({
    queryKey: ["availableItemsForChangelog", roadmapId],
    queryFn: () => getAvailableItemsForChangelog(roadmapId),
    select: (res) => (res?.success ? res.data : { issues: [], features: [] }),
    enabled: isOpen,
  });

  const createChangelogMutation = useMutation({
    mutationFn: async (data: {
      roadmapId: string;
      title: string;
      description: string;
      version: string;
      publishDate: Date;
      isPublished: boolean;
      entries: ChangelogEntry[];
    }) => {
      return createRoadmapChangelog(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog created successfully!");
        resetForm();
        onClose();
        // Invalidate and refetch changelogs
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      version: "",
      publishDate: new Date(),
      isPublished: false,
    });
    setEntries([]);
    setNewEntry({
      type: "FEATURE",
      title: "",
      description: "",
    });
  };

  const addEntry = () => {
    if (!newEntry.title.trim()) {
      toast.error("Entry title is required");
      return;
    }
    setEntries([...entries, { ...newEntry }]);
    setNewEntry({
      type: "FEATURE",
      title: "",
      description: "",
    });
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (entries.length === 0) {
      toast.error("Please add at least one changelog entry");
      return;
    }

    const publishDate = formData.publishDate
      ? new Date(formData.publishDate).getTime()
      : Date.now();

    createChangelogMutation.mutate({
      roadmapId,
      title: formData.title,
      description: formData.description,
      version: formData.version,
      publishDate: new Date(publishDate),
      isPublished: formData.isPublished,
      entries,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTypeColor = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find((t) => t.value === type);
    return typeConfig?.color || "bg-gray-500";
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = CHANGELOG_ENTRY_TYPES.find((t) => t.value === type);
    return typeConfig?.label || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Changelog</DialogTitle>
          <DialogDescription>
            Create a new changelog entry for your roadmap with detailed entries
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <DateSelector
                value={formData.publishDate}
                onChange={(date) =>
                  setFormData({ ...formData, publishDate: date || new Date() })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isPublished" className="text-sm">
                  Publish immediately
                </Label>
              </div>
            </div>
          </div>

          {/* Changelog Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Changelog Entries *</Label>
              <Badge variant="secondary">{entries.length} entries</Badge>
            </div>

            {/* Add New Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add New Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newEntry.type}
                      onValueChange={(value) =>
                        setNewEntry({ ...newEntry, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANGELOG_ENTRY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${type.color}`}
                              />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newEntry.priority || ""}
                      onValueChange={(value) =>
                        setNewEntry({ ...newEntry, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newEntry.category || ""}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, category: e.target.value })
                      }
                      placeholder="e.g., UI, API, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newEntry.title}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, title: e.target.value })
                    }
                    placeholder="Brief description of the change"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newEntry.description || ""}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, description: e.target.value })
                    }
                    placeholder="Detailed description (optional)"
                    rows={2}
                  />
                </div>

                {/* Link to Issue/Feature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link to Issue</Label>
                    <Select
                      value={newEntry.issueId || ""}
                      onValueChange={(value) =>
                        setNewEntry({
                          ...newEntry,
                          issueId: value || undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems?.issues?.map((issue: any) => (
                          <SelectItem key={issue.id} value={issue.id}>
                            {issue.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Link to Feature</Label>
                    <Select
                      value={newEntry.featureId || ""}
                      onValueChange={(value) =>
                        setNewEntry({
                          ...newEntry,
                          featureId: value || undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a feature" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems?.features?.map((feature: any) => (
                          <SelectItem key={feature.id} value={feature.id}>
                            {feature.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breaking"
                    checked={newEntry.breaking || false}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, breaking: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="breaking" className="text-sm">
                    Breaking change
                  </Label>
                </div>

                <Button onClick={addEntry} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>

            {/* Existing Entries */}
            {entries.length > 0 && (
              <div className="space-y-3">
                <Label>Added Entries</Label>
                {entries.map((entry, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getTypeColor(entry.type)}`}
                            />
                            <Badge variant="outline">
                              {getTypeLabel(entry.type)}
                            </Badge>
                            {entry.breaking && (
                              <Badge variant="destructive">Breaking</Badge>
                            )}
                            {entry.priority && (
                              <Badge variant="secondary">
                                {entry.priority}
                              </Badge>
                            )}
                            {entry.category && (
                              <Badge variant="outline">{entry.category}</Badge>
                            )}
                          </div>
                          <h4 className="font-medium">{entry.title}</h4>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground">
                              {entry.description}
                            </p>
                          )}
                          {(entry.issueId || entry.featureId) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Link className="w-3 h-3" />
                              {entry.issueId && "Linked to issue"}
                              {entry.issueId && entry.featureId && " & "}
                              {entry.featureId && "Linked to feature"}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createChangelogMutation.isPending}
          >
            {createChangelogMutation.isPending
              ? "Creating..."
              : "Create Changelog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
