"use client";
import { cn } from "@/lib/utils";
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
import Link from "next/link";

interface BentoGridItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
}

const BentoGridItem = ({
  title,
  description,
  icon,
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
        "group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-primary/10 bg-background px-6 pb-10 pt-6 shadow-md transition-all duration-500 hover:border-primary/30",
        className
      )}
    >
      <div className="absolute -right-1/2 top-0 z-0 size-full cursor-pointer bg-[linear-gradient(to_right,#3d16165e_1px,transparent_1px),linear-gradient(to_bottom,#3d16165e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="absolute opacity-10 bottom-3 right-1 scale-[6] text-primary/5 transition-all duration-700 group-hover:scale-[6.2] group-hover:text-primary/10">
        {icon}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow shadow-primary/10 transition-all duration-500 group-hover:bg-primary/20 group-hover:shadow-primary/20">
            {icon}
          </div>
          <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Link
          href="#how-it-works"
          className="mt-4 flex items-center text-sm text-primary"
        >
          <span className="mr-1">Learn more</span>
          <ArrowRight className="size-4 transition-all duration-500 group-hover:translate-x-2" />
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/30 blur-2xl transition-all duration-500 group-hover:blur-lg" />
    </motion.div>
  );
};

const items = [
  {
    title: "SaaS Idea Validation",
    description:
      "Gone are the days of wasting money and time building softwares that no one wants. Use our Deep Research validator to search the web, find what users really need and build features that they will love.",
    icon: <Lightbulb className="size-6" />,
    size: "large" as const,
  },
  {
    title: "Project Management",
    description:
      "Create dynamic projects, track your project's progress, features and issues and collaborate with your team to ship high quality SaaS faster..",
    icon: <Layers className="size-6" />,
    size: "small" as const,
  },
  {
    title: "Visual App Flows",
    description:
      "AI-powered app flows that align with your business goals and automatically generate PRDs, implementation plans, and more. Never lose track of your app's core objectives and roadmap.",
    icon: <Grid2X2 className="size-6" />,
    size: "medium" as const,
  },
  {
    title: "Public Roadmap",
    description:
      "Create a public roadmap to show your users what you're working on and get feedback from them and analyze implementation priority with AI.",
    icon: <ListStart className="size-6" />,
    size: "medium" as const,
  },
  {
    title: "Launch Readiness",
    description:
      "Our intelligent scoring system tracks your project's health across architecture, documentation and issues.",
    icon: <Zap className="size-6" />,
    size: "small" as const,
  },
  {
    title: "Growth AI",
    description:
      "Analyze everything about your project, from common issues, user feedback, and progress to get insights on what to improve and what to focus on.",
    icon: <ArrowUp10 className="size-6" />,
    size: "large" as const,
  },
];

export default function Features() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="container px-4 py-12" id="features">
      <h1 className="text-5xl">Everything you need to build & ship faster</h1>
      <p className="text-muted-foreground mt-2 text-lg">
        Ray AI combines visual design tools, AI assistance, and project
        management into one seamless platform for modern builders.
      </p>
      <motion.div
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            icon={item.icon}
            size={item.size}
            className={cn(
              item.size === "large"
                ? "col-span-4"
                : item.size === "medium"
                  ? "col-span-3"
                  : "col-span-2",
              "h-full"
            )}
          />
        ))}
      </motion.div>
    </div>
  );
}
