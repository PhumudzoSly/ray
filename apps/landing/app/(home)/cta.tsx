"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
              <div className="space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="space-y-4">
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-sm font-medium"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Ready to Launch?
                  </Badge>

                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    Build the next unicorn{" "}
                    <span className="inline-flex items-center">
                      🦄
                      <Sparkles className="w-8 h-8 md:w-10 md:h-10 ml-2 text-primary" />
                    </span>
                  </h2>

                  <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Ready to build something that matters? Start your journey
                    today and join thousands of successful builders.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold h-auto group"
                    asChild
                  >
                    <Link
                      href="/auth/sign-in"
                      className="flex items-center gap-2"
                    >
                      <span>Get started</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 text-lg h-auto"
                    asChild
                  >
                    <a
                      href="https://getwaitlist.com/waitlist/25597"
                      className="flex items-center gap-2"
                    >
                      <span>Talk to sales</span>
                    </a>
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cancel anytime – Start scaling without risk!
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    No credit card required
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Join 2,500+ successful builders
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
