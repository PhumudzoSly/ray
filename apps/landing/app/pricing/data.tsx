import {
  Star,
  Zap,
  Users,
  TrendingUp,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for solo founders.",
    icon: <Zap className="w-6 h-6 text-blue-500" />,
    features: {
      core: [
        "Unlimited roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Full SaaS management",
        "REST API access",
      ],
      limits: ["Solo builders", "2 ideas", "5 projects"],
      support: ["Email support"],
    },
    notAvailable: [
      "User feedback system",
      "AI Agent (Coming soon)",
      "Inbox (Coming soon)",
      "Custom integrations",
    ],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$150+",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing teams and serious builders",
    icon: <Star className="w-6 h-6 text-amber-500" />,
    features: {
      core: [
        "Unlimited public roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Full SaaS management",
        "REST API access",
      ],
      limits: ["Up to 5 team members", "5 ideas", "25 projects"],
      advanced: [
        "User feedback system",
        "Agent (Coming soon)",
        "Inbox (Coming soon)",
        "Custom integrations",
      ],
      support: ["Priority support"],
    },
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: true,
    savings: "$300+",
    gradient: "from-amber-50 via-orange-50 to-red-50",
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For established teams and organizations",
    icon: <Users className="w-6 h-6 text-emerald-500" />,
    features: {
      core: [
        "Unlimited public roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Full SaaS management",
        "REST API access",
      ],
      limits: ["Up to 50 team members", "10 ideas", "50 projects"],
      advanced: [
        "User feedback system",
        "Agent (Coming soon)",
        "Inbox (Coming soon)",
        "Custom integrations",
      ],
      support: ["Priority support"],
    },
    notAvailable: [],
    cta: "Start Building",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$1000+",
    gradient: "from-emerald-50 to-teal-50",
  },
];

export const comparisonData = [
  {
    tool: "Linear Pro",
    price: "$10/user/month",
    features: "Project management + Issue tracking",
    icon: <Target className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "Productboard",
    price: "$19/maker/month",
    features: "Roadmaps",
    icon: <BarChart3 className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "LaunchList",
    price: "$29/month",
    features: "Waitlists",
    icon: <TrendingUp className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "UserVoice",
    price: "$899/month",
    features: "User feedback",
    icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />,
  },
  {
    tool: "Custom AI Validation",
    price: "$200-500/month",
    features: "Market research & analysis",
    icon: <Sparkles className="w-5 h-5 text-muted-foreground" />,
  },
];

export const faqs = [
  {
    question: "How much would this cost if I bought each tool separately?",
    answer:
      "Building this stack with separate tools would cost $200-400/month for a small team. Our all-in-one platform eliminates the complexity of managing multiple tools while providing seamless integration and powerful features.",
  },
  {
    question: "How do plan limits work?",
    answer:
      "Each plan has specific limits for team members, projects, and ideas to help us provide fair pricing while ensuring quality service. These limits are designed to match typical usage patterns for different team sizes.",
  },
  {
    question: "What happens if I need more than my plan allows?",
    answer:
      "Simply upgrade to a higher plan that meets your needs. We'll notify you when you're approaching your limits, and upgrades take effect immediately with prorated billing.",
  },
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing adjustments.",
  },

  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
  },
  {
    question: "What's included in the REST API access?",
    answer:
      "Our REST API allows you to integrate RayAI with your existing tools, automate workflows, sync data with your CRM, and build custom integrations. Perfect for developers and teams who need programmatic access to their data.",
  },
  {
    question: "What makes the Enterprise plan special?",
    answer:
      "The Enterprise plan includes advanced analytics, white-label options, higher limits for larger teams, and dedicated account management to help you get the most out of RayAI for your organization.",
  },
];
