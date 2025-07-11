export interface NotificationProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: "free" | "freemium" | "paid";
  channels: string[];
  platforms: ("web" | "mobile" | "both")[];
}

export const NOTIFICATION_PROVIDERS: NotificationProvider[] = [
  {
    name: "In-House Notifications",
    description:
      "Custom-built notification system integrated into your application",
    features: [
      "Complete customization",
      "Direct database integration",
      "Custom business logic",
      "No external dependencies",
      "Full control over delivery",
    ],
    link: "#",
    pricing: "free",
    channels: ["In-app", "Email", "SMS", "Push", "Webhook"],
    platforms: ["both"],
  },
  {
    name: "SuprSend",
    description: "Unified notification infrastructure for all channels",
    features: [
      "Multi-channel delivery",
      "Smart routing",
      "Template management",
      "Analytics and insights",
      "Workflow automation",
      "A/B testing",
    ],
    link: "https://www.suprsend.com/",
    pricing: "freemium",
    channels: ["Push", "Email", "SMS", "WhatsApp", "Slack", "In-app"],
    platforms: ["both"],
  },
  {
    name: "Pusher",
    description: "Real-time messaging and push notification service",
    features: [
      "Real-time messaging",
      "Push notifications",
      "Presence channels",
      "Client events",
      "Webhooks",
      "Debug console",
    ],
    link: "https://pusher.com/",
    pricing: "freemium",
    channels: ["Push", "Real-time", "In-app"],
    platforms: ["both"],
  },
  {
    name: "Firebase Cloud Messaging (FCM)",
    description: "Google's cross-platform messaging solution",
    features: [
      "Cross-platform messaging",
      "Topic messaging",
      "Device group messaging",
      "Upstream messaging",
      "Analytics integration",
      "A/B testing",
    ],
    link: "https://firebase.google.com/products/cloud-messaging",
    pricing: "free",
    channels: ["Push", "In-app"],
    platforms: ["both"],
  },
  {
    name: "OneSignal",
    description: "Customer engagement platform for push notifications",
    features: [
      "Push notifications",
      "Email messaging",
      "In-app messaging",
      "SMS messaging",
      "Segmentation",
      "Analytics",
    ],
    link: "https://onesignal.com/",
    pricing: "freemium",
    channels: ["Push", "Email", "SMS", "In-app"],
    platforms: ["both"],
  },
  {
    name: "Twilio",
    description: "Communication platform for SMS, voice, and messaging",
    features: [
      "SMS messaging",
      "Voice calls",
      "WhatsApp messaging",
      "Email API",
      "Video calls",
      "Programmable chat",
    ],
    link: "https://www.twilio.com/",
    pricing: "paid",
    channels: ["SMS", "Voice", "WhatsApp", "Email", "Video"],
    platforms: ["both"],
  },
  {
    name: "Amazon SNS",
    description:
      "Fully managed messaging service for application-to-application communication",
    features: [
      "Pub/Sub messaging",
      "Mobile push notifications",
      "SMS messaging",
      "Email notifications",
      "Message filtering",
      "Dead letter queues",
    ],
    link: "https://aws.amazon.com/sns/",
    pricing: "paid",
    channels: ["Push", "SMS", "Email", "SQS", "Lambda"],
    platforms: ["both"],
  },
  {
    name: "Pusher Beams",
    description: "Cross-platform push notification service",
    features: [
      "Cross-platform push",
      "Rich notifications",
      "Device interests",
      "Authenticated users",
      "Analytics",
      "Delivery insights",
    ],
    link: "https://pusher.com/beams",
    pricing: "freemium",
    channels: ["Push"],
    platforms: ["both"],
  },
  {
    name: "Airship",
    description: "Customer engagement platform for mobile and web",
    features: [
      "Push notifications",
      "In-app messaging",
      "Email messaging",
      "SMS messaging",
      "Automation",
      "Analytics",
    ],
    link: "https://www.airship.com/",
    pricing: "paid",
    channels: ["Push", "In-app", "Email", "SMS"],
    platforms: ["both"],
  },
  {
    name: "Braze",
    description: "Customer engagement platform for lifecycle messaging",
    features: [
      "Cross-channel messaging",
      "Real-time personalization",
      "Canvas journey orchestration",
      "Predictive analytics",
      "A/B testing",
      "Audience segmentation",
    ],
    link: "https://www.braze.com/",
    pricing: "paid",
    channels: ["Push", "Email", "SMS", "In-app", "Web push"],
    platforms: ["both"],
  },
  {
    name: "Expo Push Notifications",
    description:
      "Push notification service for React Native apps built with Expo",
    features: [
      "Easy React Native integration",
      "Cross-platform delivery",
      "Batch sending",
      "Receipt tracking",
      "Free tier",
      "Simple API",
    ],
    link: "https://docs.expo.dev/push-notifications/overview/",
    pricing: "freemium",
    channels: ["Push"],
    platforms: ["mobile"],
  },
  {
    name: "Notifee",
    description: "Local notification library for React Native",
    features: [
      "Local notifications",
      "Rich media support",
      "Notification categories",
      "Scheduled notifications",
      "Interaction handling",
      "Cross-platform",
    ],
    link: "https://notifee.app/",
    pricing: "free",
    channels: ["Local notifications"],
    platforms: ["mobile"],
  },
  {
    name: "Courier",
    description:
      "Notification infrastructure for product and engineering teams",
    features: [
      "Multi-channel delivery",
      "Template management",
      "Routing rules",
      "Analytics",
      "Workflow automation",
      "Provider failover",
    ],
    link: "https://www.courier.com/",
    pricing: "freemium",
    channels: ["Push", "Email", "SMS", "Slack", "Discord", "In-app"],
    platforms: ["both"],
  },
  {
    name: "Novu",
    description: "Open-source notification infrastructure for developers",
    features: [
      "Multi-channel notifications",
      "Workflow engine",
      "Template management",
      "Subscriber management",
      "Analytics",
      "Self-hosted option",
    ],
    link: "https://novu.co/",
    pricing: "freemium",
    channels: ["Push", "Email", "SMS", "In-app", "Chat"],
    platforms: ["both"],
  },
];

// Helper functions
export const getNotificationsByChannel = (channel: string) => {
  return NOTIFICATION_PROVIDERS.filter((provider) =>
    provider.channels.includes(channel)
  );
};

export const getFreeNotificationProviders = () => {
  return NOTIFICATION_PROVIDERS.filter(
    (provider) => provider.pricing === "free"
  );
};

export const getFreemiumNotificationProviders = () => {
  return NOTIFICATION_PROVIDERS.filter(
    (provider) => provider.pricing === "freemium"
  );
};

export const getPaidNotificationProviders = () => {
  return NOTIFICATION_PROVIDERS.filter(
    (provider) => provider.pricing === "paid"
  );
};

export const getNotificationsByPlatform = (
  platform: "web" | "mobile" | "both"
) => {
  return NOTIFICATION_PROVIDERS.filter(
    (provider) =>
      provider.platforms.includes(platform) ||
      provider.platforms.includes("both")
  );
};

export const NOTIFICATION_CHANNELS = [
  "Push",
  "Email",
  "SMS",
  "In-app",
  "WhatsApp",
  "Slack",
  "Discord",
  "Voice",
  "Video",
  "Real-time",
  "Webhook",
  "Local notifications",
];
