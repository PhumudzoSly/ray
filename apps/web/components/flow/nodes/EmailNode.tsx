"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { EmailNodeData, SpecializedNodeProps, HandleConfig } from "./types";
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
import { Mail, Send, Clock, BarChart, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmailNode(props: SpecializedNodeProps<EmailNodeData>) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for email node
  const emailHandles: HandleConfig[] = [
    {
      id: "trigger-input",
      type: "target",
      position: "top",
      label: "Trigger",
      className: "!bg-blue-500",
    },
    {
      id: "sent-output",
      type: "source",
      position: "right",
      label: "Sent",
      className: "!bg-green-500",
    },
    {
      id: "failed-output",
      type: "source",
      position: "bottom",
      label: "Failed",
      className: "!bg-red-500",
    },
    {
      id: "scheduled-output",
      type: "source",
      position: "left",
      label: "Scheduled",
      className: "!bg-purple-500",
    },
  ];

  const handleProviderChange = (provider: EmailNodeData["provider"]) => {
    onDataChange?.({ provider });
  };

  const handleTemplateChange = (field: string, value: any) => {
    onDataChange?.({
      template: {
        ...data.template,
        [field]: value,
      },
    });
  };

  const handleRecipientsChange = (field: string, value: string[]) => {
    onDataChange?.({
      recipients: {
        ...data.recipients,
        [field]: value,
      },
    });
  };

  const handleSchedulingChange = (field: string, value: any) => {
    onDataChange?.({
      scheduling: {
        ...data.scheduling,
        [field]: value,
      },
    });
  };

  const handleTrackingChange = (field: string, value: boolean) => {
    onDataChange?.({
      tracking: {
        ...data.tracking,
        [field]: value,
      },
    });
  };

  const providerColors = {
    sendgrid: "bg-blue-500",
    mailgun: "bg-red-500",
    ses: "bg-orange-500",
    resend: "bg-green-500",
    custom: "bg-gray-500",
  };

  const providerIcons = {
    sendgrid: "Mail",
    mailgun: "Send",
    ses: "Cloud",
    resend: "Zap",
    custom: "Settings",
  };

  const getTrackingScore = () => {
    let score = 0;
    if (data.tracking?.opens) score += 25;
    if (data.tracking?.clicks) score += 35;
    if (data.tracking?.bounces) score += 40;
    return score;
  };

  const getRecipientCount = () => {
    let count = 0;
    if (data.recipients?.to) count += data.recipients.to.length;
    if (data.recipients?.cc) count += data.recipients.cc.length;
    if (data.recipients?.bcc) count += data.recipients.bcc.length;
    return count;
  };

  return (
    <BaseFlowNode
      {...props}
      handles={emailHandles}
      nodeIcon={providerIcons[data.provider] || "Mail"}
      nodeColor={providerColors[data.provider] || "bg-blue-500"}
      className="min-w-[320px] max-w-[450px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* Provider Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email Provider</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs text-white",
                providerColors[data.provider]
              )}
            >
              {data.provider}
            </Badge>
          </div>

          {!isReadOnly && (
            <Select value={data.provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">AWS SES</SelectItem>
                <SelectItem value="resend">Resend</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Template */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Template</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">Template ID</Label>
              {!isReadOnly ? (
                <Input
                  value={data.template?.id || ""}
                  onChange={(e) => handleTemplateChange("id", e.target.value)}
                  className="h-7 text-xs"
                  placeholder="template-id"
                />
              ) : (
                <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                  {data.template?.id || "No template"}
                </div>
              )}
            </div>

            <div className="flex-1">
              <Label className="text-xs">Variables</Label>
              {!isReadOnly ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs w-full"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {Object.keys(data.template?.variables || {}).length} vars
                </Button>
              ) : (
                <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                  {Object.keys(data.template?.variables || {}).length} variables
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Recipients</Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {getRecipientCount()} recipients
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs w-8 text-muted-foreground">To:</span>
              {!isReadOnly ? (
                <Input
                  value={data.recipients?.to?.join(", ") || ""}
                  onChange={(e) => {
                    const emails = e.target.value
                      .split(",")
                      .map((e) => e.trim())
                      .filter((e) => e);
                    handleRecipientsChange("to", emails);
                  }}
                  className="flex-1 h-6 text-xs"
                  placeholder="user@example.com, user2@example.com"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {data.recipients?.to?.join(", ") || "No recipients"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs w-8 text-muted-foreground">CC:</span>
              {!isReadOnly ? (
                <Input
                  value={data.recipients?.cc?.join(", ") || ""}
                  onChange={(e) => {
                    const emails = e.target.value
                      .split(",")
                      .map((e) => e.trim())
                      .filter((e) => e);
                    handleRecipientsChange("cc", emails);
                  }}
                  className="flex-1 h-6 text-xs"
                  placeholder="cc@example.com"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {data.recipients?.cc?.join(", ") || "None"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Scheduling</Label>
            </div>
            <Switch
              checked={!!data.scheduling?.sendAt}
              onCheckedChange={(checked) =>
                handleSchedulingChange(
                  "sendAt",
                  checked ? new Date().toISOString() : undefined
                )
              }
              disabled={isReadOnly}
            />
          </div>

          {data.scheduling?.sendAt && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Send At</Label>
                {!isReadOnly ? (
                  <Input
                    type="datetime-local"
                    value={
                      data.scheduling.sendAt
                        ? new Date(data.scheduling.sendAt)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleSchedulingChange("sendAt", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                ) : (
                  <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                    {data.scheduling.sendAt
                      ? new Date(data.scheduling.sendAt).toLocaleString()
                      : "Now"}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs">Timezone</Label>
                {!isReadOnly ? (
                  <Select
                    value={data.scheduling.timezone || "UTC"}
                    onValueChange={(value) =>
                      handleSchedulingChange("timezone", value)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">EST</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                    {data.scheduling.timezone || "UTC"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tracking */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Tracking</Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {getTrackingScore()}/100
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "opens", label: "Opens", icon: Eye },
              { key: "clicks", label: "Clicks", icon: Send },
              { key: "bounces", label: "Bounces", icon: AlertTriangle },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <Label className="text-xs">{label}</Label>
                </div>
                {!isReadOnly ? (
                  <Switch
                    checked={
                      data.tracking?.[key as keyof typeof data.tracking] ||
                      false
                    }
                    onCheckedChange={(checked) =>
                      handleTrackingChange(key, checked)
                    }
                  />
                ) : (
                  <Badge
                    variant={
                      data.tracking?.[key as keyof typeof data.tracking]
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {data.tracking?.[key as keyof typeof data.tracking]
                      ? "On"
                      : "Off"}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Configuration */}
        {isExpanded && (
          <Card className="p-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Template Variables</Label>
              {!isReadOnly ? (
                <Textarea
                  value={
                    data.template?.variables
                      ? JSON.stringify(data.template.variables, null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      const variables = e.target.value
                        ? JSON.parse(e.target.value)
                        : {};
                      handleTemplateChange("variables", variables);
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="text-xs font-mono"
                  rows={4}
                  placeholder='{"name": "John", "product": "Pro Plan"}'
                />
              ) : (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                  {data.template?.variables
                    ? JSON.stringify(data.template.variables, null, 2)
                    : "No variables"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">BCC Recipients</Label>
              {!isReadOnly ? (
                <Input
                  value={data.recipients?.bcc?.join(", ") || ""}
                  onChange={(e) => {
                    const emails = e.target.value
                      .split(",")
                      .map((e) => e.trim())
                      .filter((e) => e);
                    handleRecipientsChange("bcc", emails);
                  }}
                  className="h-7 text-xs"
                  placeholder="bcc@example.com, admin@example.com"
                />
              ) : (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {data.recipients?.bcc?.join(", ") || "No BCC recipients"}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Email Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {data.tracking?.opens && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700"
              >
                Tracked
              </Badge>
            )}
            {data.scheduling?.sendAt && (
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700"
              >
                Scheduled
              </Badge>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            <Send className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {data.template?.id ? "Ready" : "Configure"}
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
