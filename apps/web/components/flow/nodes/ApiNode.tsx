"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { ApiNodeData, SpecializedNodeProps, HandleConfig } from "./types";
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
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Globe,
  Clock,
  Shield,
  Zap,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ApiNode(props: SpecializedNodeProps<ApiNodeData>) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for API node
  const apiHandles: HandleConfig[] = [
    {
      id: "request-input",
      type: "target",
      position: "top",
      label: "Request",
      className: "!bg-blue-500",
    },
    {
      id: "success-output",
      type: "source",
      position: "right",
      label: "Success",
      className: "!bg-green-500",
    },
    {
      id: "error-output",
      type: "source",
      position: "bottom",
      label: "Error",
      className: "!bg-red-500",
    },
    {
      id: "timeout-output",
      type: "source",
      position: "left",
      label: "Timeout",
      className: "!bg-orange-500",
    },
  ];

  const handleMethodChange = (method: ApiNodeData["method"]) => {
    onDataChange?.({ method });
  };

  const handleEndpointChange = (endpoint: string) => {
    onDataChange?.({ endpoint });
  };

  const handleAuthChange = (authentication: ApiNodeData["authentication"]) => {
    onDataChange?.({ authentication });
  };

  const handleRateLimitChange = (field: string, value: number) => {
    onDataChange?.({
      rateLimit: {
        ...data.rateLimit,
        [field]: value,
      },
    });
  };

  const handleRetryPolicyChange = (field: string, value: any) => {
    onDataChange?.({
      retryPolicy: {
        ...data.retryPolicy,
        [field]: value,
      },
    });
  };

  const methodColors = {
    GET: "bg-green-500",
    POST: "bg-blue-500",
    PUT: "bg-yellow-500",
    DELETE: "bg-red-500",
    PATCH: "bg-purple-500",
  };

  const methodIcons = {
    GET: "Download",
    POST: "Upload",
    PUT: "Edit",
    DELETE: "Trash",
    PATCH: "Settings",
  };

  const authIcons = {
    bearer: "Key",
    "api-key": "Lock",
    oauth: "Globe",
    none: "Unlock",
  };

  const getStatusColor = () => {
    if (!data.endpoint) return "bg-gray-500";
    if (data.timeout && data.timeout < 5000) return "bg-red-500";
    if (data.rateLimit && data.rateLimit.requests > 1000)
      return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <BaseFlowNode
      {...props}
      handles={apiHandles}
      nodeIcon={methodIcons[data.method] || "Globe"}
      nodeColor={methodColors[data.method] || "bg-blue-500"}
      className="min-w-[300px] max-w-[450px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* HTTP Method and Endpoint */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">API Endpoint</span>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs text-white", methodColors[data.method])}
            >
              {data.method}
            </Badge>
          </div>

          <div className="flex gap-2">
            {!isReadOnly && (
              <Select value={data.method} onValueChange={handleMethodChange}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            )}

            {!isReadOnly ? (
              <Input
                placeholder="/api/endpoint"
                value={data.endpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
            ) : (
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-xs">
                {data.endpoint || "/api/endpoint"}
              </div>
            )}
          </div>
        </div>

        {/* Authentication */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs">Authentication</Label>
          </div>
          {!isReadOnly ? (
            <Select
              value={data.authentication || "none"}
              onValueChange={handleAuthChange}
            >
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer</SelectItem>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="oauth">OAuth</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="text-xs">
              {data.authentication || "none"}
            </Badge>
          )}
        </div>

        {/* Timeout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs">Timeout (ms)</Label>
          </div>
          {!isReadOnly ? (
            <Input
              type="number"
              value={data.timeout || 5000}
              onChange={(e) =>
                onDataChange?.({ timeout: Number(e.target.value) })
              }
              className="w-20 h-7 text-xs"
              min="1000"
              max="60000"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              {data.timeout || 5000}ms
            </span>
          )}
        </div>

        {/* Rate Limiting */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Rate Limit</Label>
            </div>
            <Switch
              checked={!!data.rateLimit}
              onCheckedChange={(checked) =>
                onDataChange?.({
                  rateLimit: checked
                    ? { requests: 100, window: 60 }
                    : undefined,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          {data.rateLimit && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Requests</Label>
                {!isReadOnly ? (
                  <Input
                    type="number"
                    value={data.rateLimit.requests}
                    onChange={(e) =>
                      handleRateLimitChange("requests", Number(e.target.value))
                    }
                    className="h-7 text-xs"
                    min="1"
                  />
                ) : (
                  <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                    {data.rateLimit.requests}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-xs">Window (s)</Label>
                {!isReadOnly ? (
                  <Input
                    type="number"
                    value={data.rateLimit.window}
                    onChange={(e) =>
                      handleRateLimitChange("window", Number(e.target.value))
                    }
                    className="h-7 text-xs"
                    min="1"
                  />
                ) : (
                  <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                    {data.rateLimit.window}s
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Retry Policy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Retry Policy</Label>
            </div>
            <Switch
              checked={!!data.retryPolicy}
              onCheckedChange={(checked) =>
                onDataChange?.({
                  retryPolicy: checked
                    ? { maxRetries: 3, backoffStrategy: "exponential" }
                    : undefined,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          {data.retryPolicy && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Max Retries</Label>
                {!isReadOnly ? (
                  <Input
                    type="number"
                    value={data.retryPolicy.maxRetries}
                    onChange={(e) =>
                      handleRetryPolicyChange(
                        "maxRetries",
                        Number(e.target.value)
                      )
                    }
                    className="h-7 text-xs"
                    min="1"
                    max="10"
                  />
                ) : (
                  <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                    {data.retryPolicy.maxRetries}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-xs">Strategy</Label>
                {!isReadOnly ? (
                  <Select
                    value={data.retryPolicy.backoffStrategy}
                    onValueChange={(value) =>
                      handleRetryPolicyChange("backoffStrategy", value)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                    {data.retryPolicy.backoffStrategy}
                  </div>
                )}
              </div>
            </div>
          )}
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
            Advanced Config {isExpanded ? "▼" : "▶"}
          </Button>

          {isExpanded && (
            <Card className="p-3 space-y-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Request Schema</Label>
                {!isReadOnly ? (
                  <Textarea
                    placeholder="JSON schema for request validation..."
                    value={
                      data.requestSchema
                        ? JSON.stringify(data.requestSchema, null, 2)
                        : ""
                    }
                    onChange={(e) => {
                      try {
                        const schema = e.target.value
                          ? JSON.parse(e.target.value)
                          : undefined;
                        onDataChange?.({ requestSchema: schema });
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="text-xs font-mono"
                    rows={3}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {data.requestSchema
                      ? JSON.stringify(data.requestSchema, null, 2)
                      : "No schema defined"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Response Schema</Label>
                {!isReadOnly ? (
                  <Textarea
                    placeholder="JSON schema for response validation..."
                    value={
                      data.responseSchema
                        ? JSON.stringify(data.responseSchema, null, 2)
                        : ""
                    }
                    onChange={(e) => {
                      try {
                        const schema = e.target.value
                          ? JSON.parse(e.target.value)
                          : undefined;
                        onDataChange?.({ responseSchema: schema });
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="text-xs font-mono"
                    rows={3}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {data.responseSchema
                      ? JSON.stringify(data.responseSchema, null, 2)
                      : "No schema defined"}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {data.authentication && data.authentication !== "none" && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700"
              >
                Secured
              </Badge>
            )}
            {data.rateLimit && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700"
              >
                Rate Limited
              </Badge>
            )}
            {data.retryPolicy && (
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700"
              >
                Retry
              </Badge>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
            <span className="text-xs text-muted-foreground">
              {getStatusText(data)}
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}

// Helper function to get status text
function getStatusText(data: ApiNodeData): string {
  if (!data.endpoint) return "Not configured";
  if (data.timeout && data.timeout < 5000) return "Fast timeout";
  if (data.rateLimit && data.rateLimit.requests > 1000)
    return "High rate limit";
  return "Ready";
}
