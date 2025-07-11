"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import {
  NotificationNodeData,
  SpecializedNodeProps,
  HandleConfig,
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
import { Card } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationNode(
  props: SpecializedNodeProps<NotificationNodeData>
) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for notification node
  const notificationHandles: HandleConfig[] = [
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

  const handleChannelToggle = (channel: string) => {
    const newChannels = data.channels.includes(channel as any)
      ? data.channels.filter((c) => c !== channel)
      : [...data.channels, channel as any];

    onDataChange?.({ channels: newChannels });
  };

  const handleSchedulingChange = (field: string, value: any) => {
    onDataChange?.({
      scheduling: {
        ...data.scheduling,
        [field]: value,
      },
    });
  };

  const handleTargetingChange = (field: string, value: any) => {
    onDataChange?.({
      targeting: {
        ...data.targeting,
        [field]: value,
      },
    });
  };

  const channelIcons = {
    email: Mail,
    sms: MessageSquare,
    push: Smartphone,
    "in-app": Bell,
  };

  const channelColors = {
    email: "bg-blue-500",
    sms: "bg-green-500",
    push: "bg-purple-500",
    "in-app": "bg-orange-500",
  };

  const priorityColors = {
    low: "bg-gray-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  };

  const getChannelCount = () => data.channels.length;
  const getEstimatedReach = () => {
    const baseReach = {
      email: 1000,
      sms: 800,
      push: 600,
      "in-app": 400,
    };
    return data.channels.reduce(
      (total, channel) => total + baseReach[channel],
      0
    );
  };

  return (
    <BaseFlowNode
      {...props}
      handles={notificationHandles}
      nodeIcon="Bell"
      nodeColor={priorityColors[data.priority] || "bg-blue-500"}
      className="min-w-[320px] max-w-[450px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* Notification Channels */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notification Channels</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getChannelCount()} channels
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(channelIcons).map(([channel, Icon]) => (
              <Button
                key={channel}
                variant={
                  data.channels.includes(channel as any) ? "default" : "outline"
                }
                size="sm"
                className={cn(
                  "h-8 text-xs justify-start",
                  data.channels.includes(channel as any) &&
                    channelColors[channel as keyof typeof channelColors]
                )}
                onClick={() => !isReadOnly && handleChannelToggle(channel)}
                disabled={isReadOnly}
              >
                <Icon className="w-3 h-3 mr-2" />
                {channel.charAt(0).toUpperCase() + channel.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                priorityColors[data.priority]
              )}
            />
            <Label className="text-xs">Priority</Label>
          </div>
          {!isReadOnly ? (
            <Select
              value={data.priority}
              onValueChange={(value) =>
                onDataChange?.({ priority: value as any })
              }
            >
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "text-xs text-white",
                priorityColors[data.priority]
              )}
            >
              {data.priority}
            </Badge>
          )}
        </div>

        {/* Template */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Template</Label>
          {!isReadOnly ? (
            <Input
              value={data.template || ""}
              onChange={(e) => onDataChange?.({ template: e.target.value })}
              className="h-8 text-xs"
              placeholder="notification-template-id"
            />
          ) : (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {data.template || "No template selected"}
            </div>
          )}
        </div>

        {/* Scheduling */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Scheduling</Label>
            </div>
            <Switch
              checked={!data.scheduling?.immediate}
              onCheckedChange={(checked) =>
                handleSchedulingChange("immediate", !checked)
              }
              disabled={isReadOnly}
            />
          </div>

          {!data.scheduling?.immediate && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Delay (minutes)</Label>
                  {!isReadOnly ? (
                    <Input
                      type="number"
                      value={data.scheduling?.delay || 0}
                      onChange={(e) =>
                        handleSchedulingChange("delay", Number(e.target.value))
                      }
                      className="h-7 text-xs"
                      min="0"
                    />
                  ) : (
                    <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                      {data.scheduling?.delay || 0}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Label className="text-xs">Recurring</Label>
                  {!isReadOnly ? (
                    <Switch
                      checked={!!data.scheduling?.recurring}
                      onCheckedChange={(checked) =>
                        handleSchedulingChange(
                          "recurring",
                          checked ? { interval: "daily" } : undefined
                        )
                      }
                    />
                  ) : (
                    <Badge
                      variant={
                        data.scheduling?.recurring ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {data.scheduling?.recurring ? "Yes" : "No"}
                    </Badge>
                  )}
                </div>
              </div>

              {data.scheduling?.recurring && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Interval</Label>
                    {!isReadOnly ? (
                      <Select
                        value={data.scheduling.recurring.interval}
                        onValueChange={(value) =>
                          handleSchedulingChange("recurring", {
                            ...data.scheduling?.recurring,
                            interval: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                        {data.scheduling.recurring.interval}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs">End Date</Label>
                    {!isReadOnly ? (
                      <Input
                        type="date"
                        value={data.scheduling.recurring.endDate || ""}
                        onChange={(e) =>
                          handleSchedulingChange("recurring", {
                            ...data.scheduling?.recurring,
                            endDate: e.target.value,
                          })
                        }
                        className="h-7 text-xs"
                      />
                    ) : (
                      <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                        {data.scheduling.recurring.endDate || "No end"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Targeting */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs p-0 font-medium"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isReadOnly}
          >
            Advanced Targeting {isExpanded ? "▼" : "▶"}
          </Button>

          {isExpanded && (
            <Card className="p-3 space-y-3">
              {/* User Segments */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">User Segments</Label>
                {!isReadOnly ? (
                  <Input
                    value={data.targeting?.userSegments?.join(", ") || ""}
                    onChange={(e) => {
                      const segments = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s);
                      handleTargetingChange("userSegments", segments);
                    }}
                    className="h-7 text-xs"
                    placeholder="premium, active, new-users"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {data.targeting?.userSegments?.join(", ") || "All users"}
                  </div>
                )}
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Conditions</Label>
                {!isReadOnly ? (
                  <Textarea
                    value={
                      data.targeting?.conditions
                        ? JSON.stringify(data.targeting.conditions, null, 2)
                        : ""
                    }
                    onChange={(e) => {
                      try {
                        const conditions = e.target.value
                          ? JSON.parse(e.target.value)
                          : [];
                        handleTargetingChange("conditions", conditions);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="text-xs font-mono"
                    rows={3}
                    placeholder='[{"field": "last_login", "operator": ">=", "value": "7d"}]'
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                    {data.targeting?.conditions
                      ? JSON.stringify(data.targeting.conditions, null, 2)
                      : "No conditions"}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Notification Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {data.channels.map((channel) => (
              <Badge
                key={channel}
                variant="outline"
                className={cn("text-xs", channelColors[channel])}
              >
                {channel}
              </Badge>
            ))}
          </div>

          {/* Estimated Reach */}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              ~{getEstimatedReach().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
