"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  ChartArea,
  CheckCircle2,
  ListCollapseIcon,
  ReplaceAll,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLaunched, setIsLaunched] = useState(false);

  useEffect(() => {
    const targetDate = new Date("2025-07-07T00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsLaunched(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLaunched) {
    return (
      <Badge className="px-4 py-2 text-sm bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 transition-colors duration-300">
        🚀 Just Launched! 🚀
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="px-4 py-2 text-sm border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-300"
    >
      <span className="flex items-center gap-2">
        <span>⏰ Launching in</span>
        <span className="font-mono font-bold">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
          {timeLeft.seconds}s
        </span>
      </span>
    </Badge>
  );
};

const features = [
  {
    icon: <ListCollapseIcon className="text-primary" />,
    title: "Validate & Iterate",
    description:
      "Ray validates your ideas with deep research and up to date accurate analysis.",
  },
  {
    icon: <UserPlus className="text-emerald-500" />,
    title: "Build & Launch",
    description:
      "Build app flows, features, track issues, generate PRDs, and launch with confidence.",
  },
  {
    icon: <ChartArea className="text-yellow-500" />,
    title: "Scale with AI",
    description:
      "Gather feedback and scale your SaaS with AI recommendation engine & roadmap.",
  },
];

const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 border border-primary/20">
            {icon}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors duration-300">
            {title}
          </h3>
        </div>
        <p className="text-sm text-left text-muted-foreground leading-relaxed group-hover:text-muted-foreground transition-colors duration-300">
          {description}
        </p>
      </div>
    </Card>
  </motion.div>
);

const Hero = () => (
  <div className="relative mx-auto overflow-hidden min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20">
    {/* Simplified background with subtle gradient */}
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl opacity-40" />
    </div>

    <div className="relative w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-12 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-5xl"
          >
            <CountdownTimer />

            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                How Future{" "}
                <span className="relative">
                  <span className="absolute -inset-1 bg-primary/20 blur-xl" />
                  <span className="relative text-foreground">Millionaires</span>
                </span>{" "}
                <br />
                <span className="text-primary">Build</span> &{" "}
                <span className="text-secondary">Ship</span> SaaS.
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Stop guessing when to launch. Validate your ideas, build
                features & roadmaps, track issues, gather feedback and launch
                with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold h-auto"
                asChild
              >
                <Link href="/auth/sign-in" className="flex items-center gap-2">
                  <span>Start Building</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg h-auto"
                asChild
              >
                <Link href="/changelog" className="flex items-center gap-3">
                  <ReplaceAll className="w-5 h-5" />
                  Get started
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>2,500+ builders trust Ray</span>
              </div>
            </div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

export default Hero;
