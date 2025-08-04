"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Plus, Check, X, Loader2, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as roadmapActions from "@/actions/roadmap";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { ProjectSelector } from "@/components/ui/selectors/project-selector";

interface RoadmapFormProps {
  mode?: "create" | "edit";
  roadmap?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  navigateOnCreate?: boolean;
}

const RoadmapForm = ({
  mode = "create",
  roadmap,
  trigger,
  onSuccess,
  navigateOnCreate = true,
}: RoadmapFormProps) => {
  const router = useRouter();
  const { org } = useSession();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    roadmap?.projectId || null
  );

  const [formData, setFormData] = useState({
    name: roadmap?.name || "",
    slug: roadmap?.slug || "",
    description: roadmap?.description || "",
    isPublic: roadmap?.isPublic ?? true,
    allowVoting: roadmap?.allowVoting ?? true,
    allowFeedback: roadmap?.allowFeedback ?? true,
  });

  const [originalSlug, setOriginalSlug] = useState(roadmap?.slug || "");

  // Slug availability state
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  // Mutations
  const createRoadmapMutation = useMutation({
    mutationFn: async (data: any) => roadmapActions.createPublicRoadmap(data),
    onSuccess: () => {
      // Invalidate and refetch roadmaps data
      queryClient.invalidateQueries({ queryKey: ["roadmaps", org] });
    },
  });
  const updateRoadmapMutation = useMutation({
    mutationFn: async (data: any) =>
      roadmapActions.updatePublicRoadmap(data.id, data),
    onSuccess: () => {
      // Invalidate and refetch roadmaps data
      queryClient.invalidateQueries({ queryKey: ["roadmaps", org] });
    },
  });

  // Debounce slug for availability checking
  const debouncedSlug = useDebounce(formData.slug, 500);

  // Check slug availability only if slug has changed or we're in create mode
  const shouldCheckSlug = mode === "create" || formData.slug !== originalSlug;

  // Slug availability query
  const { data: slugAvailability } = useQuery({
    queryKey: ["slugAvailability", debouncedSlug, roadmap?.id],
    queryFn: async () => {
      if (!debouncedSlug || debouncedSlug.length === 0) return null;
      if (!shouldCheckSlug) return null;

      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(debouncedSlug)) {
        return { available: false, slug: debouncedSlug, invalidFormat: true };
      }

      const result = await roadmapActions.checkSlugAvailability(
        debouncedSlug,
        roadmap?.id
      );
      return result?.success ? result.data : null;
    },
    enabled: !!debouncedSlug && debouncedSlug.length > 0 && shouldCheckSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update slug status based on availability check
  useEffect(() => {
    // If slug hasn't changed in edit mode, don't check availability
    if (mode === "edit" && formData.slug === originalSlug) {
      setSlugStatus({
        checking: false,
        available: true,
        message: "Slug unchanged",
      });
      return;
    }

    if (!debouncedSlug || debouncedSlug.length === 0) {
      setSlugStatus({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // If we're still loading the availability check
    if (slugAvailability === undefined && shouldCheckSlug) {
      setSlugStatus({
        checking: true,
        available: null,
        message: "Checking availability...",
      });
      return;
    }

    // If we have the availability result
    if (slugAvailability) {
      if (
        "invalidFormat" in slugAvailability &&
        slugAvailability.invalidFormat
      ) {
        setSlugStatus({
          checking: false,
          available: false,
          message:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        });
      } else if (slugAvailability.available) {
        setSlugStatus({
          checking: false,
          available: true,
          message: "Slug is available",
        });
      } else {
        setSlugStatus({
          checking: false,
          available: false,
          message: "Slug is already taken",
        });
      }
    }
  }, [
    debouncedSlug,
    mode,
    originalSlug,
    formData.slug,
    slugAvailability,
    shouldCheckSlug,
  ]);

  // Reset form
  const resetForm = () => {
    if (mode === "create") {
      setFormData({
        name: "",
        slug: "",
        description: "",
        isPublic: true,
        allowVoting: true,
        allowFeedback: true,
      });
      setSelectedProjectId(null);
    } else {
      // Reset to original values for edit mode
      setFormData({
        name: roadmap?.name || "",
        slug: roadmap?.slug || "",
        description: roadmap?.description || "",
        isPublic: roadmap?.isPublic ?? true,
        allowVoting: roadmap?.allowVoting ?? true,
        allowFeedback: roadmap?.allowFeedback ?? true,
      });
      setSelectedProjectId(roadmap?.projectId || null);
    }

    setSlugStatus({
      checking: false,
      available: null,
      message: "",
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.slug ||
      !formData.description ||
      !selectedProjectId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if slug is available before creating/updating
    if (slugStatus.available === false) {
      toast.error("Please choose a different slug - this one is already taken");
      return;
    }

    if (slugStatus.checking) {
      toast.error("Please wait for slug availability check to complete");
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      toast.error(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        const result = await createRoadmapMutation.mutateAsync({
          projectId: selectedProjectId,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          isPublic: formData.isPublic,
          allowVoting: formData.allowVoting,
          allowFeedback: formData.allowFeedback,
        });

        console.log("Create roadmap result:", result);

        if (result && result.success && result.data && result.data.id) {
          toast.success("Roadmap created successfully!");
          setOpen(false);
          resetForm();
          // Navigate to the new roadmap if enabled
          if (navigateOnCreate) {
            router.push(`/roadmap/${result.data.id}`);
          }
        } else {
          // Handle server-side errors
          const errorMessage = result?.error || "Unknown error occurred";
          console.error("Failed to create roadmap:", errorMessage);
          toast.error(`Failed to create roadmap: ${errorMessage}`);
        }
      } else {
        const result = await updateRoadmapMutation.mutateAsync({
          id: roadmap.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          isPublic: formData.isPublic,
          allowVoting: formData.allowVoting,
          allowFeedback: formData.allowFeedback,
        });

        console.log("Update roadmap result:", result);

        if (result && result.success) {
          toast.success("Roadmap updated successfully!");
          setOpen(false);
          resetForm();
          onSuccess?.();
        } else {
          // Handle server-side errors
          const errorMessage = result?.error || "Unknown error occurred";
          console.error("Failed to update roadmap:", errorMessage);
          toast.error(`Failed to update roadmap: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("Mutation error:", error);
      toast.error(
        mode === "create"
          ? "Failed to create roadmap"
          : "Failed to update roadmap"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Ensure we don't return an empty string
    return slug || "roadmap";
  };

  // Generate alternative slug suggestions
  const generateAlternativeSlugs = (baseSlug: string) => {
    const suggestions = [];
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${baseSlug}-${i}`);
    }
    return suggestions;
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant={"fancy"}>
              {mode === "create" ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Roadmap
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Public Roadmap" : "Edit Roadmap"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Share your project roadmap with users and collect feedback"
                : "Update your roadmap settings and configuration"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Roadmap Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Project Roadmap"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A brief description of your roadmap"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/rm/</span>
                <div className="flex-1 relative">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="my-project-roadmap"
                    className={`pr-10 ${
                      slugStatus.available === false
                        ? "border-destructive focus-visible:ring-destructive"
                        : slugStatus.available === true
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                    }`}
                  />
                  {formData.slug && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {slugStatus.checking ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : slugStatus.available === true ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : slugStatus.available === false ? (
                        <X className="w-4 h-4 text-destructive" />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              {slugStatus.message && (
                <div className="space-y-2">
                  <p
                    className={`text-sm ${
                      slugStatus.available === true
                        ? "text-green-600"
                        : slugStatus.available === false
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {slugStatus.message}
                  </p>
                  {slugStatus.available === false && formData.slug && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Suggestions:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {generateAlternativeSlugs(formData.slug).map(
                          (suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() =>
                                setFormData({ ...formData, slug: suggestion })
                              }
                            >
                              {suggestion}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <ProjectSelector
                currentProject={selectedProjectId}
                onChange={(project) => setSelectedProjectId(project)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublic: checked })
                  }
                />
                <Label htmlFor="isPublic">Public Roadmap</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowVoting"
                  checked={formData.allowVoting}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowVoting: checked })
                  }
                />
                <Label htmlFor="allowVoting">Allow Voting</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allowFeedback"
                  checked={formData.allowFeedback}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowFeedback: checked })
                  }
                />
                <Label htmlFor="allowFeedback">Allow Feedback</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                slugStatus.available === false ||
                slugStatus.checking ||
                (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug))
              }
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Roadmap"
                  : "Update Roadmap"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export both the form component and a default create component
export { RoadmapForm };

const NewRoadmap = ({
  onSuccess,
  navigateOnCreate = true,
}: {
  onSuccess?: () => void;
  navigateOnCreate?: boolean;
}) => (
  <RoadmapForm
    mode="create"
    onSuccess={onSuccess}
    navigateOnCreate={navigateOnCreate}
  />
);
export default NewRoadmap;
