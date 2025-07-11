"use client";

import React, { useMemo } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { SmsNodeData, SpecializedNodeProps } from "./types";
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
  MessageSquare,
  Phone,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Send,
  Calendar,
  Link,
  BarChart,
  Globe,
  Settings,
} from "lucide-react";

export const SmsNode: React.FC<SpecializedNodeProps<SmsNodeData>> = ({
  data,
  selected,
  onDataChange,
  readOnly = false,
}) => {
  const nodeData = data as SmsNodeData;

  const handleDataChange = (updates: Partial<SmsNodeData>) => {
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
        id: "message-in",
        type: "target" as const,
        position: "left" as const,
        label: "Message",
        style: { background: "#3b82f6", top: "30%" },
      },
      {
        id: "recipients-in",
        type: "target" as const,
        position: "left" as const,
        label: "Recipients",
        style: { background: "#8b5cf6", top: "60%" },
      },
      {
        id: "sent-out",
        type: "source" as const,
        position: "right" as const,
        label: "Sent",
        style: { background: "#10b981" },
      },
      {
        id: "delivered-out",
        type: "source" as const,
        position: "right" as const,
        label: "Delivered",
        style: { background: "#3b82f6", top: "30%" },
      },
      {
        id: "failed-out",
        type: "source" as const,
        position: "right" as const,
        label: "Failed",
        style: { background: "#ef4444", top: "60%" },
      },
    ],
    []
  );

  const getProviderIcon = (provider: string) => {
    const providerIcons: Record<string, string> = {
      twilio: "🔄",
      vonage: "📞",
      "aws-sns": "🟧",
      custom: "⚙️",
    };
    return providerIcons[provider] || "📱";
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      twilio: "Twilio",
      vonage: "Vonage",
      "aws-sns": "AWS SNS",
      custom: "Custom Provider",
    };
    return names[provider] || provider;
  };

  const getStatusIcon = () => {
    if (!nodeData.message)
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (!nodeData.recipients || nodeData.recipients.length === 0)
      return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getSmsScore = () => {
    let score = 0;
    if (nodeData.message) score += 30;
    if (nodeData.recipients && nodeData.recipients.length > 0) score += 25;
    if (nodeData.provider) score += 20;
    if (nodeData.deliveryReceipts) score += 15;
    if (nodeData.shortLinks) score += 10;
    return Math.min(score, 100);
  };

  const getMessageLength = () => {
    return nodeData.message?.length || 0;
  };

  const getMessageSegments = () => {
    const length = getMessageLength();
    return Math.ceil(length / 160);
  };

  const expandedContent = (
    <div className="space-y-6">
      {/* Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            SMS Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="vonage">Vonage</SelectItem>
                <SelectItem value="aws-sns">AWS SNS</SelectItem>
                <SelectItem value="custom">Custom Provider</SelectItem>
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
                SMS messaging provider
              </div>
            </div>
            <Badge variant="outline">
              {nodeData.provider === "custom" ? "Custom" : "Managed"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Message Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Message Text</Label>
            <Textarea
              value={nodeData.message}
              onChange={(e) => handleDataChange({ message: e.target.value })}
              placeholder="Enter your SMS message here..."
              rows={4}
              readOnly={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 border rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-sm font-medium">{getMessageLength()}</div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{getMessageSegments()}</div>
              <div className="text-xs text-muted-foreground">SMS Segments</div>
            </div>
          </div>

          {getMessageLength() > 160 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Message exceeds 160 characters and will be sent as{" "}
                {getMessageSegments()} segments
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>Enable Short Links</Label>
            <Switch
              checked={nodeData.shortLinks || false}
              onCheckedChange={(checked) =>
                handleDataChange({ shortLinks: checked })
              }
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipients Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Numbers</Label>
            <Textarea
              value={nodeData.recipients.join("\n")}
              onChange={(e) =>
                handleDataChange({
                  recipients: e.target.value.split("\n").filter(Boolean),
                })
              }
              placeholder="+1234567890&#10;+1987654321&#10;+1555123456"
              rows={4}
              readOnly={readOnly}
            />
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Users className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium">Recipients</div>
              <div className="text-sm text-muted-foreground">
                {nodeData.recipients.length} phone numbers configured
              </div>
            </div>
            <Badge variant="outline">
              {nodeData.recipients.length} Recipients
            </Badge>
          </div>

          {nodeData.recipients.length > 0 && (
            <div className="space-y-2">
              <Label>Sample Recipients</Label>
              <div className="space-y-1">
                {nodeData.recipients.slice(0, 3).map((recipient, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {recipient}
                  </div>
                ))}
                {nodeData.recipients.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    ... and {nodeData.recipients.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Send At (Optional)</Label>
            <Input
              type="datetime-local"
              value={nodeData.scheduling?.sendAt || ""}
              onChange={(e) =>
                handleDataChange({
                  scheduling: {
                    ...nodeData.scheduling,
                    sendAt: e.target.value,
                  },
                })
              }
              readOnly={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={nodeData.scheduling?.timezone || "UTC"}
              onValueChange={(value) =>
                handleDataChange({
                  scheduling: {
                    ...nodeData.scheduling,
                    timezone: value,
                  },
                })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time
                </SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Clock className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium">
                {nodeData.scheduling?.sendAt ? "Scheduled" : "Send Immediately"}
              </div>
              <div className="text-sm text-muted-foreground">
                {nodeData.scheduling?.sendAt
                  ? `Scheduled for ${new Date(nodeData.scheduling.sendAt).toLocaleString()}`
                  : "Message will be sent immediately when triggered"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Delivery & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Delivery Receipts</Label>
            <Switch
              checked={nodeData.deliveryReceipts || false}
              onCheckedChange={(checked) =>
                handleDataChange({ deliveryReceipts: checked })
              }
              disabled={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Rate</Label>
              <div className="text-sm text-muted-foreground">
                98.5% success rate
              </div>
            </div>
            <div className="space-y-2">
              <Label>Average Delivery Time</Label>
              <div className="text-sm text-muted-foreground">2.3 seconds</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estimated Cost</Label>
            <div className="text-sm text-muted-foreground">
              $
              {(
                nodeData.recipients.length *
                getMessageSegments() *
                0.0075
              ).toFixed(4)}{" "}
              USD
            </div>
          </div>

          {nodeData.deliveryReceipts && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-800">
                  Delivery Tracking Enabled
                </div>
                <div className="text-sm text-green-600">
                  You'll receive delivery confirmations for each message
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Message Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-sm font-medium mb-2">SMS Preview:</div>
            <div className="text-sm whitespace-pre-wrap">
              {nodeData.message || "No message content"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium">
                {nodeData.recipients.length}
              </div>
              <div className="text-xs text-muted-foreground">Recipients</div>
            </div>
            <div>
              <div className="text-sm font-medium">{getMessageSegments()}</div>
              <div className="text-xs text-muted-foreground">Segments</div>
            </div>
            <div>
              <div className="text-sm font-medium">
                {nodeData.recipients.length * getMessageSegments()}
              </div>
              <div className="text-xs text-muted-foreground">Total SMS</div>
            </div>
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Test Send
              </Button>
              <Button variant="outline" size="sm">
                Send Now
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
        label: nodeData.label || "SMS Message",
        icon: <MessageSquare className="w-4 h-4" />,
        color: "#16a34a",
        handles: customHandles,
        expandedContent,
        badges: [
          {
            text: `${getProviderIcon(nodeData.provider)} ${nodeData.provider}`,
            variant: "secondary" as const,
          },
          {
            text: `${nodeData.recipients.length} Recipients`,
            variant: "outline" as const,
          },
          {
            text: `${getMessageSegments()} Segments`,
            variant: "outline" as const,
          },
          {
            text: `Score: ${getSmsScore()}%`,
            variant:
              getSmsScore() >= 80
                ? "default"
                : getSmsScore() >= 60
                  ? "secondary"
                  : "destructive",
          },
        ],
        status: {
          icon: getStatusIcon(),
          text:
            nodeData.message && nodeData.recipients.length > 0
              ? "Ready to Send"
              : nodeData.message
                ? "No Recipients"
                : "Not Configured",
          variant:
            nodeData.message && nodeData.recipients.length > 0
              ? "success"
              : nodeData.message
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
