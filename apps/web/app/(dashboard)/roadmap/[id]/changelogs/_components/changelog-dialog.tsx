"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRoadmapChangelog,
  updateRoadmapChangelog,
} from "@/actions/roadmap/changelogs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
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
import { PartialBlock } from "@blocknote/core";

interface ChangelogSheetProps {
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
}: ChangelogSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingChangelog;

  const [formData, setFormData] = useState({
    title: "",
    version: "",
    publishDate: new Date(),
    isPublished: false,
  });
  const [richDescription, setRichDescription] = useState<
    PartialBlock[] | undefined
  >(undefined);

  // Initialize form with editing data
  useEffect(() => {
    if (editingChangelog) {
      setFormData({
        title: editingChangelog.title || "",
        version: editingChangelog.version || "",
        publishDate: new Date(editingChangelog.publishDate),
        isPublished: editingChangelog.isPublished || false,
      });

      // Initialize rich description
      if (editingChangelog.description) {
        try {
          const parsed = JSON.parse(editingChangelog.description);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRichDescription(parsed);
          } else {
            setRichDescription(undefined);
          }
        } catch {
          setRichDescription(undefined);
        }
      } else {
        setRichDescription(undefined);
      }
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
      version: "",
      publishDate: new Date(),
      isPublished: false,
    });
    setRichDescription(undefined);
  };

  const handleSubmit = async () => {
    if (!formData.title || !richDescription || richDescription.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const publishDate = formData.publishDate
      ? new Date(formData.publishDate).getTime()
      : Date.now();

    // Convert rich content to JSON string for storage
    const descriptionToSave =
      richDescription && richDescription.length > 0
        ? JSON.stringify(richDescription)
        : "";

    const submitData = {
      title: formData.title,
      description: descriptionToSave,
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full max-w-3xl sm:max-w-4xl overflow-hidden flex flex-col">
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center gap-3 flex-wrap justify-between">
            <div>
              <SheetTitle className="text-xl">
                {isEditing ? "Edit Changelog" : "Create Changelog"}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {isEditing
                  ? "Update your changelog details"
                  : "Create a new changelog entry for your roadmap"}
              </SheetDescription>
            </div>
            <Button onClick={handleSubmit} disabled={isLoading} size="sm">
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Changelog"
                  : "Create Changelog"}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 px-4 overflow-hidden flex flex-col space-y-6 pt-6">
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
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
              <Label htmlFor="version" className="text-sm font-medium">
                Version
              </Label>
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
              <Label htmlFor="publishDate" className="text-sm font-medium">
                Date
              </Label>
              <DateSelector
                value={formData.publishDate}
                onChange={(date) =>
                  setFormData({ ...formData, publishDate: date || new Date() })
                }
                size="default"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            <Label className="text-sm font-medium flex-shrink-0">
              Description *
            </Label>
            <div className="flex-1 overflow-hidden">
              <Editor
                content={richDescription}
                editable={true}
                onChange={(content) => setRichDescription(content)}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
