"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoadmapChangelog } from "@/actions/roadmap/changelogs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { DateSelector } from "@/components/ui/selectors";
import { Editor } from "@/components/editor";
import { toast } from "sonner";
import { format } from "date-fns";
import { PartialBlock } from "@blocknote/core";
import { Edit, Save, X, Calendar, Hash, Globe, FileText } from "lucide-react";

interface ChangelogDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: any;
  roadmapId: string;
}

export function ChangelogDetailSheet({
  isOpen,
  onClose,
  changelog,
  roadmapId,
}: ChangelogDetailSheetProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    version: "",
    publishDate: new Date(),
    isPublished: false,
  });
  const [richDescription, setRichDescription] = useState<
    PartialBlock[] | undefined
  >(undefined);

  // Initialize form data when changelog changes
  useEffect(() => {
    if (changelog) {
      setFormData({
        title: changelog.title || "",
        version: changelog.version || "",
        publishDate: new Date(changelog.publishDate),
        isPublished: changelog.isPublished || false,
      });

      // Initialize rich description - handle both JSON and plain text
      if (changelog.description) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(changelog.description);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRichDescription(parsed);
          } else {
            // Empty array or invalid format, let editor handle empty state
            setRichDescription(undefined);
          }
        } catch {
          // Not valid JSON, it's plain text - let the editor handle it by passing undefined
          // The editor will initialize with empty content and the user can add content
          setRichDescription(undefined);
        }
      } else {
        // No description, start with undefined to let editor initialize properly
        setRichDescription(undefined);
      }
    }
  }, [changelog]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      version: string;
      publishDate: Date;
      isPublished: boolean;
    }) => {
      return updateRoadmapChangelog(changelog.id, data);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog updated successfully!");
        setIsEditing(false);
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to update changelog");
      }
    },
    onError: (error) => {
      toast.error("Failed to update changelog");
      console.error("Update error:", error);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return updateRoadmapChangelog(changelog.id, { isPublished: true });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changelog published successfully!");
        queryClient.invalidateQueries({
          queryKey: ["roadmapChangelogs", roadmapId],
        });
      } else {
        toast.error("Failed to publish changelog");
      }
    },
    onError: (error) => {
      toast.error("Failed to publish changelog");
      console.error("Publish error:", error);
    },
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    // Convert rich content back to JSON string for storage
    const descriptionToSave =
      richDescription && richDescription.length > 0
        ? JSON.stringify(richDescription)
        : "";

    updateMutation.mutate({
      ...formData,
      description: descriptionToSave,
    });
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (changelog) {
      setFormData({
        title: changelog.title || "",
        version: changelog.version || "",
        publishDate: new Date(changelog.publishDate),
        isPublished: changelog.isPublished || false,
      });

      // Reset rich description
      try {
        if (changelog.description) {
          const parsed = JSON.parse(changelog.description);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRichDescription(parsed);
          } else {
            setRichDescription(undefined);
          }
        } else {
          setRichDescription(undefined);
        }
      } catch {
        setRichDescription(undefined);
      }
    }
    setIsEditing(false);
  };

  const handlePublish = () => {
    publishMutation.mutate();
  };

  if (!changelog) return null;

  const isLoading = updateMutation.isPending || publishMutation.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-xl">
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Changelog title"
                    className="text-xl font-semibold border-0 px-0 focus-visible:ring-0"
                  />
                ) : (
                  changelog.title
                )}
              </SheetTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={changelog.isPublished ? "default" : "secondary"}
                  className="text-xs"
                >
                  {changelog.isPublished ? "Published" : "Draft"}
                </Badge>
                {changelog.version && (
                  <Badge variant="outline" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    {changelog.version}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(changelog.publishDate), "MMM d, yyyy")}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-1" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {!changelog.isPublished && (
                    <Button
                      size="sm"
                      onClick={handlePublish}
                      disabled={isLoading}
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      {isLoading ? "Publishing..." : "Publish"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <SheetDescription>
            View and edit changelog details with rich text formatting
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {isEditing && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
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
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <DateSelector
                  value={formData.publishDate}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      publishDate: date || new Date(),
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <Label className="text-base font-medium">Description</Label>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Editor
                content={richDescription}
                editable={isEditing}
                onChange={(content) => setRichDescription(content)}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
