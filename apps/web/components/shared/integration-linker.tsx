"use client";

import { useState, useEffect } from "react";
import { Switch } from "@workspace/ui/switch";
import { Label } from "@workspace/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/select";
import { Button } from "@workspace/ui/button";
import { Badge } from "@workspace/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import {
  getIntegrationsForPurpose,
  createIntegrationUsage,
  deleteIntegrationUsage,
  getIntegrationUsage,
  getAvailablePurposes,
} from "@/actions/integration/usage";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface IntegrationLinkerProps {
  entityType: string;
  entityId: string;
  purpose: string;
  label?: string;
  description?: string;
  onSuccess?: () => void;
}

export function IntegrationLinker({
  entityType,
  entityId,
  purpose,
  label,
  description,
  onSuccess,
}: IntegrationLinkerProps) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<
    string | null
  >(null);

  const purposes = getAvailablePurposes();
  const purposeInfo = purposes.find((p) => p.value === purpose);

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ["integrations-for-purpose", purpose],
    queryFn: async () => {
      const res = await getIntegrationsForPurpose(purpose);
      if (res.success) return res.data || [];
      throw new Error("Failed to load integrations");
    },
    enabled: !!entityId,
  });

  const {
    data: usage,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["integration-usage", entityType, entityId, purpose],
    queryFn: async () => {
      const res = await getIntegrationUsage(entityType, entityId, purpose);
      if (res.success && res.data) return res.data;
      return null;
    },
    enabled: !!entityId,
    onSuccess: (data) => {
      setEnabled(!!data?.isActive);
      setSelectedIntegrationId(data?.integrationId || null);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (usageId: string) => {
      await deleteIntegrationUsage(usageId);
    },
    onSuccess: () => {
      toast.success("Integration unlinked successfully");
      setSelectedIntegrationId(null);
      setEnabled(false);
      refetchUsage();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to unlink integration");
      setEnabled(true); // Revert the toggle
    },
  });

  const linkMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Remove existing usage if any
      if (usage?.id) {
        await deleteIntegrationUsage(usage.id);
      }
      await createIntegrationUsage({
        integrationId,
        entityType,
        entityId,
        purpose,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast.success("Integration linked successfully");
      setEnabled(true);
      refetchUsage();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to link integration");
      setSelectedIntegrationId(null);
    },
  });

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked && usage?.id) {
      unlinkMutation.mutate(usage.id);
    }
  };

  const handleIntegrationChange = (integrationId: string) => {
    if (!integrationId) return;
    setSelectedIntegrationId(integrationId);
    linkMutation.mutate(integrationId);
  };

  if (integrationsLoading || usageLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium">
              {label || purposeInfo?.label || purpose}
            </div>
            <div className="text-xs text-muted-foreground">
              {description || purposeInfo?.description}
            </div>
          </div>
          <div className="h-4 w-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-sm font-medium">
            {label || purposeInfo?.label || purpose}
          </div>
          <div className="text-xs text-muted-foreground">
            {description || purposeInfo?.description}
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={linkMutation.isPending || unlinkMutation.isPending}
        />
      </div>

      {enabled && (
        <div className="space-y-2">
          <Label>Integration</Label>
          <Select
            value={selectedIntegrationId || ""}
            onValueChange={handleIntegrationChange}
            disabled={linkMutation.isPending || unlinkMutation.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an integration" />
            </SelectTrigger>
            <SelectContent>
              {!integrations || integrations.length === 0 ? (
                <SelectItem value="no-integrations" disabled>
                  No integrations available
                </SelectItem>
              ) : (
                integrations &&
                integrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.id}>
                    <div className="flex items-center gap-2">
                      <span>{integration.name}</span>
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
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            <a
              href="/settings/integrations"
              className="text-primary hover:underline"
            >
              Manage integrations
            </a>{" "}
            to connect your {purposeInfo?.label?.toLowerCase() || purpose}{" "}
            platform
          </p>
        </div>
      )}
    </div>
  );
}
