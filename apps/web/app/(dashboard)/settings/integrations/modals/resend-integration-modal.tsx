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
      if (integration) {
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
      if (result.success) {
        onSuccess();
      } else {
        toast.error("Failed to save integration");
      }
    },
    onError: () => {
      toast.error("Failed to save integration");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {integration ? "Edit Resend Integration" : "Add Resend Integration"}
          </DialogTitle>
          <DialogDescription>
            {integration
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? integration
                  ? "Updating..."
                  : "Creating..."
                : integration
                  ? "Update Integration"
                  : "Create Integration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
