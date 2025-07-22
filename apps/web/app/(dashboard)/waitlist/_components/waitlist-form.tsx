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
import { Badge } from "@workspace/ui/components/badge";
import { Copy, Key, Mail, Loader2 } from "lucide-react";
import * as waitlistActions from "@/actions/waitlist";
import { getIntegrationsByPurpose } from "@/actions/integration";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";

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
        emailSyncEnabled: (initialData as any).emailSyncEnabled || false,
        integrationId: (initialData as any).integrationId || null,
      });
    }
  }, [mode, initialData]);

  // Auto-generate slug from name (only for create mode)
  const handleNameChange = (name: string) => {
    if (mode === "create") {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const apiDocsContent = (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="text-sm font-medium mb-1">API Integration</h3>
        <p className="text-xs text-muted-foreground">
          Integrate your waitlist with your application
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Authentication</span>
            <Badge variant="outline" className="text-xs">
              Bearer Token
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings/api-keys")}
            className="w-full text-xs"
          >
            <Key className="w-3 h-3 mr-1" />
            Manage API Keys
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Join Waitlist</span>
            <Badge variant="secondary" className="text-xs">
              POST
            </Badge>
          </div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            POST /api/waitlist/join
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">Headers</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono space-y-1">
            <div>Authorization: Bearer YOUR_API_KEY</div>
            <div>Content-Type: application/json</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">Request Body</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            <pre className="text-xs">
              {`{
  "waitlistId": "${mode === "edit" && waitlistId ? waitlistId : "your-waitlist-id"}",
  "email": "user@example.com",
  "name": "John Doe"
}`}
            </pre>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-2">JavaScript Example</div>
          <div className="bg-muted/50 p-2 rounded text-xs font-mono">
            <pre className="text-xs">
              {`fetch('/api/waitlist/join', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    waitlistId: '${mode === "edit" && waitlistId ? waitlistId : "your-waitlist-id"}',
    email: 'user@example.com'
  })
})`}
            </pre>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyToClipboard(`fetch('/api/waitlist/join', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    waitlistId: '${mode === "edit" && waitlistId ? waitlistId : "your-waitlist-id"}',
    email: 'user@example.com'
  })
})`)
            }
            className="w-full text-xs mt-2"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );

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
              <Input
                placeholder="beta-access-waitlist"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                disabled={mode === "edit"}
              />
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
              updateWaitlistMutation.isPending
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
    <ExpandedLayoutContainer sidebar={apiDocsContent}>
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
  // Use useQuery to fetch integrations for email_sync
  const { data, isLoading, isError } = useQuery({
    queryKey: ["integrations", "email_sync"],
    queryFn: async () => {
      return getIntegrationsByPurpose("email_sync");
    },
  });

  if (isLoading) {
    return (
      <SelectItem value="none" disabled>
        Loading...
      </SelectItem>
    );
  }

  if (
    isError ||
    !data ||
    !data.success ||
    !data.data ||
    data.data.length === 0
  ) {
    return (
      <SelectItem value="no-integrations" disabled>
        No email integrations found
      </SelectItem>
    );
  }

  return (
    <>
      {data.data.map((integration: any) => (
        <SelectItem key={integration.id} value={integration.id}>
          {integration.name}
        </SelectItem>
      ))}
    </>
  );
}
