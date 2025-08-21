"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { ProjectSelector } from "@/components/ui/selectors/project-selector";
import { Mail, Loader2, Check, X } from "lucide-react";
import * as waitlistActions from "@/actions/waitlist";
import { getResendIntegrations } from "@/actions/integration/resend-actions";
import { getLoopsIntegrations } from "@/actions/integration/loops-actions";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import { useDebounce } from "@/hooks/use-debounce";
import APIDocs from "./api-docs";

type FormState = {
  name: string;
  slug: string;
  description: string;
  projectId: string | null;
  isPublic: boolean;
  allowNameCapture: boolean;
  showPosition: boolean;
  showSocialProof: boolean;
  customMessage: string;
  emailSyncEnabled: boolean;
  integrationId: string | null;
};

interface WaitlistFormProps {
  mode: "create" | "edit";
  waitlistId?: string;
  initialData?: {
    name: string;
    slug: string;
    description: string;
    projectId: string;
    projectName?: string;
    isPublic: boolean;
    allowNameCapture: boolean;
    showPosition: boolean;
    showSocialProof: boolean;
    customMessage?: string;
    emailSyncEnabled?: boolean;
    integrationId?: string | null;
  };
  onSuccess?: (result: any) => void;
}

export default function WaitlistForm({
  mode,
  waitlistId,
  initialData,
  onSuccess,
}: WaitlistFormProps) {
  const router = useRouter();

  const createWaitlistMutation = useMutation({
    mutationFn: async (data: any) => waitlistActions.createWaitlist(data),
    onSuccess: (result) => {
      if (result && result.success && result.data && result.data.id) {
        toast.success("Waitlist created successfully!");
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push(`/waitlist/${result.data.id}`);
        }
      } else {
        // Handle case where server returns success: false
        const errorMessage = result?.error || "Failed to create waitlist";
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      console.error("Error creating waitlist:", error);
      toast.error(
        error?.message ||
          error?.toString() ||
          "An unexpected error occurred while creating the waitlist"
      );
    },
  });

  const updateWaitlistMutation = useMutation({
    mutationFn: async (data: any) =>
      waitlistActions.updateWaitlist(waitlistId!, data),
    onSuccess: (result) => {
      if (result && result.success) {
        toast.success("Waitlist updated successfully!");
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push(`/waitlist/${waitlistId}`);
        }
      } else {
        // Handle case where server returns success: false
        const errorMessage = result?.error || "Failed to update waitlist";
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      console.error("Error updating waitlist:", error);
      toast.error(
        error?.message ||
          error?.toString() ||
          "An unexpected error occurred while updating the waitlist"
      );
    },
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    projectId: "",
    isPublic: true,
    allowNameCapture: true,
    showPosition: true,
    showSocialProof: true,
    customMessage: "",
    emailSyncEnabled: false,
    integrationId: null,
  });

  const [originalSlug, setOriginalSlug] = useState(initialData?.slug || "");

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

  // Debounce slug for availability checking
  const debouncedSlug = useDebounce(form.slug, 500);

  // Check slug availability only if slug has changed or we're in create mode
  const shouldCheckSlug = mode === "create" || form.slug !== originalSlug;

  // Slug availability query
  const { data: slugAvailability } = useQuery({
    queryKey: ["slugAvailability", debouncedSlug, waitlistId],
    queryFn: async () => {
      if (!debouncedSlug || debouncedSlug.length === 0) return null;
      if (!shouldCheckSlug) return null;

      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(debouncedSlug)) {
        return { available: false, slug: debouncedSlug, invalidFormat: true };
      }

      const result = await waitlistActions.checkSlugAvailability(
        debouncedSlug,
        waitlistId
      );
      return result?.success ? result.data : null;
    },
    enabled: !!debouncedSlug && debouncedSlug.length > 0 && shouldCheckSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update slug status based on availability check
  useEffect(() => {
    // If slug hasn't changed in edit mode, don't check availability
    if (mode === "edit" && form.slug === originalSlug) {
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
    form.slug,
    slugAvailability,
    shouldCheckSlug,
  ]);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description,
        projectId: initialData.projectId,
        isPublic: initialData.isPublic,
        allowNameCapture: initialData.allowNameCapture,
        showPosition: initialData.showPosition,
        showSocialProof: initialData.showSocialProof,
        customMessage: initialData.customMessage || "",
        emailSyncEnabled: initialData.emailSyncEnabled || false,
        integrationId: initialData.integrationId || null,
      });
      setOriginalSlug(initialData.slug);
    }
  }, [mode, initialData]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Ensure we don't return an empty string
    return slug || "waitlist";
  };

  // Generate alternative slug suggestions
  const generateAlternativeSlugs = (baseSlug: string) => {
    const suggestions = [];
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${baseSlug}-${i}`);
    }
    return suggestions;
  };

  // Auto-generate slug from name (only for create mode)
  const handleNameChange = (name: string) => {
    if (mode === "create") {
      const slug = generateSlug(name);
      setForm({ ...form, name, slug });
    } else {
      setForm({ ...form, name });
    }
  };

  // Validate form
  const validateForm = (form: FormState) => {
    const errors: string[] = [];

    if (!form.name.trim()) {
      errors.push("Name is required");
    }
    if (mode === "create" && !form.slug.trim()) {
      errors.push("Slug is required");
    }
    if (!form.description.trim()) {
      errors.push("Description is required");
    }
    if (mode === "create" && !form.projectId) {
      errors.push("Project is required");
    }
    if (mode === "create" && form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      errors.push(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (createWaitlistMutation.isPending || updateWaitlistMutation.isPending) {
      return;
    }

    if (!validateForm(form)) {
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

    try {
      const submitData = {
        ...form,
        projectId: form.projectId as any,
        customMessage: form.customMessage || undefined,
      };

      if (mode === "create") {
        await createWaitlistMutation.mutateAsync(submitData);
      } else {
        await updateWaitlistMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} waitlist:`,
        error
      );
      // Error handling is now done in the mutation's onError callback
    }
  };

  const mainContent = (
    <div className="max-w-2xl mx-auto">
      <div
        className={`space-y-8 p-6 ${createWaitlistMutation.isPending || updateWaitlistMutation.isPending ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "create" ? "Create waitlist" : "Edit waitlist"}
            </h1>
            <p className="text-sm text-muted-foreground">
              You can collect waitlist users via API or hosted URLs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Beta Access Waitlist"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/wl/</span>
                <div className="flex-1 relative">
                  <Input
                    placeholder="beta-access-waitlist"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    disabled={mode === "edit"}
                    className={`pr-10 ${
                      slugStatus.available === false
                        ? "border-destructive focus-visible:ring-destructive"
                        : slugStatus.available === true
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                    }`}
                  />
                  {form.slug && mode === "create" && (
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
                  {slugStatus.available === false &&
                    form.slug &&
                    mode === "create" && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Suggestions:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {generateAlternativeSlugs(form.slug).map(
                            (suggestion) => (
                              <Button
                                key={suggestion}
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() =>
                                  setForm({ ...form, slug: suggestion })
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
              {mode === "edit" && (
                <p className="text-xs text-muted-foreground">
                  URL slug cannot be changed after creation
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Get early access to our new features and help shape the future of our product."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {mode === "create" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <ProjectSelector
                currentProject={form.projectId}
                onChange={(projectId) => setForm({ ...form, projectId })}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Input
                value={initialData?.projectName || "Unknown Project"}
                disabled
                className="border-0 bg-muted/30 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Project cannot be changed after creation
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message</label>
            <Textarea
              placeholder="Thanks for joining! We'll notify you when it's your turn."
              value={form.customMessage}
              onChange={(e) =>
                setForm({ ...form, customMessage: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Settings</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Public</div>
                <div className="text-xs text-muted-foreground">
                  Allow anyone to join the waitlist
                </div>
              </div>
              <Switch
                checked={form.isPublic}
                onCheckedChange={(isPublic) => setForm({ ...form, isPublic })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Capture Names</div>
                <div className="text-xs text-muted-foreground">
                  Ask for user names in addition to email
                </div>
              </div>
              <Switch
                checked={form.allowNameCapture}
                onCheckedChange={(allowNameCapture) =>
                  setForm({ ...form, allowNameCapture })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Show Position</div>
                <div className="text-xs text-muted-foreground">
                  Display user's position in the waitlist
                </div>
              </div>
              <Switch
                checked={form.showPosition}
                onCheckedChange={(showPosition) =>
                  setForm({ ...form, showPosition })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Social Proof</div>
                <div className="text-xs text-muted-foreground">
                  Show total signups and recent activity
                </div>
              </div>
              <Switch
                checked={form.showSocialProof}
                onCheckedChange={(showSocialProof) =>
                  setForm({ ...form, showSocialProof })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Sync
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm">Enable Email Sync</div>
                <div className="text-xs text-muted-foreground">
                  Automatically sync waitlist subscribers to your email platform
                </div>
              </div>
              <Switch
                checked={form.emailSyncEnabled}
                onCheckedChange={(emailSyncEnabled) =>
                  setForm({ ...form, emailSyncEnabled })
                }
              />
            </div>

            {form.emailSyncEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Integration</label>
                <Select
                  value={form.integrationId || ""}
                  onValueChange={(integrationId) =>
                    setForm({
                      ...form,
                      integrationId: integrationId || null,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an email integration" />
                  </SelectTrigger>
                  <SelectContent>
                    <IntegrationOptions />
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  <a
                    href="/settings/integrations"
                    className="text-primary hover:underline"
                  >
                    Manage integrations
                  </a>{" "}
                  to connect your email platform
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                mode === "create" ? "/waitlist" : `/waitlist/${waitlistId}`
              )
            }
            disabled={
              createWaitlistMutation.isPending ||
              updateWaitlistMutation.isPending
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createWaitlistMutation.isPending ||
              updateWaitlistMutation.isPending ||
              slugStatus.available === false ||
              slugStatus.checking ||
              (form.slug.length > 0 && !/^[a-z0-9-]+$/.test(form.slug))
            }
          >
            {(createWaitlistMutation.isPending ||
              updateWaitlistMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "create" ? "Create Waitlist" : "Update Waitlist"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ExpandedLayoutContainer
      sidebar={
        <div className="p-4">
          <APIDocs mode={mode} waitlistId={waitlistId || ""} />
        </div>
      }
    >
      <div className="flex-1 relative">
        {mainContent}
        {(createWaitlistMutation.isPending ||
          updateWaitlistMutation.isPending) && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "create"
                ? "Creating waitlist..."
                : "Updating waitlist..."}
            </div>
          </div>
        )}
      </div>
    </ExpandedLayoutContainer>
  );
}
function IntegrationOptions() {
  // Fetch both Resend and Loops integrations
  const {
    data: resendData,
    isLoading: resendLoading,
    isError: resendError,
  } = useQuery({
    queryKey: ["integrations", "resend"],
    queryFn: async () => {
      try {
        return await getResendIntegrations();
      } catch (error) {
        console.error("Error fetching Resend integrations:", error);
        return [];
      }
    },
  });

  const {
    data: loopsData,
    isLoading: loopsLoading,
    isError: loopsError,
  } = useQuery({
    queryKey: ["integrations", "loops"],
    queryFn: async () => {
      try {
        return await getLoopsIntegrations();
      } catch (error) {
        console.error("Error fetching Loops integrations:", error);
        return [];
      }
    },
  });

  const isLoading = resendLoading || loopsLoading;
  const isError = resendError && loopsError;

  if (isLoading) {
    return (
      <SelectItem value="none" disabled>
        Loading...
      </SelectItem>
    );
  }

  // Combine both integration types
  const allIntegrations = [
    ...(resendData || []).map((integration) => ({
      ...integration,
      displayName: `${integration.name} (Resend)`,
    })),
    ...(loopsData || []).map((integration) => ({
      ...integration,
      displayName: `${integration.name} (Loops)`,
    })),
  ];

  if (allIntegrations.length === 0) {
    return (
      <SelectItem value="no-integrations" disabled>
        No email integrations found
      </SelectItem>
    );
  }

  return (
    <>
      {allIntegrations.map((integration: any) => (
        <SelectItem key={integration.id} value={integration.id}>
          {integration.displayName}
        </SelectItem>
      ))}
    </>
  );
}
