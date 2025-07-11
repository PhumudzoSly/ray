"use client";

import { useState } from "react";
import { BaseFlowNode } from "./BaseFlowNode";
import { PaymentNodeData, SpecializedNodeProps, HandleConfig } from "./types";
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
import {
  CreditCard,
  DollarSign,
  Repeat,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentNode(props: SpecializedNodeProps<PaymentNodeData>) {
  const { data, selected, onDataChange, isReadOnly } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom handles for payment node
  const paymentHandles: HandleConfig[] = [
    {
      id: "payment-request",
      type: "target",
      position: "top",
      label: "Payment Request",
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
      id: "failed-output",
      type: "source",
      position: "bottom",
      label: "Failed",
      className: "!bg-red-500",
    },
    {
      id: "webhook-output",
      type: "source",
      position: "left",
      label: "Webhook",
      className: "!bg-purple-500",
    },
  ];

  const handleProviderChange = (provider: PaymentNodeData["provider"]) => {
    onDataChange?.({ provider });
  };

  const handlePaymentTypeChange = (
    paymentType: PaymentNodeData["paymentType"]
  ) => {
    onDataChange?.({ paymentType });
  };

  const handleFeesChange = (field: string, value: number) => {
    onDataChange?.({
      fees: {
        ...data.fees,
        [field]: value,
      },
    });
  };

  const providerColors = {
    stripe: "bg-purple-500",
    paypal: "bg-blue-500",
    square: "bg-green-500",
    custom: "bg-gray-500",
  };

  const providerIcons = {
    stripe: "CreditCard",
    paypal: "Wallet",
    square: "Square",
    custom: "Settings",
  };

  const paymentTypeColors = {
    "one-time": "bg-green-500",
    subscription: "bg-blue-500",
    marketplace: "bg-purple-500",
  };

  const getProcessingFee = () => {
    const baseFees = {
      stripe: 2.9,
      paypal: 2.9,
      square: 2.6,
      custom: 0,
    };
    return data.fees?.processing || baseFees[data.provider];
  };

  return (
    <BaseFlowNode
      {...props}
      handles={paymentHandles}
      nodeIcon={providerIcons[data.provider] || "CreditCard"}
      nodeColor={providerColors[data.provider] || "bg-blue-500"}
      className="min-w-[300px] max-w-[420px]"
      showDefaultHandles={false}
    >
      <div className="space-y-3">
        {/* Provider and Payment Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Payment Provider</span>
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

          <div className="flex gap-2">
            {!isReadOnly && (
              <Select
                value={data.provider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            )}

            {!isReadOnly ? (
              <Select
                value={data.paymentType}
                onValueChange={handlePaymentTypeChange}
              >
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-xs">
                {data.paymentType}
              </div>
            )}
          </div>
        </div>

        {/* Amount and Currency */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Amount</Label>
            {!isReadOnly ? (
              <div className="flex">
                <div className="px-2 py-1 bg-muted border border-r-0 rounded-l text-xs flex items-center">
                  <DollarSign className="w-3 h-3" />
                </div>
                <Input
                  type="number"
                  value={data.amount || ""}
                  onChange={(e) =>
                    onDataChange?.({ amount: Number(e.target.value) })
                  }
                  className="rounded-l-none h-8 text-xs"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            ) : (
              <div className="h-8 px-2 bg-muted rounded text-xs flex items-center">
                ${data.amount || "0.00"}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Currency</Label>
            {!isReadOnly ? (
              <Select
                value={data.currency}
                onValueChange={(value) => onDataChange?.({ currency: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-8 px-2 bg-muted rounded text-xs flex items-center">
                {data.currency}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Interval (for subscription type) */}
        {data.paymentType === "subscription" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs">Billing Interval</Label>
            </div>
            {!isReadOnly ? (
              <Select
                value={data.subscriptionInterval || "monthly"}
                onValueChange={(value) =>
                  onDataChange?.({ subscriptionInterval: value as any })
                }
              >
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="text-xs">
                {data.subscriptionInterval || "monthly"}
              </Badge>
            )}
          </div>
        )}

        {/* URLs */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Redirect URLs</Label>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs w-12">Success:</span>
              {!isReadOnly ? (
                <Input
                  value={data.successUrl || ""}
                  onChange={(e) =>
                    onDataChange?.({ successUrl: e.target.value })
                  }
                  className="flex-1 h-6 text-xs"
                  placeholder="/payment/success"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {data.successUrl || "/payment/success"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs w-12">Cancel:</span>
              {!isReadOnly ? (
                <Input
                  value={data.cancelUrl || ""}
                  onChange={(e) =>
                    onDataChange?.({ cancelUrl: e.target.value })
                  }
                  className="flex-1 h-6 text-xs"
                  placeholder="/payment/cancel"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {data.cancelUrl || "/payment/cancel"}
                </span>
              )}
            </div>
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
            Advanced Config {isExpanded ? "▼" : "▶"}
          </Button>

          {isExpanded && (
            <Card className="p-3 space-y-3">
              {/* Webhook URL */}
              <div>
                <Label className="text-xs font-medium">Webhook URL</Label>
                {!isReadOnly ? (
                  <Input
                    value={data.webhookUrl || ""}
                    onChange={(e) =>
                      onDataChange?.({ webhookUrl: e.target.value })
                    }
                    className="h-7 text-xs"
                    placeholder="/api/webhooks/payment"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {data.webhookUrl || "/api/webhooks/payment"}
                  </div>
                )}
              </div>

              {/* Fees */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Fee Structure (%)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Processing</Label>
                    {!isReadOnly ? (
                      <Input
                        type="number"
                        value={data.fees?.processing || getProcessingFee()}
                        onChange={(e) =>
                          handleFeesChange("processing", Number(e.target.value))
                        }
                        className="h-7 text-xs"
                        step="0.1"
                        min="0"
                        max="10"
                      />
                    ) : (
                      <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                        {data.fees?.processing || getProcessingFee()}%
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Platform</Label>
                    {!isReadOnly ? (
                      <Input
                        type="number"
                        value={data.fees?.platform || 0}
                        onChange={(e) =>
                          handleFeesChange("platform", Number(e.target.value))
                        }
                        className="h-7 text-xs"
                        step="0.1"
                        min="0"
                        max="10"
                      />
                    ) : (
                      <div className="h-7 px-2 bg-muted rounded text-xs flex items-center">
                        {data.fees?.platform || 0}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Payment Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={cn("text-xs", paymentTypeColors[data.paymentType])}
            >
              {data.paymentType}
            </Badge>
            {data.fees && (
              <Badge
                variant="outline"
                className="text-xs bg-yellow-50 text-yellow-700"
              >
                {(data.fees.processing + (data.fees.platform || 0)).toFixed(1)}%
                fee
              </Badge>
            )}
          </div>

          {/* Total Amount */}
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium">
              {data.amount ? `$${data.amount.toFixed(2)}` : "$0.00"}
            </span>
          </div>
        </div>
      </div>
    </BaseFlowNode>
  );
}
