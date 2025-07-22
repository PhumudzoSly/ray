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
import { generateGitHubOAuthUrl } from "@/actions/integration/github";
import { GitHubRepositoryModal } from "./github-repository-modal";
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
    isActive: true,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRepositoryModal, setShowRepositoryModal] = useState(false);

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        isActive: integration.isActive,
      });
    } else {
      setFormData({ name: "", isActive: true });
    }
  }, [integration, open]);

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      const oauthUrl = await generateGitHubOAuthUrl();
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initiate GitHub connection"
      );
      setIsConnecting(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!integration) throw new Error("No integration to update");
      return updateIntegration(integration.id, {
        name: formData.name,
        isActive: formData.isActive,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Integration updated successfully");
        onSuccess();
      } else {
        toast.error("Failed to update integration");
      }
    },
    onError: (error) => {
      console.error("Update integration error:", error);
      toast.error("Failed to update integration");
    },
  });

  return (
    <>
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
              {integration
                ? "Edit GitHub Integration"
                : "Add GitHub Integration"}
            </DialogTitle>
            <DialogDescription>
              {integration
                ? "Update your GitHub integration settings."
                : "Connect your GitHub account to automatically sync issues and pull requests."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
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
                />
              </div>

              {integration && integration.config?.accessToken ? (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-600">
                        Connected to GitHub
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected as:{" "}
                      <span className="font-medium">
                        {integration.config.githubUsername}
                      </span>
                    </p>
                    {integration.config.repositories &&
                      integration.config.repositories.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {integration.config.repositories.length} repository
                          {integration.config.repositories.length !== 1
                            ? "ies"
                            : "y"}{" "}
                          connected
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label>Connected Repositories</Label>
                    {integration.config.repositories &&
                    integration.config.repositories.length > 0 ? (
                      <div className="space-y-2">
                        {integration.config.repositories.map((repo: string) => (
                          <div
                            key={repo}
                            className="flex items-center justify-between p-2 rounded border"
                          >
                            <span className="text-sm font-mono">{repo}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement repository sync
                                toast.info("Repository sync coming soon!");
                              }}
                            >
                              Sync
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No repositories connected yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShowRepositoryModal(true)}
                        >
                          Connect Repositories
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Not Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect your GitHub account to automatically sync
                      repositories, issues, and code analysis.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleConnectGitHub}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.57.69.47C19.13 20.58 22 16.76 22 12.26 22 6.58 17.52 2 12 2z" />
                        </svg>
                        Connect GitHub Account
                      </>
                    )}
                  </Button>
                </div>
              )}

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
              {integration && integration.config?.accessToken ? (
                <Button
                  type="button"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? "Updating..."
                    : "Update Integration"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleConnectGitHub}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect GitHub"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {integration?.id && (
        <GitHubRepositoryModal
          open={showRepositoryModal}
          onOpenChange={setShowRepositoryModal}
          integrationId={integration.id}
          onSuccess={() => {
            // Refresh the integration data
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
