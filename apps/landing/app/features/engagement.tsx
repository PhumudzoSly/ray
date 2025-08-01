import { cn } from "@workspace/ui/lib/utils";
import {
  Vote,
  MessageSquare,
  Users,
  BarChart3,
  Share2,
  Mail,
  TrendingUp,
  Heart,
  Zap,
  Globe,
  GitBranch,
  Activity,
} from "lucide-react";
import React from "react";

type FeatureType = {
  title: string;
  icon: any;
  description: string;
};

type EngagementProps = React.ComponentProps<"div"> & {
  feature: FeatureType;
};

function Engagement({ feature, className, ...props }: EngagementProps) {
  const p = genRandomPattern();

  return (
    <div className={cn("relative overflow-hidden p-6", className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={p}
            className="fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>
      <feature.icon
        className="text-foreground/75 size-6"
        strokeWidth={1}
        aria-hidden
      />
      <h3 className="mt-10 text-sm font-medium md:text-base">
        {feature.title}
      </h3>
      <p className="text-muted-foreground relative z-20 mt-2  font-light">
        {feature.description}
      </p>
    </div>
  );
}

export default function CustomerEngagement() {
  const features: FeatureType[] = [
    {
      title: "Public Roadmaps",
      icon: Globe,
      description:
        "Dynamic roadmaps with community voting and AI-powered sentiment analysis.",
    },
    {
      title: "Feature Requests",
      icon: MessageSquare,
      description:
        "Collect, prioritize, and convert customer feedback into actionable features.",
    },
    {
      title: "Waitlist Management",
      icon: Users,
      description:
        "Scale from 100 to 10,000+ signups with referral tracking and analytics.",
    },
    {
      title: "Feedback Collection",
      icon: Heart,
      description:
        "AI-powered sentiment analysis with real-time customer insights.",
    },
    {
      title: "Voting System",
      icon: Vote,
      description:
        "Community-driven feature prioritization with transparent voting mechanisms.",
    },
    {
      title: "Referral Tracking",
      icon: Share2,
      description:
        "Advanced referral system with UTM tracking and conversion analytics.",
    },
    {
      title: "Email Campaigns",
      icon: Mail,
      description:
        "Integrated email service with Resend, SendGrid, and Mailchimp support.",
    },
    {
      title: "Analytics Dashboard",
      icon: BarChart3,
      description:
        "Comprehensive analytics with engagement metrics and conversion tracking.",
    },
    {
      title: "Changelog Management",
      icon: GitBranch,
      description:
        "Version-based changelogs with breaking change notifications.",
    },
    {
      title: "Activity Tracking",
      icon: Activity,
      description: "Real-time activity feeds with team collaboration insights.",
    },
    {
      title: "Growth Automation",
      icon: TrendingUp,
      description:
        "Automated workflows that convert feedback into development tasks.",
    },
    {
      title: "Performance Metrics",
      icon: Zap,
      description:
        "Track engagement velocity and customer satisfaction scores.",
    },
  ];

  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto max-w-7xl space-y-8 px-6 md:space-y-12">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl font-semibold lg:text-5xl">
            Customer Engagement That Converts
          </h2>
          <p className="mt-6 text-lg">
            Turn your product into a growth engine. From public roadmaps to
            waitlist management, Ray AI transforms customer engagement into your
            biggest competitive advantage.
          </p>
        </div>

        <div className="relative mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Engagement
              key={index}
              feature={feature}
              className=" border bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<"svg"> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={x ? x * width : 0}
              y={y ? y * height : 0}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genRandomPattern(length?: number): number[][] {
  length = length ?? 5;
  return Array.from({ length }, () => [
    Math.floor(Math.random() * 4) + 7, // random x between 7 and 10
    Math.floor(Math.random() * 6) + 1, // random y between 1 and 6
  ]);
}
