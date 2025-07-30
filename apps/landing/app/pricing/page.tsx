import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  Check,
  ArrowRight,
  X,
  Star,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { DetailedPricingTable } from "./_components/detailed-pricing-table";
import { UsageCalculator } from "./_components/usage-calculator";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for solo founders and small teams",
    icon: <Zap className="w-6 h-6 text-blue-500" />,
    features: {
      core: [
        "Project management",
        "Unlimited roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Basic SaaS management",
      ],
      limits: [
        "2 team members",
        "3 projects",
        "3 AI validations/month",
        "10K API calls/month",
      ],
      support: ["Email support"],
    },
    notAvailable: [
      "User feedback system",
      "Analytics dashboard",
      "AI Agent",
      "Inbox",
      "Custom integrations",
      "Priority support",
    ],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$150+",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For growing teams and serious builders",
    icon: <Star className="w-6 h-6 text-amber-500" />,
    features: {
      core: [
        "Project management",
        "Unlimited public roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Complete SaaS management",
      ],
      limits: [
        "Up to 10 team members",
        "25 projects",
        "8 AI validations/month",
        "100K API calls/month",
      ],
      advanced: [
        "User feedback system",
        "Analytics dashboard",
        "Inbox",
        "Custom integrations",
      ],
      support: ["Priority support"],
    },
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: true,
    savings: "$300+",
    gradient: "from-amber-50 via-orange-50 to-red-50",
  },
  {
    name: "Team",
    price: "$299",
    period: "/month",
    description: "For established teams and organizations",
    icon: <Users className="w-6 h-6 text-emerald-500" />,
    features: {
      core: [
        "Project management",
        "Unlimited public roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Complete SaaS management",
      ],
      limits: [
        "Up to 50 team members",
        "100 projects",
        "15 AI validations/month",
        "1M API calls/month",
      ],
      advanced: [
        "User feedback system",
        "Analytics dashboard",
        "AI Agent",
        "Inbox",
        "Custom integrations",
      ],
      support: ["Priority support"],
    },
    notAvailable: [],
    cta: "Start Building",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$1000+",
    gradient: "from-emerald-50 to-teal-50",
  },
];

const comparisonData = [
  {
    tool: "Linear Pro",
    price: "$10/user/month",
    features: "Project management + Issue tracking",
    icon: <Target className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "Productboard",
    price: "$19/maker/month",
    features: "Roadmaps",
    icon: <BarChart3 className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "LaunchList",
    price: "$29/month",
    features: "Waitlists",
    icon: <TrendingUp className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "UserVoice",
    price: "$899/month",
    features: "User feedback",
    icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "Custom AI Validation",
    price: "$200-500/month",
    features: "Market research & analysis",
    icon: <Sparkles className="w-5 h-5 text-muted-foreground" />,
  },
];

const faqs = [
  {
    question: "How much would this cost if I bought each tool separately?",
    answer:
      "Building this stack with separate tools would cost $200-400/month for a small team. Our all-in-one platform eliminates the complexity of managing multiple tools while providing seamless integration and our unique AI validation features.",
  },
  {
    question: "How do team member and project limits work?",
    answer:
      "Each plan has a maximum number of team members and projects you can have. If you need more team members or projects, you'll need to upgrade to a higher plan. These limits help us provide fair pricing while ensuring quality service for all users.",
  },
  {
    question: "How do AI validation and API call limits work?",
    answer:
      "Each plan includes a monthly allowance for AI validations and API calls. If you exceed these limits, you'll be charged at the overage rate. You can monitor your usage in real-time through the dashboard and set up alerts to avoid unexpected charges.",
  },
  {
    question: "What happens if I exceed my monthly limits?",
    answer:
      "For AI validations and API calls, you'll be charged the overage rate for any usage beyond your plan limits. For team members and projects, you'll need to upgrade to a higher plan. We'll notify you when you're approaching your limits so you can plan accordingly.",
  },
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing adjustments.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "No, we don't offer a free trial, but we are considering it in the future.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
  },
  {
    question: "What's included in AI validation?",
    answer:
      "Our AI validation includes market research, competitive analysis, financial projections, target audience identification, technology assessment, and risk analysis to help validate your SaaS ideas.",
  },
  {
    question: "What can I do with API access?",
    answer:
      "Our REST API allows you to integrate RayAI with your existing tools, automate workflows, sync data with your CRM, and build custom integrations. Perfect for developers and teams who need programmatic access to their data.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            All-in-one platform
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Pricing that scales with you
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All-in-one SaaS management platform. Everything you need to build,
            validate, and scale your product.
          </p>
        </div>
      </div>

      {/* Value Comparison */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
              One platform, everything you need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build, validate, and scale your SaaS with integrated tools that
              work together
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left side - Separate tools */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <h3 className="text-lg font-semibold text-foreground">
                  Buying separately
                </h3>
              </div>
              <div className="space-y-3">
                {comparisonData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <span className="font-medium text-foreground text-sm">
                          {item.tool}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {item.features}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground text-sm">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">
                    Total monthly cost
                  </span>
                  <span className="text-2xl font-bold text-destructive">
                    $1,000+
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Plus integration headaches
                </p>
              </div>
            </div>

            {/* Right side - Ray */}
            <div className="relative">
              <div className="bg-background border-2 border-primary/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold text-foreground">
                    RayAI Bundle
                  </h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm">
                      All features above + AI validation
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm">
                      Seamless integrations
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm">
                      Single dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm">
                      Priority support
                    </span>
                  </div>
                </div>
                <div className="border-t border-primary/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Total monthly cost
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      from $29
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Everything integrated seamlessly
                  </p>
                </div>
                <div className="mt-4 p-3 bg-primary text-primary-foreground rounded-lg text-center">
                  <span className="font-semibold text-sm">
                    One platform, unlimited potential
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            Choose your plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start building your SaaS empire with the right tools
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative p-6 ${
                plan.popular
                  ? "border-2 border-primary shadow-lg bg-gradient-to-br " +
                    plan.gradient
                  : "border border-border bg-background"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {plan.icon}
                  <h3 className="text-xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                </div>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1 text-base">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
                {plan.savings && (
                  <div className="mt-3 p-2 bg-muted rounded border border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Complete SaaS toolkit
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                {/* Core Features */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Core Features
                  </div>
                  <div className="space-y-2">
                    {plan.features.core.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Limits
                  </div>
                  <div className="space-y-2">
                    {plan.features.limits.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Features (Pro & Team only) */}
                {plan.features.advanced && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Advanced Features
                    </div>
                    <div className="space-y-2">
                      {plan.features.advanced.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Support
                  </div>
                  <div className="space-y-2">
                    {plan.features.support.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Not Available Features */}
                {plan?.notAvailable?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 opacity-50"
                  >
                    <X className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm line-through text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Pricing Table */}
      <DetailedPricingTable />

      {/* Usage Calculator */}
      <UsageCalculator />

      {/* FAQ Section */}
      <div className="border-t border-border/50 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-4 bg-background"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <h3 className="text-base font-semibold text-foreground">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
