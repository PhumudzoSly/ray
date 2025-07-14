import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Check, ArrowRight, X, Star, Zap, Users } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for small teams and vide coders",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Up to 2 team members",
      "3 SaaS Ideas",
      "15 Projects",
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
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: "$59",
    period: "/month",
    description: "For serious builders and growing teams",
    icon: <Star className="w-6 h-6" />,
    features: [
      "Up to 10 team members",
      "5 SaaS Ideas",
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
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Team",
    price: "$299",
    period: "/month",
    description: "For growing teams and organizations",
    icon: <Users className="w-6 h-6" />,
    features: [
      "Unlimited team members",
      "Unlimited SaaS Ideas",
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
    gradient: "from-orange-500 to-red-500",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="relative border-b border-border/50 bg-gradient-to-r from-background to-muted/10">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <Badge variant="info">Pricing</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose the plan that's right for you.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`group relative p-8 lg:p-10 ${
                plan.popular
                  ? "border-primary/50 scale-105 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 ring-1 ring-primary/20"
                  : "border-border/50 hover:border-primary/30 bg-card/20 backdrop-blur-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-10">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-lg text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group/feature"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-800" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover/feature:text-foreground transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.notAvailable.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 opacity-60"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                      <X className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground line-through">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button asChild variant={plan.popular ? "default" : "outline"}>
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-border/50 bg-gradient-to-r from-muted/10 to-background">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <div className="border-b border-border/50 pb-8 hover:border-border transition-colors">
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
