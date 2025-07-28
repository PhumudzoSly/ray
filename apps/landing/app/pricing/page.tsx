import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Check,
  ArrowRight,
  X,
  Star,
  Zap,
  Users,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for solo founders and small teams",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "2 team members",
      "2 SaaS ideas with AI validation",
      "10 projects",
      "Project management",
      "Unlimited roadmaps",
      "Unlimited waitlists",
      "Unlimited user feedback",
      "Unlimited issue tracking",
      "Complete SaaS management",
    ],
    notAvailable: [
      "Advanced AI validation",
      "API access",
      "Custom integrations",
      "Priority support",
      "AI Agent (Coming soon)",
      "Inbox (Coming soon)",
    ],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$150+",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For growing teams and serious builders",
    icon: <Star className="w-5 h-5" />,
    features: [
      "Up to 10 team members",
      "10 SaaS ideas with AI validation",
      "Unlimited projects",
      "Advanced project management",
      "Unlimited public roadmaps",
      "Unlimited waitlists",
      "Unlimited user feedback",
      "Unlimited issue tracking",
      "AI Agent (Coming soon)",
      "Inbox (Coming soon)",
      "Priority support",
      "Complete API access",
      "Custom integrations",
      "Advanced AI validation features",
    ],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: true,
    savings: "$300+",
  },
  {
    name: "Team",
    price: "$299",
    period: "/month",
    description: "For established teams and organizations",
    icon: <Users className="w-5 h-5" />,
    features: [
      "Up to 100 team members",
      "Unlimited SaaS ideas",
      "Advanced permissions & roles",
      "Unlimited public roadmaps",
      "Unlimited waitlists",
      "Unlimited user feedback",
      "Unlimited issue tracking",
      "AI Agent (Coming soon)",
      "Inbox (Coming soon)",
      "Priority support",
      "Complete API access",
      "Custom integrations",
      "Advanced AI validation features",
    ],
    notAvailable: [],
    cta: "Start Building",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$1000+",
  },
];

const comparisonData = [
  {
    tool: "Linear Pro",
    price: "$14/user/month",
    features: "Project management + Issue tracking",
  },
  {
    tool: "Productboard",
    price: "$19/maker/month",
    features: "Roadmaps",
  },
  {
    tool: "LaunchList",
    price: "$29/month",
    features: "Waitlists",
  },
  {
    tool: "UserVoice",
    price: "$899/month",
    features: "User feedback",
  },
  {
    tool: "Custom AI Validation",
    price: "$200-500/month",
    features: "Market research & analysis",
  },
];

const faqs = [
  {
    question: "How much would this cost if I bought each tool separately?",
    answer:
      "Building this stack with separate tools would cost $200-400/month for a small team. Our all-in-one platform saves you 50-75% while providing better integration and our unique AI validation features.",
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
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold text-foreground mb-4">
            Pricing that scales with you.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All-in-one SaaS management platform. Save 50-75% vs. buying separate
            tools.
          </p>
        </div>
      </div>

      {/* Value Comparison */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Stop paying for 5 different tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Get everything you need in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Separate tools */}
            <div>
              <h3 className="text-xl font-medium text-foreground mb-6">
                Buying separately
              </h3>
              <div className="space-y-4">
                {comparisonData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {item.tool}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {item.features}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-foreground">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">
                    Total monthly cost
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    $1,000+
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  For a 5-person team
                </p>
              </div>
            </div>

            {/* Right side - Ray */}
            <div className="relative">
              <div className="absolute -inset-4 bg-foreground/5 rounded-lg"></div>
              <div className="relative bg-background border-2 border-foreground rounded-lg p-8">
                <h3 className="text-xl font-medium text-foreground mb-6">
                  RayAI Bundle
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">
                      All features above + AI validation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Seamless integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Single dashboard</span>
                  </div>
                </div>
                <div className="border-t-2 border-foreground pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Total monthly cost
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      from $29
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    For up to 100 team members
                  </p>
                </div>
                <div className="mt-4 p-3 bg-foreground text-background rounded text-center">
                  <span className="font-semibold">Save $100-300/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative p-8 ${
                plan.popular
                  ? "border-2 border-foreground bg-gray-100"
                  : "border border-border bg-background"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-3 py-1 text-xs font-medium bg-background text-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  {plan.icon}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
                {plan.savings && (
                  <div className="mt-3 p-2 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Save {plan.savings} vs. separate tools
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan?.notAvailable?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 opacity-50"
                  >
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm line-through">{feature}</span>
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

      {/* FAQ Section */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-12">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border pb-4">
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
