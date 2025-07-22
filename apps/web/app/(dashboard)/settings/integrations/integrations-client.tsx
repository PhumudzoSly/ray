"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Mail,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  getAllIntegrations,
  deleteIntegration,
  IntegrationConfig,
} from "@/actions/integration";
import { ResendIntegrationModal } from "./modals/resend-integration-modal";
import { LoopsIntegrationModal } from "./modals/loops-integration-modal";
import { GitHubIntegrationModal } from "./modals/github-integration-modal";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Integration = {
  id: string;
  name: string;
  type: string;
  config: IntegrationConfig;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
};

// Define supported platforms
const PLATFORMS = [
  {
    key: "resend",
    name: "Resend",
    category: "Email",
    icon: Mail,
    managementUrl: (integration: Integration) =>
      integration.config?.dashboardUrl || null,
  },
  {
    key: "loops",
    name: "Loops",
    category: "Email",
    icon: Mail,
    managementUrl: (integration: Integration) =>
      integration.config?.dashboardUrl || null,
  },
  {
    key: "github",
    name: "GitHub",
    category: "Code Hosting",
    icon: (props: any) => (
      <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.57.69.47C19.13 20.58 22 16.76 22 12.26 22 6.58 17.52 2 12 2z" />
      </svg>
    ),
    managementUrl: (integration: Integration) =>
      integration.config?.dashboardUrl || null,
  },
];

const CATEGORIES = ["Email", "Code Hosting"];

// Helper to get default config for each platform
function getDefaultConfig(type: string): IntegrationConfig {
  switch (type.toUpperCase()) {
    case "RESEND":
      return { apiKey: "", audienceId: "" };
    case "LOOPS":
      return { apiKey: "" };
    case "GITHUB":
      return { apiKey: "", repositories: [], webhookUrl: "" };
    default:
      return { apiKey: "" };
  }
}

// Type guard to ensure config is IntegrationConfig
function ensureIntegrationConfig(config: any): IntegrationConfig {
  if (!config || typeof config !== "object" || !("apiKey" in config)) {
    return { apiKey: "" };
  }
  return config as IntegrationConfig;
}

interface IntegrationsClientProps {
  successMessage?: string;
  errorMessage?: string;
}

export function IntegrationsClient({
  successMessage,
  errorMessage,
}: IntegrationsClientProps) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [editIntegration, setEditIntegration] = useState<Integration | null>(
    null
  );

  const {
    data: integrations,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const result = await getAllIntegrations();
      if (result.success) return result.data;
      throw new Error("Failed to load integrations");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteIntegration(id);
      if (!result.success) throw new Error("Failed to delete integration");
      return result;
    },
    onSuccess: () => {
      toast.success("Integration deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete integration");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setModalType("");
    setEditIntegration(null);
    queryClient.invalidateQueries({ queryKey: ["integrations"] });
    toast.success("Integration saved successfully");
  };

  // Group integrations by platform key
  const integrationsByPlatform: Record<string, Integration[]> = {};
  let safeIntegrations: Integration[] = [];

  // Map integration types to platform keys
  const getIntegrationPlatformKey = (type: string): string => {
    switch (type.toUpperCase()) {
      case "RESEND":
        return "resend";
      case "LOOPS":
        return "loops";
      case "GITHUB":
        return "github";
      default:
        return type.toLowerCase();
    }
  };
  if (integrations) {
    safeIntegrations = integrations.map((integration) => ({
      ...integration,
      createdAt:
        integration.createdAt instanceof Date
          ? integration.createdAt.toISOString()
          : integration.createdAt,
      updatedAt:
        integration.updatedAt instanceof Date
          ? integration.updatedAt.toISOString()
          : integration.updatedAt,
      config: ensureIntegrationConfig(integration.config),
    }));
    for (const integration of safeIntegrations) {
      const key = getIntegrationPlatformKey(integration.type);
      if (!integrationsByPlatform[key]) integrationsByPlatform[key] = [];
      integrationsByPlatform[key].push(integration);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Integrations
            </h1>
            <p className="text-muted-foreground">
              Connect your integrations to automatically sync data across
              platforms.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(decodeURIComponent(successMessage));
    }
    if (errorMessage) {
      toast.error(decodeURIComponent(errorMessage));
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Integrations
          </h1>
          <p className="text-muted-foreground">
            Connect your integrations to sync data across platforms.
          </p>
        </div>
      </div>
      <Separator />
      <div className="space-y-8">
        {CATEGORIES.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-2">{category}</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {PLATFORMS.filter((p) => p.category === category).map(
                (platform) => {
                  const Icon = platform.icon;
                  const platformIntegrations =
                    integrationsByPlatform[platform.key] || [];
                  return (
                    <Card
                      key={platform.key}
                      className="flex flex-col justify-between"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="p-2 rounded-lg bg-muted">
                            <Icon className="h-6 w-6 text-primary" />
                          </span>
                          <span className="font-medium text-base">
                            {platform.name}
                          </span>
                        </div>
                        {platformIntegrations.length === 0 ? (
                          <div className="text-muted-foreground text-sm mb-4">
                            No integrations connected.
                          </div>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {platformIntegrations.map((integration) => (
                              <div
                                key={integration.id}
                                className="flex items-center justify-between bg-muted/50 rounded px-3 py-2"
                              >
                                <span className="truncate">
                                  {integration.name}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {integration.isActive ? (
                                    <Badge
                                      variant="default"
                                      className="bg-green-100 text-green-800 hover:bg-green-100"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Inactive
                                    </Badge>
                                  )}
                                  {platform.managementUrl(integration) ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        window.open(
                                          platform.managementUrl(integration)!,
                                          "_blank"
                                        )
                                      }
                                      title="Manage on platform"
                                    >
                                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditIntegration(integration as any);
                                        setModalType(
                                          getIntegrationPlatformKey(
                                            integration.type
                                          )
                                        );
                                        setModalOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Manage
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(integration.id)}
                                    title="Delete integration"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="secondary"
                          className="w-full mt-2"
                          onClick={() => {
                            setEditIntegration({
                              id: "",
                              name: platform.name,
                              type: platform.key,
                              config: getDefaultConfig(platform.key),
                              isActive: true,
                              organizationId: "",
                              createdAt: "",
                              updatedAt: "",
                            });
                            setModalType(platform.key);
                            setModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {platform.name}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>
      {modalType === "resend" && (
        <ResendIntegrationModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setEditIntegration(null);
              setModalType("");
            }
          }}
          integration={editIntegration}
          onSuccess={handleModalSuccess}
        />
      )}
      {modalType === "loops" && (
        <LoopsIntegrationModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setEditIntegration(null);
              setModalType("");
            }
          }}
          integration={editIntegration}
          onSuccess={handleModalSuccess}
        />
      )}
      {modalType === "github" && (
        <GitHubIntegrationModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setEditIntegration(null);
              setModalType("");
            }
          }}
          integration={editIntegration}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
