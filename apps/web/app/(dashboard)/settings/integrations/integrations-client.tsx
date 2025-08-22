"use client";

// Removed getAllIntegrations import - data fetching now handled in modals
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AVAILABLE_INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  getIntegrationsByCategory,
  type IntegrationDefinition,
} from "@/lib/integrations-config";
import { ResendIntegrationModal } from "@/components/settings/resend-integration-modal";
import { LoopsIntegrationModal } from "@/components/settings/loops-integration-modal";

interface IntegrationsClientProps {
  success?: string;
  error?: string;
}

export function IntegrationsClient({
  success,
  error,
}: IntegrationsClientProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Show success/error messages
  if (success) {
    toast.success(success);
  }
  if (error) {
    toast.error(error);
  }

  // Delete functionality moved to individual modals

  const handleOpenModal = (integrationDef: IntegrationDefinition) => {
    setActiveModal(integrationDef.id);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Connection status will be handled within individual modals

  const renderIntegrationItem = (integrationDef: IntegrationDefinition) => {
    return (
      <div
        key={integrationDef.id}
        className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm sm:text-base truncate">
                {integrationDef.name}
              </h3>
              <a
                href={`https://${integrationDef.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground overflow-hidden">
              <span className="line-clamp-2">{integrationDef.description}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <Button
            onClick={() => handleOpenModal(integrationDef)}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Manage</span>
            <span className="sm:hidden">Open</span>
          </Button>
        </div>
      </div>
    );
  };

  // No loading states needed - static list

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect and manage your favorite tools and services
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="developer-tools">Developer</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="bg-card rounded-lg border overflow-hidden">
            {AVAILABLE_INTEGRATIONS.map((integration, index) => (
              <div key={integration.id}>
                {renderIntegrationItem(integration)}
                {index < AVAILABLE_INTEGRATIONS.length - 1 && (
                  <div className="border-b border-border" />
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {Object.entries(INTEGRATION_CATEGORIES).map(
          ([categoryKey, categoryInfo]) => {
            const categoryIntegrations = getIntegrationsByCategory(
              categoryKey as keyof typeof INTEGRATION_CATEGORIES
            );
            return (
              <TabsContent
                key={categoryKey}
                value={categoryKey}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold">{categoryInfo.name}</h2>
                  <p className="text-muted-foreground">
                    {categoryInfo.description}
                  </p>
                </div>
                <div className="bg-card rounded-lg border overflow-hidden">
                  {categoryIntegrations.map((integration, index) => (
                    <div key={integration.id}>
                      {renderIntegrationItem(integration)}
                      {index < categoryIntegrations.length - 1 && (
                        <div className="border-b border-border" />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          }
        )}
      </Tabs>

      {/* Modals */}
      {activeModal === "resend" && (
        <ResendIntegrationModal isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "loops" && (
        <LoopsIntegrationModal isOpen={true} onClose={closeModal} />
      )}
    </div>
  );
}
