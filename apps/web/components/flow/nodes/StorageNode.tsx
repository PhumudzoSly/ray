"use client";

import React, { useMemo } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { StorageNodeData, SpecializedNodeProps } from "./types";
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
import { Switch } from "@workspace/ui/components/switch";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  HardDrive,
  Cloud,
  File,
  Image,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Archive,
  Zap,
  Users,
  Settings,
} from "lucide-react";

export const StorageNode: React.FC<SpecializedNodeProps<StorageNodeData>> = ({
  data,
  selected,
  onDataChange,
  readOnly = false,
}) => {
  const nodeData = data as StorageNodeData;

  const handleDataChange = (updates: Partial<StorageNodeData>) => {
    onDataChange?.({ ...nodeData, ...updates });
  };

  const customHandles = useMemo(
    () => [
      {
        id: "file-in",
        type: "target" as const,
        position: "left" as const,
        label: "File",
        style: { background: "#3b82f6" },
      },
      {
        id: "metadata-in",
        type: "target" as const,
        position: "left" as const,
        label: "Metadata",
        style: { background: "#8b5cf6", top: "30%" },
      },
      {
        id: "user-in",
        type: "target" as const,
        position: "left" as const,
        label: "User",
        style: { background: "#10b981", top: "60%" },
      },
      {
        id: "stored-out",
        type: "source" as const,
        position: "right" as const,
        label: "Stored",
        style: { background: "#10b981" },
      },
      {
        id: "url-out",
        type: "source" as const,
        position: "right" as const,
        label: "URL",
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

  const getStorageTypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return <File className="w-4 h-4" />;
      case "object":
        return <HardDrive className="w-4 h-4" />;
      case "blob":
        return <Archive className="w-4 h-4" />;
      case "cdn":
        return <Globe className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    const providerIcons: Record<string, string> = {
      "aws-s3": "🟧",
      gcs: "🔵",
      azure: "🔷",
      local: "💾",
      cloudinary: "☁️",
    };
    return providerIcons[provider] || "☁️";
  };

  const getStatusIcon = () => {
    if (!nodeData.storageType)
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (!nodeData.provider)
      return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStorageScore = () => {
    let score = 0;
    if (nodeData.storageType) score += 20;
    if (nodeData.provider) score += 20;
    if (nodeData.permissions) score += 20;
    if (nodeData.encryption) score += 15;
    if (nodeData.backup?.enabled) score += 15;
    if (nodeData.cdn?.enabled) score += 10;
    return Math.min(score, 100);
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      "aws-s3": "Amazon S3",
      gcs: "Google Cloud Storage",
      azure: "Azure Blob Storage",
      local: "Local Storage",
      cloudinary: "Cloudinary",
    };
    return names[provider] || provider;
  };

  const expandedContent = (
    <div className="space-y-6">
      {/* Storage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStorageTypeIcon(nodeData.storageType)}
            Storage Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Storage Type</Label>
            <Select
              value={nodeData.storageType}
              onValueChange={(value) =>
                handleDataChange({ storageType: value as any })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File Storage</SelectItem>
                <SelectItem value="object">Object Storage</SelectItem>
                <SelectItem value="blob">Blob Storage</SelectItem>
                <SelectItem value="cdn">CDN Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={nodeData.provider}
              onValueChange={(value) =>
                handleDataChange({ provider: value as any })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aws-s3">Amazon S3</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="azure">Azure Blob Storage</SelectItem>
                <SelectItem value="local">Local Storage</SelectItem>
                <SelectItem value="cloudinary">Cloudinary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-4xl">{getProviderIcon(nodeData.provider)}</div>
            <div className="flex-1">
              <div className="font-medium">
                {getProviderName(nodeData.provider)}
              </div>
              <div className="text-sm text-muted-foreground">
                {nodeData.storageType.charAt(0).toUpperCase() +
                  nodeData.storageType.slice(1)}{" "}
                Storage
              </div>
            </div>
            <Badge variant="outline">
              {nodeData.provider === "local" ? "On-Premise" : "Cloud"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Encryption</Label>
            <Switch
              checked={nodeData.encryption || false}
              onCheckedChange={(checked) =>
                handleDataChange({ encryption: checked })
              }
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Access Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Read Permissions</Label>
              <Input
                value={nodeData.permissions?.read?.join(", ") || ""}
                onChange={(e) =>
                  handleDataChange({
                    permissions: {
                      ...nodeData.permissions,
                      read: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="admin, user, public"
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Write Permissions</Label>
              <Input
                value={nodeData.permissions?.write?.join(", ") || ""}
                onChange={(e) =>
                  handleDataChange({
                    permissions: {
                      ...nodeData.permissions,
                      write: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="admin, user"
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Delete Permissions</Label>
              <Input
                value={nodeData.permissions?.delete?.join(", ") || ""}
                onChange={(e) =>
                  handleDataChange({
                    permissions: {
                      ...nodeData.permissions,
                      delete: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="admin"
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-sm font-medium">Read</div>
              <div className="text-xs text-muted-foreground">
                {nodeData.permissions?.read?.length || 0} roles
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Write</div>
              <div className="text-xs text-muted-foreground">
                {nodeData.permissions?.write?.length || 0} roles
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Delete</div>
              <div className="text-xs text-muted-foreground">
                {nodeData.permissions?.delete?.length || 0} roles
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Backup Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Backup</Label>
            <Switch
              checked={nodeData.backup?.enabled || false}
              onCheckedChange={(checked) =>
                handleDataChange({
                  backup: {
                    ...nodeData.backup,
                    enabled: checked,
                  },
                })
              }
              disabled={readOnly}
            />
          </div>

          {nodeData.backup?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select
                  value={nodeData.backup?.frequency || "daily"}
                  onValueChange={(value) =>
                    handleDataChange({
                      backup: {
                        ...nodeData.backup,
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
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Retention Period (days)</Label>
                <Input
                  type="number"
                  value={nodeData.backup?.retention || 30}
                  onChange={(e) =>
                    handleDataChange({
                      backup: {
                        ...nodeData.backup,
                        retention: parseInt(e.target.value),
                      },
                    })
                  }
                  min="1"
                  max="365"
                  readOnly={readOnly}
                />
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Archive className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium">Backup Schedule</div>
                  <div className="text-sm text-muted-foreground">
                    {nodeData.backup?.frequency} backups,{" "}
                    {nodeData.backup?.retention} days retention
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* CDN Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            CDN Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable CDN</Label>
            <Switch
              checked={nodeData.cdn?.enabled || false}
              onCheckedChange={(checked) =>
                handleDataChange({
                  cdn: {
                    ...nodeData.cdn,
                    enabled: checked,
                  },
                })
              }
              disabled={readOnly}
            />
          </div>

          {nodeData.cdn?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Cache Control</Label>
                <Input
                  value={nodeData.cdn?.cacheControl || ""}
                  onChange={(e) =>
                    handleDataChange({
                      cdn: {
                        ...nodeData.cdn,
                        cacheControl: e.target.value,
                      },
                    })
                  }
                  placeholder="max-age=3600, public"
                  readOnly={readOnly}
                />
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Zap className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium">CDN Acceleration</div>
                  <div className="text-sm text-muted-foreground">
                    Global content delivery network enabled
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Storage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Storage</Label>
              <div className="text-sm text-muted-foreground">2.4 GB used</div>
            </div>
            <div className="space-y-2">
              <Label>Files Count</Label>
              <div className="text-sm text-muted-foreground">1,234 files</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bandwidth</Label>
              <div className="text-sm text-muted-foreground">
                45.2 GB this month
              </div>
            </div>
            <div className="space-y-2">
              <Label>Requests</Label>
              <div className="text-sm text-muted-foreground">
                12,456 requests
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Storage Active</span>
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Usage
              </Button>
              <Button variant="outline" size="sm">
                Manage Files
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
        label: nodeData.label || "File Storage",
        icon: getStorageTypeIcon(nodeData.storageType),
        color: "#059669",
        handles: customHandles,
        expandedContent,
        badges: [
          {
            text: `${getProviderIcon(nodeData.provider)} ${nodeData.provider}`,
            variant: "secondary" as const,
          },
          {
            text: nodeData.storageType,
            variant: "outline" as const,
          },
          {
            text: nodeData.encryption ? "Encrypted" : "No Encryption",
            variant: nodeData.encryption ? "default" : ("secondary" as const),
          },
          {
            text: `Score: ${getStorageScore()}%`,
            variant:
              getStorageScore() >= 80
                ? "default"
                : getStorageScore() >= 60
                  ? "secondary"
                  : "destructive",
          },
        ],
        status: {
          icon: getStatusIcon(),
          text:
            nodeData.storageType && nodeData.provider
              ? "Ready"
              : nodeData.storageType
                ? "Configured"
                : "Not Configured",
          variant:
            nodeData.storageType && nodeData.provider
              ? "success"
              : nodeData.storageType
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
