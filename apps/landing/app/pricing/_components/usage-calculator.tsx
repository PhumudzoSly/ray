"use client";

import { useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  Calculator,
  Brain,
  Code,
  TrendingUp,
  Zap,
  Star,
  Users,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 29,
    icon: <Zap className="w-4 h-4 text-blue-500" />,
    color: "text-blue-500",
    aiValidation: { included: 3, overage: 5 },
    apiCalls: { included: 10000, overage: 0.0005 },
  },
  {
    name: "Pro",
    price: 79,
    icon: <Star className="w-4 h-4 text-amber-500" />,
    color: "text-amber-500",
    aiValidation: { included: 8, overage: 3 },
    apiCalls: { included: 100000, overage: 0.0003 },
  },
  {
    name: "Team",
    price: 299,
    icon: <Users className="w-4 h-4 text-emerald-500" />,
    color: "text-emerald-500",
    aiValidation: { included: 15, overage: 2 },
    apiCalls: { included: 1000000, overage: 0.0001 },
  },
];

export function UsageCalculator() {
  const [aiValidations, setAiValidations] = useState(3);
  const [apiCalls, setApiCalls] = useState(10000);

  const calculateCost = (plan: (typeof plans)[0]) => {
    // Calculate AI validation overage
    const aiOverage = Math.max(0, aiValidations - plan.aiValidation.included);
    const aiOverageCost = aiOverage * plan.aiValidation.overage;

    // Calculate API calls overage
    const apiOverage = Math.max(0, apiCalls - plan.apiCalls.included);
    const apiOverageCost = apiOverage * plan.apiCalls.overage;

    const totalCost = plan.price + aiOverageCost + apiOverageCost;
    const overageCost = aiOverageCost + apiOverageCost;

    return {
      basePrice: plan.price,
      aiOverageCost,
      apiOverageCost,
      overageCost,
      totalCost,
      hasOverage: overageCost > 0,
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
          Usage Calculator
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Estimate your monthly costs based on your expected usage
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator Input */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-medium text-foreground">Your Usage</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="ai-validations"
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                AI Validations per month
              </Label>
              <Input
                id="ai-validations"
                type="number"
                value={aiValidations}
                onChange={(e) => setAiValidations(Number(e.target.value))}
                min="0"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Market research, competitive analysis, financial projections
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="api-calls" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                API Calls per month
              </Label>
              <Input
                id="api-calls"
                type="number"
                value={apiCalls}
                onChange={(e) => setApiCalls(Number(e.target.value))}
                min="0"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                REST API calls for integrations and automation
              </p>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const costs = calculateCost(plan);
            return (
              <Card
                key={plan.name}
                className={`p-6 ${
                  costs.hasOverage
                    ? "border-primary/20 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {plan.icon}
                    <h3 className="font-medium text-foreground">{plan.name}</h3>
                  </div>
                  {costs.hasOverage && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Overage
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Base price
                    </span>
                    <span className="font-medium text-foreground">
                      ${costs.basePrice}
                    </span>
                  </div>

                  {costs.aiOverageCost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        AI Validation overage
                      </span>
                      <span className="font-medium text-foreground">
                        +${costs.aiOverageCost.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {costs.apiOverageCost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        API Calls overage
                      </span>
                      <span className="font-medium text-foreground">
                        +${costs.apiOverageCost.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">
                        Total monthly
                      </span>
                      <span className="text-xl font-bold text-foreground">
                        ${costs.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {costs.hasOverage && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 Consider upgrading to{" "}
                        {plan.name === "Starter" ? "Pro" : "Team"} for better
                        rates
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          * All prices are estimates. Actual billing is based on your actual
          usage.
        </p>
      </div>
    </div>
  );
}
