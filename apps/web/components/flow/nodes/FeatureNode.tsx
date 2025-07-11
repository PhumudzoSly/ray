"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { FeatureNodeData, SpecializedNodeProps, HandleConfig } from "./types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
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
import { Card } from "@workspace/ui/components/card";
import { Slider } from "@workspace/ui/components/slider";
import { Zap, Users, Code, Globe, Flag, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureNode(props: SpecializedNodeProps<FeatureNodeData>) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for feature node
  const featureHandles: HandleConfig[] = [
    {
      id: "user-input",
      type: "target",
      position: "top",
      label: "User Access",
      className: "!bg-blue-500",
    },
    {
      id: "feature-output",
      type: "source",
      position: "right",
      label: "Feature",
      className: "!bg-green-500",
    },
    {
      id: "api-output",
      type: "source",
      position: "bottom",
      label: "API",
      className: "!bg-purple-500",
    },
    {
      id: "ui-output",
      type: "source",
      position: "left",
      label: "UI",
      className: "!bg-orange-500",
    },
  ];

  const handleFeatureTypeChange = (
    featureType: FeatureNodeData["featureType"]
  ) => {
    onDataChange?.({ featureType });
  };

  const handlePermissionChange = (permissions: string[]) => {
    onDataChange?.({ permissions });
  };

  const handleFeatureFlagChange = (field: string, value: any) => {
    onDataChange?.({
      featureFlags: {
        ...data.featureFlags,
        [field]: value,
      },
    });
  };

  const handleDependencyChange = (dependencies: string[]) => {
    onDataChange?.({ dependencies });
  };

  const handleApiEndpointChange = (apiEndpoints: string[]) => {
    onDataChange?.({ apiEndpoints });
  };

  const handleUiComponentChange = (uiComponents: string[]) => {
    onDataChange?.({ uiComponents });
  };

  const featureTypeColors = {
    core: "bg-blue-500",
    premium: "bg-purple-500",
    experimental: "bg-orange-500",
    deprecated: "bg-red-500",
  };

  const featureTypeIcons = {
    core: "Zap",
    premium: "Crown",
    experimental: "Flask",
    deprecated: "AlertTriangle",
  };

  const getFeatureScore = () => {
    let score = 0;

    // Base score by type
    const typeScores = {
      core: 40,
      premium: 60,
      experimental: 20,
      deprecated: 10,
    };
    score += typeScores[data.featureType];

    // Feature flags
    if (data.featureFlags?.enabled) score += 20;
    if (
      data.featureFlags?.rolloutPercentage &&
      data.featureFlags.rolloutPercentage > 50
    )
      score += 10;

    // Components and endpoints
    if (data.apiEndpoints && data.apiEndpoints.length > 0) score += 15;
    if (data.uiComponents && data.uiComponents.length > 0) score += 15;

    return Math.min(score, 100);
  };

  const getRolloutStatus = () => {
    if (!data.featureFlags?.enabled) return "Disabled";
    if (!data.featureFlags.rolloutPercentage) return "Full Release";
    if (data.featureFlags.rolloutPercentage < 25) return "Limited";
    if (data.featureFlags.rolloutPercentage < 75) return "Gradual";
    return "Wide Release";
  };

  return (
    <BaseFlowNode
      {...props}
      handles={featureHandles}
      nodeIcon={featureTypeIcons[data.featureType] || "Zap"}
      nodeColor={featureTypeColors[data.featureType] || "bg-blue-500"}
      className="min-w-[340px] max-w-[480px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* Feature Type and Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Feature Configuration</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs text-white",
                featureTypeColors[data.featureType]
              )}
            >
              {data.featureType}
            </Badge>
          </div>

          {!isReadOnly && (
            <Select
              value={data.featureType}
              onValueChange={handleFeatureTypeChange}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core Feature</SelectItem>
                <SelectItem value="premium">Premium Feature</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Feature Flags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Feature Flags</Label>
            </div>
            <Switch
              checked={data.featureFlags?.enabled || false}
              onCheckedChange={(checked) =>
                handleFeatureFlagChange("enabled", checked)
              }
              disabled={isReadOnly}
            />
          </div>

          {data.featureFlags?.enabled && (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rollout Percentage</Label>
                  <span className="text-xs text-muted-foreground">
                    {data.featureFlags.rolloutPercentage || 100}%
                  </span>
                </div>
                {!isReadOnly ? (
                  <Slider
                    value={[data.featureFlags.rolloutPercentage || 100]}
                    onValueChange={(value) =>
                      handleFeatureFlagChange("rolloutPercentage", value[0])
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                ) : (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${data.featureFlags.rolloutPercentage || 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Rollout Status</Label>
                <Badge variant="outline" className="text-xs">
                  {getRolloutStatus()}
                </Badge>
              </div>

              {/* Target Users */}
              <div className="space-y-1">
                <Label className="text-xs">Target Users</Label>
                {!isReadOnly ? (
                  <Input
                    value={data.featureFlags.targetUsers?.join(", ") || ""}
                    onChange={(e) => {
                      const users = e.target.value
                        .split(",")
                        .map((u) => u.trim())
                        .filter((u) => u);
                      handleFeatureFlagChange("targetUsers", users);
                    }}
                    className="h-7 text-xs"
                    placeholder="user1, user2, admin"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {data.featureFlags.targetUsers?.join(", ") || "All users"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Permissions</Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.permissions?.length || 0} roles
            </Badge>
          </div>

          {!isReadOnly ? (
            <Input
              value={data.permissions?.join(", ") || ""}
              onChange={(e) => {
                const permissions = e.target.value
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p);
                handlePermissionChange(permissions);
              }}
              className="h-7 text-xs"
              placeholder="admin, user, premium"
            />
          ) : (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {data.permissions?.join(", ") || "No permissions required"}
            </div>
          )}
        </div>

        {/* Dependencies */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Dependencies</Label>
          {!isReadOnly ? (
            <Input
              value={data.dependencies?.join(", ") || ""}
              onChange={(e) => {
                const deps = e.target.value
                  .split(",")
                  .map((d) => d.trim())
                  .filter((d) => d);
                handleDependencyChange(deps);
              }}
              className="h-7 text-xs"
              placeholder="auth-feature, payment-system"
            />
          ) : (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {data.dependencies?.join(", ") || "No dependencies"}
            </div>
          )}
        </div>

        {/* Technical Components */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">API Endpoints</Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.apiEndpoints?.length || 0} endpoints
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">UI Components</Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.uiComponents?.length || 0} components
            </Badge>
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs p-0 font-medium"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isReadOnly}
          >
            Technical Details {isExpanded ? "▼" : "▶"}
          </Button>

          {isExpanded && (
            <Card className="p-3 space-y-3">
              {/* API Endpoints */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">API Endpoints</Label>
                {!isReadOnly ? (
                  <div className="space-y-1">
                    <Input
                      value={data.apiEndpoints?.join("\n") || ""}
                      onChange={(e) => {
                        const endpoints = e.target.value
                          .split("\n")
                          .map((e) => e.trim())
                          .filter((e) => e);
                        handleApiEndpointChange(endpoints);
                      }}
                      className="h-16 text-xs font-mono"
                      placeholder="/api/feature/action&#10;/api/feature/status"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                    {data.apiEndpoints?.join("\n") || "No API endpoints"}
                  </div>
                )}
              </div>

              {/* UI Components */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">UI Components</Label>
                {!isReadOnly ? (
                  <Input
                    value={data.uiComponents?.join(", ") || ""}
                    onChange={(e) => {
                      const components = e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c);
                      handleUiComponentChange(components);
                    }}
                    className="h-7 text-xs"
                    placeholder="FeatureButton, FeatureModal, FeatureCard"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {data.uiComponents?.join(", ") || "No UI components"}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Feature Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {data.featureFlags?.enabled && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700"
              >
                Flagged
              </Badge>
            )}
            {data.permissions && data.permissions.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700"
              >
                Protected
              </Badge>
            )}
            {data.featureType === "experimental" && (
              <Badge
                variant="outline"
                className="text-xs bg-orange-50 text-orange-700"
              >
                Beta
              </Badge>
            )}
          </div>

          {/* Feature Score */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getFeatureScore()}/100
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
