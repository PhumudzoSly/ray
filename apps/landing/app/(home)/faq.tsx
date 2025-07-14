"use client";

import { motion } from "framer-motion";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  HelpCircle,
  ChevronDown,
  Lightbulb,
  Shield,
  Clock,
  CreditCard,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "How does Ray's Idea Validation actually work?",
    answer:
      "Ray uses advanced AI to conduct deep market research across the web, analyzing competitor landscapes, user feedback, and market trends. It validates your idea by finding real user needs and pain points, giving you data-driven insights in minutes instead of months of guesswork.",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    question: "What's included in the free trial?",
    answer:
      "Your free trial includes full access to core features like Project Management, Visual App Flows, and basic Idea Validation (5 validations). No credit card required, and you can upgrade anytime to unlock unlimited validations and Growth AI insights.",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    question: "How does Growth AI help me scale my SaaS?",
    answer:
      "Growth AI analyzes user feedback, feature usage, and project data to provide actionable insights. It identifies which features drive retention, suggests roadmap priorities, and helps you focus on what actually grows your business instead of vanity metrics.",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    question: "Can I use Ray for multiple SaaS projects?",
    answer:
      "Absolutely! Pro plans support unlimited projects, and Enterprise plans are perfect for agencies managing multiple client projects. Each project gets its own workspace with dedicated analytics and roadmaps.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    question: "How quickly can I see results?",
    answer:
      "Most users get their first idea validation results within 3-5 minutes. Visual App Flows can be generated in under 10 minutes, and you'll start seeing Growth AI insights as soon as you have user data (typically within the first week).",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    question: "Is my data secure with Ray?",
    answer:
      "Yes, we take security seriously. All data is encrypted in transit and at rest, we're SOC 2 compliant, and we never share your business data with third parties. Enterprise plans include SSO and advanced security features.",
    icon: <Shield className="w-5 h-5" />,
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Got Questions? We've Got{" "}
            <span className="text-primary">Answers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Ray AI. Can't find what you're
            looking for? We're here to help.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-md transition-all duration-300">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/20 transition-colors"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {faq.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <div className="pl-14">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16 space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Still have questions?
            </h3>
            <p className="text-lg text-muted-foreground">
              Our team is here to help you succeed. Get in touch and we'll
              answer any questions you have.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-in">Start Free Trial</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Join 2,500+ builders who've already found their answers with Ray AI
          </p>
        </motion.div>
      </div>
    </section>
  );
}
