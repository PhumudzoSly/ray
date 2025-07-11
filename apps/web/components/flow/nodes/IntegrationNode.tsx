"use client";

import React, { useMemo } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { IntegrationNodeData, SpecializedNodeProps } from "./types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import {
  Link,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Key,
  Shield,
  MapPin,
  Zap,
  Globe,
  Database,
  ArrowLeftRight,
} from "lucide-react";

export const IntegrationNode: React.FC<
  SpecializedNodeProps<IntegrationNodeData>
> = ({ data, selected, onDataChange, readOnly = false }) => {
  const nodeData = data as IntegrationNodeData;

  const handleDataChange = (updates: Partial<IntegrationNodeData>) => {
    onDataChange?.({ ...nodeData, ...updates });
  };

  const customHandles = useMemo(
    () => [
      {
        id: "trigger-in",
        type: "target" as const,
        position: "left" as const,
        label: "Trigger",
        style: { background: "#10b981" },
      },
      {
        id: "data-in",
        type: "target" as const,
        position: "left" as const,
        label: "Data In",
        style: { background: "#3b82f6", top: "30%" },
      },
      {
        id: "config-in",
        type: "target" as const,
        position: "left" as const,
        label: "Config",
        style: { background: "#8b5cf6", top: "60%" },
      },
      {
        id: "success-out",
        type: "source" as const,
        position: "right" as const,
        label: "Success",
        style: { background: "#10b981" },
      },
      {
        id: "data-out",
        type: "source" as const,
        position: "right" as const,
        label: "Data Out",
        style: { background: "#3b82f6", top: "30%" },
      },
      {
        id: "error-out",
        type: "source" as const,
        position: "right" as const,
        label: "Error",
        style: { background: "#ef4444", top: "60%" },
      },
    ],
    []
  );

  const getServiceIcon = (service: string) => {
    const serviceIcons: Record<string, string> = {
      salesforce: "☁️",
      hubspot: "🟠",
      stripe: "💳",
      mailchimp: "📧",
      slack: "💬",
      zapier: "⚡",
      webhook: "🔗",
      "rest-api": "🌐",
      graphql: "📊",
      database: "🗄️",
      custom: "⚙️",
    };
    return serviceIcons[service] || "🔗";
  };

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "api-key":
        return <Key className="w-4 h-4" />;
      case "oauth":
        return <Shield className="w-4 h-4" />;
      case "basic-auth":
        return <Globe className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    if (!nodeData.service)
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (!nodeData.credentials)
      return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getIntegrationScore = () => {
    let score = 0;
    if (nodeData.service) score += 20;
    if (nodeData.credentials) score += 25;
    if (nodeData.apiVersion) score += 15;
    if (nodeData.mapping) score += 20;
    if (nodeData.syncSchedule) score += 20;
    return Math.min(score, 100);
  };

  const expandedContent = (
    <div className="space-y-6">
      {/* Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Service Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Service Name</Label>
            <Input
              value={nodeData.service}
              onChange={(e) => handleDataChange({ service: e.target.value })}
              placeholder="e.g., Salesforce, HubSpot, Stripe"
              readOnly={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>API Version</Label>
            <Input
              value={nodeData.apiVersion || ""}
              onChange={(e) => handleDataChange({ apiVersion: e.target.value })}
              placeholder="e.g., v2, 2023-10-16"
              readOnly={readOnly}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {getServiceIcon(nodeData.service.toLowerCase())}
            </div>
            <div className="flex-1">
              <div className="font-medium">{nodeData.service}</div>
              <div className="text-sm text-muted-foreground">
                {nodeData.apiVersion
                  ? `API Version: ${nodeData.apiVersion}`
                  : "No version specified"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Authentication & Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Authentication Type</Label>
            <Select
              value={nodeData.credentials?.type || "api-key"}
              onValueChange={(value) =>
                handleDataChange({
                  credentials: {
                    ...nodeData.credentials,
                    type: value as any,
                  },
                })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                <SelectItem value="basic-auth">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>API Endpoint</Label>
            <Input
              value={nodeData.credentials?.endpoint || ""}
              onChange={(e) =>
                handleDataChange({
                  credentials: {
                    ...nodeData.credentials,
                    endpoint: e.target.value,
                  },
                })
              }
              placeholder="https://api.service.com/v1"
              readOnly={readOnly}
            />
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            {getCredentialIcon(nodeData.credentials?.type || "api-key")}
            <div className="flex-1">
              <div className="font-medium">
                {nodeData.credentials?.type?.replace("-", " ").toUpperCase() ||
                  "API Key"}
              </div>
              <div className="text-sm text-muted-foreground">
                {nodeData.credentials?.endpoint || "No endpoint configured"}
              </div>
            </div>
            <Badge variant="outline">
              {nodeData.credentials ? "Configured" : "Not Set"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            Data Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inbound Mapping (JSON)</Label>
              <Textarea
                value={JSON.stringify(nodeData.mapping?.inbound || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleDataChange({
                      mapping: {
                        ...nodeData.mapping,
                        inbound: parsed,
                      },
                    });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"external_id": "id", "name": "full_name"}'
                className="font-mono text-sm"
                rows={6}
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Outbound Mapping (JSON)</Label>
              <Textarea
                value={JSON.stringify(
                  nodeData.mapping?.outbound || {},
                  null,
                  2
                )}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleDataChange({
                      mapping: {
                        ...nodeData.mapping,
                        outbound: parsed,
                      },
                    });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"id": "external_id", "full_name": "name"}'
                className="font-mono text-sm"
                rows={6}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <MapPin className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium">Field Mapping</div>
              <div className="text-sm text-muted-foreground">
                {nodeData.mapping?.inbound && nodeData.mapping?.outbound
                  ? `${Object.keys(nodeData.mapping.inbound).length} inbound, ${Object.keys(nodeData.mapping.outbound).length} outbound fields`
                  : "No field mappings configured"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <Select
              value={nodeData.syncSchedule?.frequency || "hourly"}
              onValueChange={(value) =>
                handleDataChange({
                  syncSchedule: {
                    ...nodeData.syncSchedule,
                    frequency: value as any,
                  },
                })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-time">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Batch Size</Label>
            <Input
              type="number"
              value={nodeData.syncSchedule?.batchSize || 100}
              onChange={(e) =>
                handleDataChange({
                  syncSchedule: {
                    ...nodeData.syncSchedule,
                    batchSize: parseInt(e.target.value),
                  },
                })
              }
              min="1"
              max="10000"
              placeholder="100"
              readOnly={readOnly}
            />
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <RefreshCw className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium">
                {nodeData.syncSchedule?.frequency
                  ?.replace("-", " ")
                  .toUpperCase() || "HOURLY"}{" "}
                Sync
              </div>
              <div className="text-sm text-muted-foreground">
                Batch size: {nodeData.syncSchedule?.batchSize || 100} records
              </div>
            </div>
            <Badge
              variant={
                nodeData.syncSchedule?.frequency === "real-time"
                  ? "default"
                  : "secondary"
              }
            >
              {nodeData.syncSchedule?.frequency === "real-time"
                ? "Live"
                : "Scheduled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last Sync</Label>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Records Synced</Label>
              <div className="text-sm text-muted-foreground">1,234 records</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Connection Active</span>
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <BaseFlowNode
      data={{
        ...nodeData,
        label: nodeData.label || "Integration",
        icon: <Link className="w-4 h-4" />,
        color: "#06b6d4",
        handles: customHandles,
        expandedContent,
        badges: [
          {
            text: `${getServiceIcon(nodeData.service.toLowerCase())} ${nodeData.service}`,
            variant: "secondary" as const,
          },
          {
            text: nodeData.credentials?.type || "No Auth",
            variant: "outline" as const,
          },
          {
            text: nodeData.syncSchedule?.frequency || "No Schedule",
            variant: "outline" as const,
          },
          {
            text: `Score: ${getIntegrationScore()}%`,
            variant:
              getIntegrationScore() >= 80
                ? "default"
                : getIntegrationScore() >= 60
                  ? "secondary"
                  : "destructive",
          },
        ],
        status: {
          icon: getStatusIcon(),
          text:
            nodeData.service && nodeData.credentials
              ? "Connected"
              : nodeData.service
                ? "Configured"
                : "Not Configured",
          variant:
            nodeData.service && nodeData.credentials
              ? "success"
              : nodeData.service
                ? "warning"
                : "error",
        },
      }}
      selected={selected}
      onDataChange={onDataChange}
      readOnly={readOnly}
    />
  );
};
