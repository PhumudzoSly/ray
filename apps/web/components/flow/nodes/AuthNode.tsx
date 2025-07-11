"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import {
  AuthNodeData,
  SpecializedNodeProps,
  HandleConfig,
  BaseNodeData,
} from "./types";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Shield, Key, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthNode(props: SpecializedNodeProps<AuthNodeData>) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for auth node
  const authHandles: HandleConfig[] = [
    {
      id: "user-input",
      type: "target",
      position: "top",
      label: "User Input",
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
      id: "failure-output",
      type: "source",
      position: "bottom",
      label: "Failure",
      className: "!bg-red-500",
    },
    {
      id: "redirect-output",
      type: "source",
      position: "left",
      label: "Redirect",
      className: "!bg-purple-500",
    },
  ];

  const handleAuthMethodChange = (method: AuthNodeData["authMethod"]) => {
    onDataChange?.({
      authMethod: method,
      // Reset providers when changing method
      providers: method === "oauth" ? data.providers : undefined,
    });
  };

  const handleProviderToggle = (provider: string) => {
    if (!data.providers) return;

    const newProviders = data.providers.includes(provider)
      ? data.providers.filter((p) => p !== provider)
      : [...data.providers, provider];

    onDataChange?.({ providers: newProviders });
  };

  const handlePasswordPolicyChange = (field: string, value: any) => {
    const currentPolicy = data.passwordPolicy || {
      minLength: 8,
      requireSpecialChars: false,
      requireNumbers: false,
      requireUppercase: false,
    };

    onDataChange?.({
      passwordPolicy: {
        ...currentPolicy,
        [field]: value,
      },
    });
  };

  const authMethodIcons = {
    email: "Mail",
    oauth: "Globe",
    "magic-link": "Link",
    "multi-factor": "Shield",
  };

  const authMethodColors = {
    email: "bg-blue-500",
    oauth: "bg-green-500",
    "magic-link": "bg-purple-500",
    "multi-factor": "bg-red-500",
  };

  const oauthProviders = [
    "google",
    "github",
    "facebook",
    "twitter",
    "linkedin",
    "discord",
    "apple",
  ];

  return (
    <BaseFlowNode
      {...props}
      handles={authHandles}
      nodeIcon={authMethodIcons[data.authMethod] || "Shield"}
      nodeColor={authMethodColors[data.authMethod] || "bg-blue-500"}
      className="min-w-[280px] max-w-[400px]"
      showDefaultHandles={false}
      onDataChange={
        onDataChange as ((data: Partial<BaseNodeData>) => void) | undefined
      }
    >
      <div className="space-y-3">
        {/* Auth Method Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Authentication</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.authMethod.replace("-", " ")}
          </Badge>
        </div>

        {!isReadOnly && (
          <Select
            value={data.authMethod}
            onValueChange={handleAuthMethodChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email/Password</SelectItem>
              <SelectItem value="oauth">OAuth</SelectItem>
              <SelectItem value="magic-link">Magic Link</SelectItem>
              <SelectItem value="multi-factor">Multi-Factor</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* OAuth Providers */}
        {data.authMethod === "oauth" && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">OAuth Providers</Label>
            <div className="grid grid-cols-2 gap-1">
              {oauthProviders.map((provider) => (
                <Button
                  key={provider}
                  variant={
                    data.providers?.includes(provider) ? "default" : "outline"
                  }
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => !isReadOnly && handleProviderToggle(provider)}
                  disabled={isReadOnly}
                >
                  {provider}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Session Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs">Session (hours)</Label>
          </div>
          {!isReadOnly ? (
            <Input
              type="number"
              value={data.sessionDuration || 24}
              onChange={(e) =>
                onDataChange?.({ sessionDuration: Number(e.target.value) })
              }
              className="w-16 h-7 text-xs"
              min="1"
              max="8760"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              {data.sessionDuration || 24}h
            </span>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs">Two-Factor Auth</Label>
          </div>
          {!isReadOnly ? (
            <Switch
              checked={data.twoFactorEnabled || false}
              onCheckedChange={(checked) =>
                onDataChange?.({ twoFactorEnabled: checked })
              }
            />
          ) : (
            <Badge
              variant={data.twoFactorEnabled ? "default" : "secondary"}
              className="text-xs"
            >
              {data.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          )}
        </div>

        {/* Password Policy (for email auth) */}
        {data.authMethod === "email" && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs p-0 font-medium"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={isReadOnly}
            >
              Password Policy {isExpanded ? "▼" : "▶"}
            </Button>

            {isExpanded && (
              <Card className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Min Length</Label>
                  {!isReadOnly ? (
                    <Input
                      type="number"
                      value={data.passwordPolicy?.minLength || 8}
                      onChange={(e) =>
                        handlePasswordPolicyChange(
                          "minLength",
                          Number(e.target.value)
                        )
                      }
                      className="w-16 h-6 text-xs"
                      min="4"
                      max="128"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {data.passwordPolicy?.minLength || 8}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {[
                    { key: "requireSpecialChars", label: "Special Characters" },
                    { key: "requireNumbers", label: "Numbers" },
                    { key: "requireUppercase", label: "Uppercase" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label className="text-xs">{label}</Label>
                      {!isReadOnly ? (
                        <Switch
                          checked={
                            Boolean(
                              data.passwordPolicy?.[
                                key as keyof typeof data.passwordPolicy
                              ]
                            ) || false
                          }
                          onCheckedChange={(checked) =>
                            handlePasswordPolicyChange(key, checked)
                          }
                        />
                      ) : (
                        <Badge
                          variant={
                            data.passwordPolicy?.[
                              key as keyof typeof data.passwordPolicy
                            ]
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {data.passwordPolicy?.[
                            key as keyof typeof data.passwordPolicy
                          ]
                            ? "Yes"
                            : "No"}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Redirect URLs */}
        {data.redirectUrls && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Redirect URLs</Label>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700"
                >
                  Success
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {data.redirectUrls.success || "/dashboard"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-red-50 text-red-700"
                >
                  Failure
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {data.redirectUrls.failure || "/login"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Security Indicators */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {data.twoFactorEnabled && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700"
              >
                2FA
              </Badge>
            )}
            {data.passwordPolicy?.requireSpecialChars && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700"
              >
                Strong
              </Badge>
            )}
            {data.authMethod === "oauth" &&
              data.providers &&
              data.providers.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700"
                >
                  OAuth
                </Badge>
              )}
          </div>

          {/* Security Score */}
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getSecurityScore(data)}/100
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}

// Helper function to calculate security score
function getSecurityScore(data: AuthNodeData): number {
  let score = 0;

  // Base score for auth method
  const methodScores = {
    email: 20,
    oauth: 30,
    "magic-link": 25,
    "multi-factor": 40,
  };
  score += methodScores[data.authMethod];

  // Two-factor authentication
  if (data.twoFactorEnabled) score += 30;

  // Password policy (for email auth)
  if (data.authMethod === "email" && data.passwordPolicy) {
    const policy = data.passwordPolicy;
    if (policy.minLength >= 8) score += 10;
    if (policy.requireSpecialChars) score += 5;
    if (policy.requireNumbers) score += 5;
    if (policy.requireUppercase) score += 5;
  }

  // OAuth providers
  if (
    data.authMethod === "oauth" &&
    data.providers &&
    data.providers.length > 0
  ) {
    score += Math.min(data.providers.length * 5, 15);
  }

  return Math.min(score, 100);
}
