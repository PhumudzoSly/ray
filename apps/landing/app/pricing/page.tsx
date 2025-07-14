import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Check, ArrowRight, X } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for small teams and vide coders",
    features: [
      "Up to 2 team members",
      "10 Projects",
      "Full idea validation",
      "Unlimited AI issue tracking",
      "Up to 5 waitlists",
      "Up to 5 public roadmaps",
      "Feature requests & management",
      "Basic visual app flow",
      "AI prompts builder",
      "Unlimited User feedback",
      "Launch AI",
    ],
    notAvailable: ["Premium support", "AI Agent", "Inbox (Coming soon)"],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
  },
  {
    name: "Pro",
    price: "$59",
    period: "/month",
    description: "For serious builders and growing teams",
    features: [
      "Up to 10 team members",
      "Everything in Starter",
      "Unlimited projects",
      "Advanced idea validation",
      "Full project management & tracking",
      "Full visual app flows",
      "Up to 10 waitlists",
      "Up to 10 public roadmaps",
      "AI user feedback analysis",
      "Premium support",
      "Limited AI Agent",
      "Early access to new features",
      "Inbox (Coming soon)",
    ],
    notAvailable: [],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: true,
  },
  {
    name: "Team",
    price: "$299",
    period: "/month",
    description: "For growing teams and organizations",
    features: [
      "Unlimited team members",
      "Everything in Pro",
      "Advanced permissions",
      "Complete issue tracking",
      "Unlimited waitlist",
      "Unlimited public roadmaps",
      "Full AI Agent",
      "Advanced analytics & reporting",
      "Dedicated support",
    ],
    notAvailable: [],
    cta: "Start Building",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing adjustments.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "No, we don't offer a free trial, but feel free to  self-host the app and use the free version of Ray AI.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.notAvailable.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <X className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border pb-6">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of builders who are shipping faster with Ray AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
