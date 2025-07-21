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
import { updateIntegration, IntegrationConfig } from "@/actions/integration";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface EditIntegrationDialogProps {
  integration: {
    id: string;
    name: string;
    type: string;
    config: IntegrationConfig;
    isActive: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditIntegrationDialog({
  integration,
  open,
  onOpenChange,
  onSuccess,
}: EditIntegrationDialogProps) {
  // No manual loading state, use mutation state
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    audienceId: "",
    listId: "",
    isActive: true,
  });

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        apiKey: integration.config.apiKey || "",
        audienceId: integration.config.audienceId || "",
        listId: integration.config.listId || "",
        isActive: integration.isActive,
      });
    }
  }, [integration]);

  const mutation = useMutation({
    mutationFn: async () => {
      const config: IntegrationConfig = {
        apiKey: formData.apiKey,
      };
      if (integration.type === "RESEND" && formData.audienceId) {
        config.audienceId = formData.audienceId;
      } else if (
        ["SENDGRID", "MAILCHIMP", "CONVERTKIT"].includes(integration.type) &&
        formData.listId
      ) {
        config.listId = formData.listId;
      }
      return updateIntegration(integration.id, {
        name: formData.name,
        config,
        isActive: formData.isActive,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        onSuccess();
      } else {
        toast.error("Failed to update integration");
      }
    },
    onError: () => {
      toast.error("Failed to update integration");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  const renderPlatformFields = () => {
    switch (integration.type) {
      case "RESEND":
        return (
          <div className="space-y-4">
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
          </div>
        );
      case "SENDGRID":
      case "MAILCHIMP":
      case "CONVERTKIT":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listId">
                {integration.type === "SENDGRID"
                  ? "List ID"
                  : integration.type === "MAILCHIMP"
                    ? "Audience ID"
                    : "Form ID"}
              </Label>
              <Input
                id="listId"
                placeholder="Enter your list/audience/form ID"
                value={formData.listId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, listId: e.target.value })
                }
                required
              />
            </div>
          </div>
        );
      case "LOOPS":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Loops API key"
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from the{" "}
                <a
                  href="https://app.loops.so/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Loops dashboard
                </a>
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Edit {integration.name}
          </DialogTitle>
          <DialogDescription>
            Update your email integration settings.
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
              <Label>Email Platform</Label>
              <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                {integration.type}
              </div>
            </div>

            {renderPlatformFields()}

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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update Integration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
