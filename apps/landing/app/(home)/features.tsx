"use client";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp10,
  Grid2X2,
  Layers,
  Lightbulb,
  ListStart,
  Zap,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";

interface BentoGridItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  mockup: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
}

const BentoGridItem = ({
  title,
  description,
  icon,
  mockup,
  className,
  size = "small",
}: BentoGridItemProps) => {
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
              {icon}
            </div>
            <Badge variant="secondary" className="text-xs">
              Feature
            </Badge>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* SVG Mockup */}
        <div className="flex-1 p-6 pt-0">
          <div className="w-full h-full bg-muted/20 rounded-md p-4 border border-border/50">
            {mockup}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <Link
            href="/features"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="mr-2">Learn more</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const features = [
  {
    title: "Idea Validation",
    description:
      "Validate your SaaS ideas with AI-powered market research and competitor analysis before building.",
    icon: <Lightbulb className="w-4 h-4" />,
    size: "large" as const,
    mockup: (
      <svg viewBox="0 0 300 180" className="w-full h-full">
        {/* Clean validation interface */}
        <rect
          width="300"
          height="180"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="300" height="40" fill="#fafafa" />
        <text x="16" y="25" fontSize="12" fontWeight="500" fill="#111827">
          Idea Validation
        </text>

        {/* Search input */}
        <rect
          x="16"
          y="55"
          width="268"
          height="32"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="24" y="73" fontSize="11" fill="#6b7280">
          AI-powered task management for teams
        </text>

        {/* Results */}
        <rect
          x="16"
          y="105"
          width="130"
          height="50"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="24" y="120" fontSize="10" fill="#6b7280">
          Market Demand
        </text>
        <text x="24" y="138" fontSize="16" fontWeight="600" fill="#111827">
          High
        </text>
        <text x="24" y="148" fontSize="9" fill="#6b7280">
          Score: 8.7/10
        </text>

        <rect
          x="154"
          y="105"
          width="130"
          height="50"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="162" y="120" fontSize="10" fill="#6b7280">
          Competition
        </text>
        <text x="162" y="138" fontSize="16" fontWeight="600" fill="#111827">
          Medium
        </text>
        <text x="162" y="148" fontSize="9" fill="#6b7280">
          17 competitors
        </text>
      </svg>
    ),
  },
  {
    title: "Project Management",
    description:
      "Organize tasks, track progress, and collaborate with your team in a clean, intuitive interface.",
    icon: <Layers className="w-4 h-4" />,
    size: "small" as const,
    mockup: (
      <svg viewBox="0 0 260 160" className="w-full h-full">
        {/* Clean kanban board */}
        <rect
          width="260"
          height="160"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="260" height="32" fill="#fafafa" />
        <text x="12" y="20" fontSize="11" fontWeight="500" fill="#111827">
          Project Board
        </text>

        {/* Columns */}
        <rect
          x="12"
          y="45"
          width="75"
          height="100"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="18" y="60" fontSize="9" fontWeight="500" fill="#111827">
          To Do
        </text>

        <rect
          x="92"
          y="45"
          width="75"
          height="100"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="98" y="60" fontSize="9" fontWeight="500" fill="#111827">
          In Progress
        </text>

        <rect
          x="172"
          y="45"
          width="75"
          height="100"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="178" y="60" fontSize="9" fontWeight="500" fill="#111827">
          Done
        </text>

        {/* Task cards */}
        <rect
          x="18"
          y="70"
          width="63"
          height="20"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="22" y="82" fontSize="8" fill="#111827">
          User Auth
        </text>

        <rect
          x="98"
          y="70"
          width="63"
          height="20"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="102" y="82" fontSize="8" fill="#111827">
          Dashboard
        </text>

        <rect
          x="178"
          y="70"
          width="63"
          height="20"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="182" y="82" fontSize="8" fill="#111827">
          Setup
        </text>
      </svg>
    ),
  },
  {
    title: "Visual App Flows",
    description:
      "Design and visualize your application architecture with AI-powered flow generation.",
    icon: <Grid2X2 className="w-4 h-4" />,
    size: "medium" as const,
    mockup: (
      <svg viewBox="0 0 280 140" className="w-full h-full">
        {/* Clean flow diagram */}
        <rect
          width="280"
          height="140"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="280" height="28" fill="#fafafa" />
        <text x="12" y="18" fontSize="10" fontWeight="500" fill="#111827">
          Flow Builder
        </text>

        {/* Flow nodes */}
        <rect
          x="20"
          y="45"
          width="60"
          height="24"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="35" y="59" fontSize="8" fill="#111827">
          Login
        </text>

        <rect
          x="110"
          y="45"
          width="60"
          height="24"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="120" y="59" fontSize="8" fill="#111827">
          Dashboard
        </text>

        <rect
          x="200"
          y="45"
          width="60"
          height="24"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="215" y="59" fontSize="8" fill="#111827">
          Tasks
        </text>

        {/* Connecting lines */}
        <path
          d="M80 57 L110 57"
          stroke="#e5e7eb"
          strokeWidth="1"
          markerEnd="url(#arrow)"
        />
        <path
          d="M170 57 L200 57"
          stroke="#e5e7eb"
          strokeWidth="1"
          markerEnd="url(#arrow)"
        />

        {/* Decision node */}
        <rect
          x="105"
          y="85"
          width="70"
          height="20"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="125" y="97" fontSize="8" fill="#6b7280">
          Authentication
        </text>

        <path d="M140 69 L140 85" stroke="#e5e7eb" strokeWidth="1" />

        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#e5e7eb" />
          </marker>
        </defs>
      </svg>
    ),
  },
  {
    title: "Public Roadmap",
    description:
      "Share your product roadmap publicly and collect feedback from your community.",
    icon: <ListStart className="w-4 h-4" />,
    size: "medium" as const,
    mockup: (
      <svg viewBox="0 0 280 140" className="w-full h-full">
        {/* Clean roadmap */}
        <rect
          width="280"
          height="140"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="280" height="28" fill="#fafafa" />
        <text x="12" y="18" fontSize="10" fontWeight="500" fill="#111827">
          Product Roadmap
        </text>

        {/* Timeline */}
        <rect x="20" y="45" width="2" height="80" fill="#e5e7eb" />

        {/* Milestones */}
        <circle cx="21" cy="60" r="3" fill="#111827" />
        <rect
          x="35"
          y="52"
          width="200"
          height="16"
          rx="2"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="40" y="62" fontSize="9" fill="#111827">
          Q1 - Core Features
        </text>

        <circle cx="21" cy="85" r="3" fill="#6b7280" />
        <rect
          x="35"
          y="77"
          width="200"
          height="16"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="40" y="87" fontSize="9" fill="#111827">
          Q2 - AI Integration
        </text>

        <circle cx="21" cy="110" r="3" fill="#d1d5db" />
        <rect
          x="35"
          y="102"
          width="200"
          height="16"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="40" y="112" fontSize="9" fill="#6b7280">
          Q3 - Mobile App
        </text>
      </svg>
    ),
  },
  {
    title: "Launch Readiness",
    description:
      "Track your project's health and readiness across code quality, documentation, and testing.",
    icon: <Zap className="w-4 h-4" />,
    size: "small" as const,
    mockup: (
      <svg viewBox="0 0 260 160" className="w-full h-full">
        {/* Clean readiness dashboard */}
        <rect
          width="260"
          height="160"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="260" height="28" fill="#fafafa" />
        <text x="12" y="18" fontSize="10" fontWeight="500" fill="#111827">
          Launch Status
        </text>

        {/* Score circle */}
        <circle
          cx="130"
          cy="80"
          r="20"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="130"
          cy="80"
          r="20"
          fill="none"
          stroke="#111827"
          strokeWidth="3"
          strokeDasharray="94"
          strokeDashoffset="20"
          transform="rotate(-90 130 80)"
        />
        <text
          x="130"
          y="80"
          fontSize="14"
          fontWeight="600"
          fill="#111827"
          textAnchor="middle"
        >
          78%
        </text>
        <text x="130" y="92" fontSize="8" fill="#6b7280" textAnchor="middle">
          Ready
        </text>

        {/* Category scores */}
        <rect
          x="20"
          y="115"
          width="65"
          height="30"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="25" y="127" fontSize="8" fill="#6b7280">
          Code
        </text>
        <text x="25" y="138" fontSize="11" fontWeight="600" fill="#111827">
          92%
        </text>

        <rect
          x="97"
          y="115"
          width="65"
          height="30"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="102" y="127" fontSize="8" fill="#6b7280">
          Docs
        </text>
        <text x="102" y="138" fontSize="11" fontWeight="600" fill="#111827">
          67%
        </text>

        <rect
          x="175"
          y="115"
          width="65"
          height="30"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="180" y="127" fontSize="8" fill="#6b7280">
          Tests
        </text>
        <text x="180" y="138" fontSize="11" fontWeight="600" fill="#111827">
          85%
        </text>
      </svg>
    ),
  },
  {
    title: "Growth Analytics",
    description:
      "Get AI-powered insights on user behavior, growth metrics, and optimization opportunities.",
    icon: <ArrowUp10 className="w-4 h-4" />,
    size: "large" as const,
    mockup: (
      <svg viewBox="0 0 300 180" className="w-full h-full">
        {/* Clean analytics dashboard */}
        <rect
          width="300"
          height="180"
          rx="4"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Header */}
        <rect width="300" height="32" fill="#fafafa" />
        <text x="16" y="21" fontSize="11" fontWeight="500" fill="#111827">
          Growth Analytics
        </text>

        {/* Metrics */}
        <rect
          x="16"
          y="50"
          width="65"
          height="40"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="22" y="62" fontSize="8" fill="#6b7280">
          Users
        </text>
        <text x="22" y="78" fontSize="14" fontWeight="600" fill="#111827">
          2,847
        </text>
        <text x="22" y="86" fontSize="7" fill="#6b7280">
          +23%
        </text>

        <rect
          x="89"
          y="50"
          width="65"
          height="40"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="95" y="62" fontSize="8" fill="#6b7280">
          Revenue
        </text>
        <text x="95" y="78" fontSize="14" fontWeight="600" fill="#111827">
          $12.4k
        </text>
        <text x="95" y="86" fontSize="7" fill="#6b7280">
          +45%
        </text>

        <rect
          x="162"
          y="50"
          width="65"
          height="40"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="168" y="62" fontSize="8" fill="#6b7280">
          Retention
        </text>
        <text x="168" y="78" fontSize="14" fontWeight="600" fill="#111827">
          87%
        </text>
        <text x="168" y="86" fontSize="7" fill="#6b7280">
          +12%
        </text>

        <rect
          x="235"
          y="50"
          width="49"
          height="40"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="241" y="62" fontSize="8" fill="#6b7280">
          Churn
        </text>
        <text x="241" y="78" fontSize="14" fontWeight="600" fill="#111827">
          2.1%
        </text>
        <text x="241" y="86" fontSize="7" fill="#6b7280">
          -8%
        </text>

        {/* AI insights */}
        <rect
          x="16"
          y="110"
          width="268"
          height="55"
          rx="3"
          fill="#fafafa"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="22" y="125" fontSize="10" fontWeight="500" fill="#111827">
          AI Insights
        </text>

        <rect
          x="22"
          y="135"
          width="256"
          height="12"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="26" y="143" fontSize="8" fill="#111827">
          Optimize onboarding flow for 15% better retention
        </text>

        <rect
          x="22"
          y="150"
          width="256"
          height="12"
          rx="2"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <text x="26" y="158" fontSize="8" fill="#6b7280">
          Add feature tooltips to increase engagement by 8%
        </text>
      </svg>
    ),
  },
];

export default function Features() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="py-20 bg-background" id="features">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to build faster
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, powerful tools that help you validate ideas, manage
            projects, and launch successful products.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <BentoGridItem
              key={i}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              mockup={feature.mockup}
              size={feature.size}
              className={cn(
                feature.size === "large"
                  ? "lg:col-span-4"
                  : feature.size === "medium"
                    ? "lg:col-span-3"
                    : "lg:col-span-2",
                "min-h-[350px]"
              )}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
