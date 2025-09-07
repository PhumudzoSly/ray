import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Check, ArrowRight, X, Star, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { plans, comparisonData, faqs } from "./data";
import { DetailedPricingTable } from "./_components/detailed-pricing-table";
import { UsageCalculator } from "./_components/usage-calculator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ray AI Pricing - Affordable Plans for Every SaaS Stage",
  description:
    "Choose the perfect Ray AI plan for your SaaS. Flexible pricing for idea validation, product management, and growth. Get started with our free tier or scale up with Pro and Enterprise plans.",
  keywords: [
    "SaaS pricing",
    "AI platform cost",
    "product management pricing",
    "startup plans",
    "enterprise SaaS",
    "subscription plans",
    "Ray AI cost",
  ],
  authors: [{ name: "Ray AI" }],
  creator: "Ray AI",
  publisher: "Ray AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rayai.dev/pricing",
    siteName: "Ray AI",
    title: "Ray AI Pricing - Affordable Plans for Every SaaS Stage",
    description:
      "Choose the perfect Ray AI plan for your SaaS. Flexible pricing for idea validation, product management, and growth. Get started with our free tier or scale up with Pro and Enterprise plans.",
    images: [
      {
        url: "https://rayai.dev/og-image.jpg", // Replace with an actual image for your pricing page
        width: 1200,
        height: 630,
        alt: "Ray AI Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ray AI Pricing - Affordable Plans for Every SaaS Stage",
    description:
      "Choose the perfect Ray AI plan for your SaaS. Flexible pricing for idea validation, product management, and growth. Get started with our free tier or scale up with Pro and Enterprise plans.",
    images: ["https://rayai.dev/twitter-image.jpg"], // Replace with an actual image for your pricing page
    creator: "@rayai_dev",
  },
  alternates: {
    canonical: "https://rayai.dev/pricing",
  },
  category: "SaaS Pricing",
};

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
                <Link href={plan.href as any}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ))}
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
