export interface AnalyticsPlatform {
  name: string;
  description: string;
  platforms: ("web" | "mobile" | "both")[];
  link: string;
  features: string[];
  pricing: "free" | "freemium" | "paid";
}

export const ANALYTICS_PLATFORMS: AnalyticsPlatform[] = [
  {
    name: "Google Analytics",
    description: "Comprehensive web and app analytics platform by Google",
    platforms: ["both"],
    link: "https://analytics.google.com/",
    features: [
      "Real-time analytics",
      "Audience insights",
      "Conversion tracking",
      "Custom reports",
      "E-commerce tracking",
    ],
    pricing: "freemium",
  },
  {
    name: "Adobe Analytics",
    description:
      "Enterprise-grade analytics solution with advanced segmentation",
    platforms: ["both"],
    link: "https://business.adobe.com/products/analytics/adobe-analytics.html",
    features: [
      "Advanced segmentation",
      "Predictive analytics",
      "Real-time data",
      "Cross-device tracking",
    ],
    pricing: "paid",
  },
  {
    name: "Mixpanel",
    description: "Product analytics focused on user behavior and events",
    platforms: ["both"],
    link: "https://mixpanel.com/",
    features: [
      "Event tracking",
      "Funnel analysis",
      "Cohort analysis",
      "A/B testing",
      "User profiles",
    ],
    pricing: "freemium",
  },
  {
    name: "Amplitude",
    description: "Product analytics for understanding user journeys",
    platforms: ["both"],
    link: "https://amplitude.com/",
    features: [
      "User journey mapping",
      "Behavioral cohorts",
      "Retention analysis",
      "Revenue analytics",
    ],
    pricing: "freemium",
  },
  {
    name: "Hotjar",
    description: "User behavior analytics with heatmaps and session recordings",
    platforms: ["web"],
    link: "https://www.hotjar.com/",
    features: [
      "Heatmaps",
      "Session recordings",
      "User feedback",
      "Conversion funnels",
    ],
    pricing: "freemium",
  },
  {
    name: "Plausible Analytics",
    description: "Privacy-focused, lightweight web analytics",
    platforms: ["web"],
    link: "https://plausible.io/",
    features: [
      "Privacy-focused",
      "Lightweight script",
      "Real-time dashboard",
      "No cookies",
    ],
    pricing: "paid",
  },
  {
    name: "Fathom Analytics",
    description: "Simple, privacy-focused website analytics",
    platforms: ["web"],
    link: "https://usefathom.com/",
    features: [
      "Privacy-compliant",
      "Simple dashboard",
      "Fast loading",
      "No cookies",
    ],
    pricing: "paid",
  },
  {
    name: "Matomo",
    description: "Open-source web analytics platform with privacy focus",
    platforms: ["both"],
    link: "https://matomo.org/",
    features: [
      "Open source",
      "Self-hosted option",
      "Privacy compliance",
      "Custom dimensions",
    ],
    pricing: "freemium",
  },
  {
    name: "Firebase Analytics",
    description: "Google's mobile and web app analytics solution",
    platforms: ["both"],
    link: "https://firebase.google.com/products/analytics",
    features: [
      "Mobile-first",
      "Event tracking",
      "Audience insights",
      "Integration with Firebase",
    ],
    pricing: "free",
  },
  {
    name: "Flurry Analytics",
    description: "Mobile analytics platform by Yahoo",
    platforms: ["mobile"],
    link: "https://www.flurry.com/",
    features: [
      "Mobile app analytics",
      "User acquisition",
      "Crash reporting",
      "Push notifications",
    ],
    pricing: "free",
  },
  {
    name: "App Annie (data.ai)",
    description: "Mobile app market intelligence and analytics",
    platforms: ["mobile"],
    link: "https://www.data.ai/",
    features: [
      "App store analytics",
      "Market intelligence",
      "Competitor analysis",
      "Revenue tracking",
    ],
    pricing: "freemium",
  },
  {
    name: "Segment",
    description:
      "Customer data platform that connects to multiple analytics tools",
    platforms: ["both"],
    link: "https://segment.com/",
    features: [
      "Data collection",
      "Multiple integrations",
      "Real-time streaming",
      "Data governance",
    ],
    pricing: "freemium",
  },
  {
    name: "Heap Analytics",
    description: "Automatic event tracking and user behavior analytics",
    platforms: ["both"],
    link: "https://heap.io/",
    features: [
      "Automatic event capture",
      "Retroactive analysis",
      "User sessions",
      "Conversion funnels",
    ],
    pricing: "freemium",
  },
  {
    name: "Crazy Egg",
    description: "Website optimization with heatmaps and A/B testing",
    platforms: ["web"],
    link: "https://www.crazyegg.com/",
    features: ["Heatmaps", "Click tracking", "A/B testing", "User recordings"],
    pricing: "paid",
  },
  {
    name: "Kissmetrics",
    description: "Customer analytics focused on individual user behavior",
    platforms: ["web"],
    link: "https://www.kissmetrics.io/",
    features: [
      "Individual user tracking",
      "Cohort analysis",
      "Funnel reports",
      "Revenue tracking",
    ],
    pricing: "paid",
  },
  {
    name: "Chartbeat",
    description: "Real-time web analytics for content optimization",
    platforms: ["web"],
    link: "https://chartbeat.com/",
    features: [
      "Real-time analytics",
      "Content optimization",
      "Audience engagement",
      "Publishing tools",
    ],
    pricing: "paid",
  },
  {
    name: "Clicky",
    description: "Real-time web analytics with detailed visitor information",
    platforms: ["web"],
    link: "https://clicky.com/",
    features: [
      "Real-time tracking",
      "Individual visitor profiles",
      "Heatmaps",
      "Uptime monitoring",
    ],
    pricing: "freemium",
  },
  {
    name: "Woopra",
    description: "Customer journey analytics across multiple touchpoints",
    platforms: ["both"],
    link: "https://www.woopra.com/",
    features: [
      "Customer journey mapping",
      "Real-time profiles",
      "Behavioral triggers",
      "Multi-channel tracking",
    ],
    pricing: "freemium",
  },
  {
    name: "Localytics",
    description: "Mobile app marketing and analytics platform",
    platforms: ["mobile"],
    link: "https://www.localytics.com/",
    features: [
      "Mobile analytics",
      "Push notifications",
      "In-app messaging",
      "User segmentation",
    ],
    pricing: "freemium",
  },
  {
    name: "Branch",
    description: "Mobile linking and attribution platform with analytics",
    platforms: ["mobile"],
    link: "https://branch.io/",
    features: [
      "Deep linking",
      "Attribution tracking",
      "Campaign analytics",
      "Cross-platform measurement",
    ],
    pricing: "freemium",
  },
  {
    name: "Countly",
    description: "Open-source mobile and web analytics platform",
    platforms: ["both"],
    link: "https://countly.com/",
    features: [
      "Open source",
      "Real-time analytics",
      "Crash reporting",
      "Push notifications",
    ],
    pricing: "freemium",
  },
  {
    name: "Yandex.Metrica",
    description: "Free web analytics tool by Yandex",
    platforms: ["web"],
    link: "https://metrica.yandex.com/",
    features: ["Session replay", "Heatmaps", "Form analysis", "Webvisor"],
    pricing: "free",
  },
  {
    name: "StatCounter",
    description: "Simple web analytics with real-time stats",
    platforms: ["web"],
    link: "https://statcounter.com/",
    features: [
      "Real-time stats",
      "Visitor paths",
      "Popular pages",
      "Search engine stats",
    ],
    pricing: "freemium",
  },
  {
    name: "Umami",
    description: "Simple, privacy-focused web analytics",
    platforms: ["web"],
    link: "https://umami.is/",
    features: [
      "Open source",
      "Privacy-focused",
      "Self-hosted",
      "Simple dashboard",
    ],
    pricing: "free",
  },
  {
    name: "PostHog",
    description: "Open-source product analytics platform",
    platforms: ["both"],
    link: "https://posthog.com/",
    features: [
      "Open source",
      "Feature flags",
      "Session recording",
      "A/B testing",
      "Event tracking",
    ],
    pricing: "freemium",
  },
];

// Helper functions
export const getAnalyticsByPlatform = (platform: "web" | "mobile" | "both") => {
  return ANALYTICS_PLATFORMS.filter(
    (analytics) =>
      analytics.platforms.includes(platform) ||
      analytics.platforms.includes("both")
  );
};

export const getFreeAnalytics = () => {
  return ANALYTICS_PLATFORMS.filter(
    (analytics) => analytics.pricing === "free"
  );
};

export const getFreemiumAnalytics = () => {
  return ANALYTICS_PLATFORMS.filter(
    (analytics) => analytics.pricing === "freemium"
  );
};

export const getPaidAnalytics = () => {
  return ANALYTICS_PLATFORMS.filter(
    (analytics) => analytics.pricing === "paid"
  );
};
