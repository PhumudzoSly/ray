"use client";

import React, { useMemo } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { AnalyticsNodeData, SpecializedNodeProps } from "./types";
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
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Switch } from "@workspace/ui/components/switch";
import { Separator } from "@workspace/ui/components/separator";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Target,
  Eye,
  Calendar,
  Filter,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";

export const AnalyticsNode: React.FC<
  SpecializedNodeProps<AnalyticsNodeData>
> = ({ data, selected, onDataChange, readOnly = false }) => {
  const nodeData = data as AnalyticsNodeData;

  const handleDataChange = (updates: Partial<AnalyticsNodeData>) => {
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
        label: "Data",
        style: { background: "#3b82f6", top: "30%" },
      },
      {
        id: "event-out",
        type: "source" as const,
        position: "right" as const,
        label: "Event",
        style: { background: "#10b981" },
      },
      {
        id: "metrics-out",
        type: "source" as const,
        position: "right" as const,
        label: "Metrics",
        style: { background: "#f59e0b", top: "30%" },
      },
    ],
    []
  );

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "pageview":
        return <Eye className="w-4 h-4" />;
      case "click":
        return <Target className="w-4 h-4" />;
      case "conversion":
        return <TrendingUp className="w-4 h-4" />;
      case "custom":
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    if (!nodeData.trackingId)
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (!nodeData.goals || nodeData.goals.length === 0)
      return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getAnalyticsScore = () => {
    let score = 0;
    if (nodeData.trackingId) score += 30;
    if (nodeData.goals && nodeData.goals.length > 0) score += 25;
    if (
      nodeData.customProperties &&
      Object.keys(nodeData.customProperties).length > 0
    )
      score += 20;
    if (nodeData.dashboard) score += 25;
    return Math.min(score, 100);
  };

  const expandedContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getEventTypeIcon(nodeData.eventType)}
            Event Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select
              value={nodeData.eventType}
              onValueChange={(value) =>
                handleDataChange({ eventType: value as any })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pageview">Page View</SelectItem>
                <SelectItem value="click">Click Event</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="custom">Custom Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tracking ID</Label>
            <Input
              value={nodeData.trackingId || ""}
              onChange={(e) => handleDataChange({ trackingId: e.target.value })}
              placeholder="GA-XXXXXXXXX-X or custom tracking ID"
              readOnly={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Properties (JSON)</Label>
            <Textarea
              value={JSON.stringify(nodeData.customProperties || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleDataChange({ customProperties: parsed });
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"category": "button", "label": "header-cta"}'
              className="font-mono text-sm"
              rows={4}
              readOnly={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals & Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {nodeData.goals?.map((goal, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input
                    value={goal.name}
                    onChange={(e) => {
                      const updatedGoals = nodeData.goals!.map((g, i) =>
                        i === index ? { ...g, name: e.target.value } : g
                      );
                      handleDataChange({ goals: updatedGoals });
                    }}
                    placeholder="Goal name"
                    readOnly={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      value={goal.target}
                      onChange={(e) => {
                        const updatedGoals = nodeData.goals!.map((g, i) =>
                          i === index
                            ? { ...g, target: parseInt(e.target.value) }
                            : g
                        );
                        handleDataChange({ goals: updatedGoals });
                      }}
                      placeholder="100"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metric</Label>
                    <Select
                      value={goal.metric}
                      onValueChange={(value) => {
                        const updatedGoals = nodeData.goals!.map((g, i) =>
                          i === index ? { ...g, metric: value } : g
                        );
                        handleDataChange({ goals: updatedGoals });
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!nodeData.goals || nodeData.goals.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No goals configured. Add a goal to start tracking performance.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Dashboard Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Dashboard</Label>
            <Switch
              checked={!!nodeData.dashboard}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleDataChange({
                    dashboard: {
                      widgets: [],
                      refreshInterval: 60,
                    },
                  });
                } else {
                  handleDataChange({ dashboard: undefined });
                }
              }}
              disabled={readOnly}
            />
          </div>

          {nodeData.dashboard && (
            <>
              <div className="space-y-2">
                <Label>Refresh Interval (seconds)</Label>
                <Input
                  type="number"
                  value={nodeData.dashboard.refreshInterval}
                  onChange={(e) =>
                    handleDataChange({
                      dashboard: {
                        ...nodeData.dashboard,
                        refreshInterval: parseInt(e.target.value),
                      },
                    })
                  }
                  min="10"
                  max="3600"
                  readOnly={readOnly}
                />
              </div>

              <div className="space-y-3">
                <Label>Dashboard Widgets</Label>
                <div className="space-y-2">
                  {nodeData.dashboard.widgets.map((widget, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <BarChart className="w-4 h-4" />
                      <Select
                        value={widget}
                        onValueChange={(value) => {
                          const updatedWidgets =
                            nodeData.dashboard!.widgets.map((w, i) =>
                              i === index ? value : w
                            );
                          handleDataChange({
                            dashboard: {
                              ...nodeData.dashboard!,
                              widgets: updatedWidgets,
                            },
                          });
                        }}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chart">Chart</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="metric">Metric</SelectItem>
                          <SelectItem value="gauge">Gauge</SelectItem>
                          <SelectItem value="timeline">Timeline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <BaseFlowNode
      data={{
        ...nodeData,
        label: nodeData.label || "Analytics Tracking",
        icon: getEventTypeIcon(nodeData.eventType),
        color: "#8b5cf6",
        handles: customHandles,
        expandedContent,
        badges: [
          {
            text: nodeData.eventType,
            variant: "secondary" as const,
          },
          {
            text: `${nodeData.goals?.length || 0} Goals`,
            variant: "outline" as const,
          },
          {
            text: `${nodeData.dashboard?.widgets?.length || 0} Widgets`,
            variant: "outline" as const,
          },
          {
            text: `Score: ${getAnalyticsScore()}%`,
            variant:
              getAnalyticsScore() >= 80
                ? "default"
                : getAnalyticsScore() >= 60
                  ? "secondary"
                  : "destructive",
          },
        ],
        status: {
          icon: getStatusIcon(),
          text: nodeData.trackingId
            ? nodeData.goals && nodeData.goals.length > 0
              ? "Active Tracking"
              : "Configured"
            : "Not Configured",
          variant: nodeData.trackingId
            ? nodeData.goals && nodeData.goals.length > 0
              ? "success"
              : "warning"
            : "error",
        },
      }}
      selected={selected}
      onDataChange={onDataChange}
      readOnly={readOnly}
    />
  );
};
