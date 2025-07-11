"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  ChartArea,
  CheckCircle2,
  ListCollapseIcon,
  ReplaceAll,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import Image from "next/image";

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
      <Badge className="px-4 py-2 text-sm bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors duration-300">
        🚀 Just Launched! 🚀
      </Badge>
    );
  }

  return (
    <Badge className="px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300">
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
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-background border border-primary/10 backdrop-blur-xl hover:border-primary/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
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
  <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
    {/* Advanced Animated SVG Light Background */}
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Animated Gradient Definitions - Theme Aware */}
          <radialGradient id="lightGradient1" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)">
              <animate
                attributeName="stop-color"
                values="hsl(var(--primary) / 0.3);hsl(var(--primary) / 0.4);hsl(var(--primary) / 0.2);hsl(var(--primary) / 0.3)"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.2)">
              <animate
                attributeName="stop-color"
                values="hsl(var(--primary) / 0.2);hsl(var(--primary) / 0.25);hsl(var(--primary) / 0.15);hsl(var(--primary) / 0.2)"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="lightGradient2" cx="30%" cy="70%" r="35%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)">
              <animate
                attributeName="stop-color"
                values="hsl(var(--primary) / 0.4);hsl(var(--primary) / 0.3);hsl(var(--primary) / 0.5);hsl(var(--primary) / 0.4)"
                dur="12s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="60%" stopColor="hsl(var(--primary) / 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <linearGradient
            id="streamGradient1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="hsl(var(--primary) / 0.6)">
              <animate
                attributeName="stop-color"
                values="hsl(var(--primary) / 0.6);hsl(var(--primary) / 0.7);hsl(var(--primary) / 0.5);hsl(var(--primary) / 0.6)"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="70%" stopColor="hsl(var(--primary) / 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <linearGradient
            id="streamGradient2"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="hsl(var(--primary) / 0.5)">
              <animate
                attributeName="stop-color"
                values="hsl(var(--primary) / 0.5);hsl(var(--primary) / 0.6);hsl(var(--primary) / 0.4);hsl(var(--primary) / 0.5)"
                dur="9s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="75%" stopColor="hsl(var(--primary) / 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Blur Filters */}
          <filter id="blur1" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
          <filter id="blur2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
          </filter>
          <filter id="blur3" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
        </defs>

        {/* Floating Light Orbs */}
        <circle
          cx="200"
          cy="150"
          r="60"
          fill="url(#lightGradient1)"
          filter="url(#blur2)"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 100,50; 0,100; -50,20; 0,0"
            dur="20s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="60;90;60;40;60"
            dur="15s"
            repeatCount="indefinite"
          />
        </circle>

        <circle
          cx="800"
          cy="200"
          r="80"
          fill="url(#lightGradient2)"
          filter="url(#blur3)"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -80,60; 40,-40; 120,30; 0,0"
            dur="25s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="80;50;100;70;80"
            dur="18s"
            repeatCount="indefinite"
          />
        </circle>

        <circle
          cx="1000"
          cy="600"
          r="70"
          fill="url(#lightGradient1)"
          filter="url(#blur2)"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -60,-80; 80,40; -40,60; 0,0"
            dur="22s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="70;40;90;60;70"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Flowing Light Streams */}
        <path
          d="M0,400 Q300,200 600,400 T1200,300"
          fill="none"
          stroke="url(#streamGradient1)"
          strokeWidth="3"
          filter="url(#blur1)"
          opacity="0.7"
        >
          <animate
            attributeName="d"
            values="M0,400 Q300,200 600,400 T1200,300;M0,350 Q350,150 650,350 T1200,250;M0,450 Q250,250 550,450 T1200,350;M0,400 Q300,200 600,400 T1200,300"
            dur="30s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M1200,100 Q900,300 600,100 T0,200"
          fill="none"
          stroke="url(#streamGradient2)"
          strokeWidth="2"
          filter="url(#blur1)"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="M1200,100 Q900,300 600,100 T0,200;M1200,150 Q850,350 550,150 T0,250;M1200,50 Q950,250 650,50 T0,150;M1200,100 Q900,300 600,100 T0,200"
            dur="35s"
            repeatCount="indefinite"
          />
        </path>

        {/* Particle Effects */}
        <g filter="url(#blur1)">
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              cx={100 + i * 100}
              cy={300 + Math.sin(i) * 100}
              r="2"
              fill={`hsl(var(--primary) / ${0.8 - i * 0.05})`}
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; ${20 - i * 3},${-50 + i * 10}; 0,${100 - i * 8}`}
                dur={`${8 + i * 0.7}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Background Mesh Gradient */}
        <rect
          width="100%"
          height="100%"
          fill="url(#lightGradient1)"
          opacity="0.1"
        />
      </svg>
    </div>

    {/* Gradient Background with fade-out effect - Theme Aware */}
    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-background/90" />

    {/* Radial Gradient Accent - Theme Aware */}
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-60" />

    <div className="relative w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-7xl"
          >
            <CountdownTimer />
            <h1 className="text-6xl font-bold tracking-tight xl:text-7xl/none text-foreground">
              How Future{" "}
              <span className="relative">
                <span className="absolute -inset-1 bg-primary/20 blur-xl" />
                <span className="relative">
                  <span className="text-foreground">Millionaires</span>
                </span>
              </span>{" "}
              <br />
              <span className="text-cyan-400 dark:text-cyan-300">
                Build
              </span> &{" "}
              <span className="text-pink-400 dark:text-pink-300">Ship</span>{" "}
              SaaS.
            </h1>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
              Stop guessing when to launch. Validate your ideas, build features
              & roadmaps, track issues, gather feedback and launch with
              confidence.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Button size="lg" variant={"dark"} asChild>
                <Link href="/auth/sign-in" className="flex items-center gap-2">
                  <span>Start Building</span>
                </Link>
              </Button>
              <Button asChild variant="dark">
                <Link href="/changelog" className="flex items-center gap-3">
                  <ReplaceAll className="w-4 h-4" />
                  Get started
                </Link>
              </Button>
            </div>
            <br />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6 mt-4"
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
          </motion.div>
        </div>
      </div>
    </div>

    {/* Bottom fade-out overlay - Theme Aware */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
  </div>
);

export default Hero;

/* Add this to your globals.css */
/* 
.mask-linear-gradient {
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}
*/
