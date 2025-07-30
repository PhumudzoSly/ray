import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Zap, Star, Users, Brain, Code, Info } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    name: "Pro",
    icon: <Star className="w-5 h-5 text-amber-500" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    name: "Team",
    icon: <Users className="w-5 h-5 text-emerald-500" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
];

const pricingData = [
  {
    feature: "Team Members",
    icon: <Users className="w-4 h-4" />,
    description: "Maximum number of team members per organization",
    starter: {
      included: "2 members",
      overage: "Upgrade required",
    },
    pro: {
      included: "10 members",
      overage: "Upgrade required",
    },
    team: {
      included: "50 members",
      overage: "Upgrade required",
    },
  },
  {
    feature: "Projects",
    icon: <Star className="w-4 h-4" />,
    description: "Maximum number of active projects",
    starter: {
      included: "3 projects",
      overage: "Upgrade required",
    },
    pro: {
      included: "25 projects",
      overage: "Upgrade required",
    },
    team: {
      included: "100 projects",
      overage: "Upgrade required",
    },
  },
  {
    feature: "AI Validation",
    icon: <Brain className="w-4 h-4" />,
    description: "Market research, competitive analysis, financial projections",
    starter: {
      included: "3 validations/month",
      overage: "$5 each",
    },
    pro: {
      included: "8 validations/month",
      overage: "$3 each",
    },
    team: {
      included: "15 validations/month",
      overage: "$2 each",
    },
  },
  {
    feature: "API Calls",
    icon: <Code className="w-4 h-4" />,
    description: "REST API access for integrations and automation",
    starter: {
      included: "10K calls/month",
      overage: "$0.0005 per call",
    },
    pro: {
      included: "100K calls/month",
      overage: "$0.0003 per call",
    },
    team: {
      included: "1M calls/month",
      overage: "$0.0001 per call",
    },
  },
];

export function DetailedPricingTable() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
          Detailed Usage & Limits
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transparent pricing for AI validation and API usage
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              Usage Limits & Overage Pricing
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All plans include the specified limits. Additional usage is charged
            at the overage rate.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-1/3 font-semibold text-foreground">
                  Feature
                </TableHead>
                {plans.map((plan) => (
                  <TableHead
                    key={plan.name}
                    className="text-center font-semibold text-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {plan.icon}
                      <span>{plan.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData.map((item, index) => (
                <TableRow key={index} className="border-b border-border/50">
                  <TableCell className="py-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 bg-muted rounded-md">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {item.feature}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Starter */}
                  <TableCell className="text-center py-6">
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          {item.starter.included}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.starter.overage}
                      </div>
                    </div>
                  </TableCell>

                  {/* Pro */}
                  <TableCell className="text-center py-6">
                    <div className="space-y-2">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-900">
                          {item.pro.included}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.pro.overage}
                      </div>
                    </div>
                  </TableCell>

                  {/* Team */}
                  <TableCell className="text-center py-6">
                    <div className="space-y-2">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm font-medium text-emerald-900">
                          {item.team.included}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.team.overage}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-2">
                Usage Tracking
              </h4>
              <p className="text-sm text-muted-foreground">
                Monitor your usage in real-time through the dashboard
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-2">
                Overage Alerts
              </h4>
              <p className="text-sm text-muted-foreground">
                Get notified when you're approaching your limits
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-2">
                Flexible Billing
              </h4>
              <p className="text-sm text-muted-foreground">
                Pay only for what you use beyond your plan limits
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
