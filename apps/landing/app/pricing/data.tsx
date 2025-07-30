import {
  Check,
  ArrowRight,
  X,
  Star,
  Zap,
  Users,
  TrendingUp,
  Shield,
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
    description: "Perfect for solo founders and small teams",
    icon: <Zap className="w-6 h-6 text-blue-500" />,
    features: {
      core: [
        "Unlimited SaaS ideas",
        "Unlimited roadmaps",
        "Unlimited waitlists",
        "Unlimited issue tracking",
        "Full SaaS management",
      ],
      limits: [
        "2 team members",
        "3 projects",
        "3 idea validations/month",
        "10K API calls/month",
      ],
      support: ["Email support"],
    },
    notAvailable: [
      "User feedback system",
      "AI Agent (Coming soon)",
      "Inbox (Coming soon)",
      "Custom integrations",
      "Priority support",
    ],
    cta: "Get Started",
    href: "https://app.rayai.dev/auth/sign-in",
    popular: false,
    savings: "$150+",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For growing teams and serious builders",
    icon: <Star className="w-6 h-6 text-amber-500" />,
    features: {
      core: [
        "Unlimited SaaS ideas",
        "Unlimited public roadmap",
        "Unlimited waitlist",
        "Unlimited issue tracking",
        "Full SaaS management",
      ],
      limits: [
        "Up to 10 team members",
        "25 projects",
        "8 idea validations/month",
        "100K API calls/month",
      ],
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
    name: "Team",
    price: "$299",
    period: "/month",
    description: "For established teams and organizations",
    icon: <Users className="w-6 h-6 text-emerald-500" />,
    features: {
      core: [
        "Unlimited SaaS ideas",
        "Unlimited public roadmap",
        "Unlimited waitlist",
        "Unlimited issue tracking",
        "Full SaaS management",
      ],
      limits: [
        "Up to 50 team members",
        "100 projects",
        "15 idea validations/month",
        "1M API calls/month",
      ],
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
      "Building this stack with separate tools would cost $200-400/month for a small team. Our all-in-one platform eliminates the complexity of managing multiple tools while providing seamless integration and our unique AI validation features.",
  },
  {
    question: "How do team member and project limits work?",
    answer:
      "Each plan has a maximum number of team members and projects you can have. If you need more team members or projects, you'll need to upgrade to a higher plan. These limits help us provide fair pricing while ensuring quality service for all users.",
  },
  {
    question: "How do AI validation and API call limits work?",
    answer:
      "Each plan includes a monthly allowance for AI validations and API calls. If you exceed these limits, you'll be charged at the overage rate. You can monitor your usage in real-time through the dashboard and set up alerts to avoid unexpected charges.",
  },
  {
    question: "What happens if I exceed my monthly limits?",
    answer:
      "For AI validations and API calls, you'll be charged the overage rate for any usage beyond your plan limits. For team members and projects, you'll need to upgrade to a higher plan. We'll notify you when you're approaching your limits so you can plan accordingly.",
  },
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing adjustments.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "No, we don't offer a free trial, but we are considering it in the future.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
  },
  {
    question: "What's included in AI validation?",
    answer:
      "Our AI validation includes market research, competitive analysis, financial projections, target audience identification, technology assessment, and risk analysis to help validate your SaaS ideas.",
  },
  {
    question: "What can I do with API access?",
    answer:
      "Our REST API allows you to integrate RayAI with your existing tools, automate workflows, sync data with your CRM, and build custom integrations. Perfect for developers and teams who need programmatic access to their data.",
  },
];
