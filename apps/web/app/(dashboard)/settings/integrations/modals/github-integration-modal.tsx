"use client";

import { useState, useEffect } from "react";
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

interface GitHubIntegrationModalProps {
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

export function GitHubIntegrationModal({
  open,
  onOpenChange,
  integration,
  onSuccess,
}: GitHubIntegrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    isActive: true,
  });

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        apiKey: integration.config.apiKey || "",
        isActive: integration.isActive,
      });
    } else {
      setFormData({ name: "", apiKey: "", isActive: true });
    }
  }, [integration, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const config: IntegrationConfig = {
        apiKey: formData.apiKey,
      };
      if (integration) {
        return updateIntegration(integration.id, {
          name: formData.name,
          config,
          isActive: formData.isActive,
        });
      } else {
        return createIntegration({
          name: formData.name,
          type: "GITHUB",
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
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.57.69.47C19.13 20.58 22 16.76 22 12.26 22 6.58 17.52 2 12 2z" />
            </svg>
            {integration ? "Edit GitHub Integration" : "Add GitHub Integration"}
          </DialogTitle>
          <DialogDescription>
            {integration
              ? "Update your GitHub integration settings."
              : "Connect your GitHub account to automatically sync issues and pull requests."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                placeholder="e.g., My GitHub Integration"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Personal Access Token</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="ghp_123456789..."
                value={formData.apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Create a personal access token in your{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub settings
                </a>
                . Make sure it has the necessary permissions for the
                repositories you want to sync.
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
