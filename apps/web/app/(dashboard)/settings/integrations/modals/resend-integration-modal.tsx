"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
  createIntegration,
  updateIntegration,
  IntegrationConfig,
} from "@/actions/integration";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface ResendIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration?: {
    id: string;
    name: string;
    config: IntegrationConfig;
    isActive: boolean;
  } | null;
  onSuccess: () => void;
}

export function ResendIntegrationModal({
  open,
  onOpenChange,
  integration,
  onSuccess,
}: ResendIntegrationModalProps) {
  // Use mutation state instead of manual loading
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    audienceId: "",
    isActive: true,
  });

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        apiKey: integration.config.apiKey || "",
        audienceId: integration.config.audienceId || "",
        isActive: integration.isActive,
      });
    } else {
      setFormData({ name: "", apiKey: "", audienceId: "", isActive: true });
    }
  }, [integration, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const config: IntegrationConfig = {
        apiKey: formData.apiKey,
      };
      if (formData.audienceId) config.audienceId = formData.audienceId;

      // Check if this is an existing integration (has a valid id)
      const isExistingIntegration =
        integration && integration.id && integration.id.trim() !== "";

      const payload = isExistingIntegration
        ? {
            id: integration.id,
            data: {
              name: formData.name,
              config,
              isActive: formData.isActive,
            },
          }
        : {
            data: {
              name: formData.name,
              type: "RESEND" as const,
              config,
            },
          };

      console.log("Mutation payload:", {
        ...payload,
        data: {
          ...payload.data,
          config: { ...payload.data.config, apiKey: "***" },
        },
        isExistingIntegration,
      });

      if (isExistingIntegration) {
        return updateIntegration(integration.id, {
          name: formData.name,
          config,
          isActive: formData.isActive,
        });
      } else {
        return createIntegration({
          name: formData.name,
          type: "RESEND",
          config,
        });
      }
    },
    onSuccess: (result) => {
      console.log("Integration mutation success:", result);
      if (result.success) {
        toast.success("Integration saved successfully");
        console.log("Calling onSuccess callback");
        onSuccess();
      } else {
        console.error("Integration save failed:", result.error);
        toast.error(result.error?.message || "Failed to save integration");
      }
    },
    onError: (error) => {
      console.error("Integration mutation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save integration"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (mutation.isPending) {
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Integration name is required");
      return;
    }

    if (!formData.apiKey.trim()) {
      toast.error("API key is required");
      return;
    }

    console.log("Submitting integration data:", {
      name: formData.name,
      apiKey: formData.apiKey ? "***" : "missing",
      audienceId: formData.audienceId || "not set",
      isActive: formData.isActive,
      isUpdate: !!(
        integration &&
        integration.id &&
        integration.id.trim() !== ""
      ),
    });

    mutation.mutate();
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Modal open state changing:", {
      from: open,
      to: newOpen,
      isPending: mutation.isPending,
    });
    if (!mutation.isPending) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {integration && integration.id && integration.id.trim() !== ""
              ? "Edit Resend Integration"
              : "Add Resend Integration"}
          </DialogTitle>
          <DialogDescription>
            {integration && integration.id && integration.id.trim() !== ""
              ? "Update your Resend integration settings."
              : "Connect your Resend account to automatically sync waitlist subscribers."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Resend Integration"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="re_123456789..."
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resend dashboard
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audienceId">Audience ID (Optional)</Label>
              <Input
                id="audienceId"
                placeholder="12345678-1234-1234-1234-123456789012"
                value={formData.audienceId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, audienceId: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use your default audience
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? integration && integration.id && integration.id.trim() !== ""
                  ? "Updating..."
                  : "Creating..."
                : integration && integration.id && integration.id.trim() !== ""
                  ? "Update Integration"
                  : "Create Integration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
