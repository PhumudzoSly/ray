"use client";

import React, { useMemo } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { SecurityNodeData, SpecializedNodeProps } from "./types";
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
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Key,
  UserCheck,
  Settings,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";

export const SecurityNode: React.FC<SpecializedNodeProps<SecurityNodeData>> = ({
  data,
  selected,
  onDataChange,
  readOnly = false,
}) => {
  const nodeData = data as SecurityNodeData;

  const handleDataChange = (updates: Partial<SecurityNodeData>) => {
    onDataChange?.({ ...nodeData, ...updates });
  };

  const customHandles = useMemo(
    () => [
      {
        id: "data-in",
        type: "target" as const,
        position: "left" as const,
        label: "Data In",
        style: { background: "#3b82f6" },
      },
      {
        id: "policy-in",
        type: "target" as const,
        position: "left" as const,
        label: "Policy",
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
        id: "secure-out",
        type: "source" as const,
        position: "right" as const,
        label: "Secure",
        style: { background: "#10b981" },
      },
      {
        id: "audit-out",
        type: "source" as const,
        position: "right" as const,
        label: "Audit",
        style: { background: "#f59e0b", top: "30%" },
      },
      {
        id: "denied-out",
        type: "source" as const,
        position: "right" as const,
        label: "Denied",
        style: { background: "#ef4444", top: "60%" },
      },
    ],
    []
  );

  const getSecurityTypeIcon = (type: string) => {
    switch (type) {
      case "encryption":
        return <Lock className="w-4 h-4" />;
      case "validation":
        return <CheckCircle className="w-4 h-4" />;
      case "audit":
        return <Eye className="w-4 h-4" />;
      case "access-control":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    if (!nodeData.securityType)
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (!nodeData.policies || nodeData.policies.length === 0)
      return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getSecurityScore = () => {
    let score = 0;
    if (nodeData.securityType) score += 20;
    if (nodeData.policies && nodeData.policies.length > 0) score += 25;
    if (nodeData.encryptionAlgorithm) score += 20;
    if (nodeData.auditLevel) score += 15;
    if (nodeData.complianceStandards && nodeData.complianceStandards.length > 0)
      score += 20;
    return Math.min(score, 100);
  };

  const getComplianceBadgeVariant = (standard: string) => {
    const criticalStandards = ["HIPAA", "PCI-DSS"];
    return criticalStandards.includes(standard) ? "default" : "secondary";
  };

  const addPolicy = () => {
    const newPolicy = {
      name: "New Policy",
      rules: [],
    };
    const updatedPolicies = [...(nodeData.policies || []), newPolicy];
    handleDataChange({ policies: updatedPolicies });
  };

  const removePolicy = (index: number) => {
    if (!nodeData.policies) return;
    const updatedPolicies = nodeData.policies.filter((_, i) => i !== index);
    handleDataChange({ policies: updatedPolicies });
  };

  const updatePolicy = (
    index: number,
    updates: Partial<(typeof nodeData.policies)[0]>
  ) => {
    if (!nodeData.policies) return;
    const updatedPolicies = nodeData.policies.map((policy, i) =>
      i === index ? { ...policy, ...updates } : policy
    );
    handleDataChange({ policies: updatedPolicies });
  };

  const expandedContent = (
    <div className="space-y-6">
      {/* Security Type Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSecurityTypeIcon(nodeData.securityType)}
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Security Type</Label>
            <Select
              value={nodeData.securityType}
              onValueChange={(value) =>
                handleDataChange({ securityType: value as any })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="encryption">Encryption</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="access-control">Access Control</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {nodeData.securityType === "encryption" && (
            <div className="space-y-2">
              <Label>Encryption Algorithm</Label>
              <Select
                value={nodeData.encryptionAlgorithm || "AES-256"}
                onValueChange={(value) =>
                  handleDataChange({ encryptionAlgorithm: value as any })
                }
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AES-256">AES-256</SelectItem>
                  <SelectItem value="RSA">RSA</SelectItem>
                  <SelectItem value="bcrypt">bcrypt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {nodeData.securityType === "audit" && (
            <div className="space-y-2">
              <Label>Audit Level</Label>
              <Select
                value={nodeData.auditLevel || "basic"}
                onValueChange={(value) =>
                  handleDataChange({ auditLevel: value as any })
                }
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            {getSecurityTypeIcon(nodeData.securityType)}
            <div className="flex-1">
              <div className="font-medium capitalize">
                {nodeData.securityType.replace("-", " ")}
              </div>
              <div className="text-sm text-muted-foreground">
                {nodeData.encryptionAlgorithm &&
                  `Algorithm: ${nodeData.encryptionAlgorithm}`}
                {nodeData.auditLevel && `Level: ${nodeData.auditLevel}`}
              </div>
            </div>
            <Badge variant="outline">
              {nodeData.securityType === "encryption" &&
              nodeData.encryptionAlgorithm
                ? "Configured"
                : nodeData.securityType === "audit" && nodeData.auditLevel
                  ? "Configured"
                  : "Basic"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Security Policies
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addPolicy}
                className="ml-auto"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {nodeData.policies?.map((policy, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Label>Policy Name</Label>
                    <Input
                      value={policy.name}
                      onChange={(e) =>
                        updatePolicy(index, { name: e.target.value })
                      }
                      placeholder="Policy name"
                      readOnly={readOnly}
                    />
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePolicy(index)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Policy Rules (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(policy.rules, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updatePolicy(index, { rules: parsed });
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='[{"field": "password", "min_length": 8}]'
                    className="font-mono text-sm"
                    rows={4}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            ))}
          </div>

          {(!nodeData.policies || nodeData.policies.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No security policies configured. Add policies to enforce security
              rules.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {["GDPR", "HIPAA", "SOC2", "PCI-DSS"].map((standard) => (
              <div
                key={standard}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      nodeData.complianceStandards?.includes(standard as any) ||
                      false
                    }
                    onCheckedChange={(checked) => {
                      const current = nodeData.complianceStandards || [];
                      const updated = checked
                        ? [...current, standard as any]
                        : current.filter((s) => s !== standard);
                      handleDataChange({ complianceStandards: updated });
                    }}
                    disabled={readOnly}
                  />
                  <div>
                    <div className="font-medium">{standard}</div>
                    <div className="text-sm text-muted-foreground">
                      {standard === "GDPR" &&
                        "General Data Protection Regulation"}
                      {standard === "HIPAA" &&
                        "Health Insurance Portability and Accountability Act"}
                      {standard === "SOC2" && "Service Organization Control 2"}
                      {standard === "PCI-DSS" &&
                        "Payment Card Industry Data Security Standard"}
                    </div>
                  </div>
                </div>
                <Badge variant={getComplianceBadgeVariant(standard)}>
                  {nodeData.complianceStandards?.includes(standard as any)
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <Shield className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium">Compliance Status</div>
              <div className="text-sm text-muted-foreground">
                {nodeData.complianceStandards?.length || 0} standards enabled
              </div>
            </div>
            <Badge
              variant={
                nodeData.complianceStandards?.length ? "default" : "secondary"
              }
            >
              {nodeData.complianceStandards?.length
                ? "Compliant"
                : "Not Configured"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Security Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Threat Detection</Label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Active</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Intrusion Prevention</Label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Enabled</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Failed Attempts</Label>
              <div className="text-sm text-muted-foreground">3 in last 24h</div>
            </div>
            <div className="space-y-2">
              <Label>Security Events</Label>
              <div className="text-sm text-muted-foreground">
                12 logged today
              </div>
            </div>
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Logs
              </Button>
              <Button variant="outline" size="sm">
                Generate Report
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
        label: nodeData.label || "Security Control",
        icon: getSecurityTypeIcon(nodeData.securityType),
        color: "#dc2626",
        handles: customHandles,
        expandedContent,
        badges: [
          {
            text: nodeData.securityType.replace("-", " "),
            variant: "secondary" as const,
          },
          {
            text: `${nodeData.policies?.length || 0} Policies`,
            variant: "outline" as const,
          },
          {
            text: `${nodeData.complianceStandards?.length || 0} Standards`,
            variant: "outline" as const,
          },
          {
            text: `Score: ${getSecurityScore()}%`,
            variant:
              getSecurityScore() >= 80
                ? "default"
                : getSecurityScore() >= 60
                  ? "secondary"
                  : "destructive",
          },
        ],
        status: {
          icon: getStatusIcon(),
          text:
            nodeData.securityType &&
            nodeData.policies &&
            nodeData.policies.length > 0
              ? "Secured"
              : nodeData.securityType
                ? "Configured"
                : "Not Configured",
          variant:
            nodeData.securityType &&
            nodeData.policies &&
            nodeData.policies.length > 0
              ? "success"
              : nodeData.securityType
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
