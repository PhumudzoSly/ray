"use client";

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Check, Star, Zap, Crown, Rocket } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for solo builders and early-stage ideas",
    icon: <Rocket className="w-5 h-5" />,
    features: [
      "Basic Idea Validation (5 per month)",
      "Project Management for 2 projects",
      "Visual App Flows (basic templates)",
      "Community support",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
    popular: false,
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For serious builders ready to scale",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "Unlimited Idea Validation",
      "Advanced Project Management",
      "Full Visual App Flows with AI",
      "Public Roadmap with analytics",
      "Growth AI insights",
      "Launch Readiness scoring",
      "Priority email support",
      "14-day free trial",
    ],
    cta: "Start Pro Trial",
    popular: true,
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and agencies building multiple SaaS",
    icon: <Crown className="w-5 h-5" />,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced analytics & reporting",
      "SSO & advanced security",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
    variant: "outline" as const,
  },
];

export default function Pricing() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Simple Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose Your Path to{" "}
            <span className="text-primary">SaaS Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparent pricing for every stage of your journey. Start free,
            scale when ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="px-4 py-1 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`p-8 h-full relative overflow-hidden ${
                  plan.popular
                    ? "border-primary/50 shadow-lg bg-primary/5"
                    : "border-border/50 bg-card/50 backdrop-blur-sm"
                } hover:shadow-lg transition-all duration-300`}
              >
                {/* Header */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        plan.popular ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-lg text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="space-y-4">
                  <Button
                    className="w-full py-3 text-lg font-semibold"
                    variant={plan.variant}
                    asChild
                  >
                    <Link
                      href={
                        plan.name === "Enterprise"
                          ? "/contact"
                          : "/auth/sign-in"
                      }
                    >
                      {plan.cta}
                    </Link>
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    {plan.name === "Enterprise"
                      ? "Custom pricing based on your needs"
                      : "Cancel anytime • No setup fees"}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16 space-y-4"
        >
          <p className="text-lg font-semibold text-foreground">
            Trusted by 2,500+ builders worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 99.9% uptime SLA</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
