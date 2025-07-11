export interface InfrastructureProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: "free" | "freemium" | "paid";
  serviceTypes: string[];
  deployment: ("cloud" | "edge" | "both")[];
}

export const INFRASTRUCTURE_PROVIDERS: InfrastructureProvider[] = [
  {
    name: "Cloudflare",
    description: "Web infrastructure and website security company",
    features: [
      "CDN",
      "DDoS protection",
      "SSL/TLS",
      "DNS",
      "Load balancing",
      "Edge computing",
    ],
    link: "https://www.cloudflare.com/",
    pricing: "freemium",
    serviceTypes: ["CDN", "Security", "DNS", "Edge Computing"],
    deployment: ["both"],
  },
  {
    name: "Vercel",
    description: "Platform for frontend frameworks and static sites",
    features: [
      "Static site hosting",
      "Serverless functions",
      "Edge network",
      "Analytics",
      "Previews",
      "Integrations",
    ],
    link: "https://vercel.com/",
    pricing: "freemium",
    serviceTypes: ["Hosting", "Serverless", "CDN", "Analytics"],
    deployment: ["edge"],
  },
  {
    name: "Netlify",
    description: "Platform for web developers to build and deploy websites",
    features: [
      "Static site hosting",
      "Serverless functions",
      "Form handling",
      "Identity",
      "Analytics",
      "A/B testing",
    ],
    link: "https://www.netlify.com/",
    pricing: "freemium",
    serviceTypes: ["Hosting", "Serverless", "Forms", "Identity"],
    deployment: ["edge"],
  },
  {
    name: "AWS CloudFront",
    description: "Fast content delivery network (CDN) service",
    features: [
      "Global CDN",
      "Edge locations",
      "Real-time metrics",
      "Security",
      "Lambda@Edge",
      "Origin shield",
    ],
    link: "https://aws.amazon.com/cloudfront/",
    pricing: "paid",
    serviceTypes: ["CDN", "Edge Computing"],
    deployment: ["both"],
  },
  {
    name: "Railway",
    description: "Infrastructure platform for deploying applications",
    features: [
      "Application hosting",
      "Database hosting",
      "Automatic deployments",
      "Scaling",
      "Monitoring",
      "Team collaboration",
    ],
    link: "https://railway.app/",
    pricing: "freemium",
    serviceTypes: ["Hosting", "Database", "Deployment"],
    deployment: ["cloud"],
  },
  {
    name: "Render",
    description: "Cloud platform for building and running applications",
    features: [
      "Web services",
      "Static sites",
      "Databases",
      "Cron jobs",
      "Auto-scaling",
      "Zero-downtime deploys",
    ],
    link: "https://render.com/",
    pricing: "freemium",
    serviceTypes: ["Hosting", "Database", "Cron Jobs"],
    deployment: ["cloud"],
  },
  {
    name: "Fly.io",
    description: "Platform for running applications globally",
    features: [
      "Global deployment",
      "Edge computing",
      "Databases",
      "Load balancing",
      "Monitoring",
      "Docker support",
    ],
    link: "https://fly.io/",
    pricing: "freemium",
    serviceTypes: ["Hosting", "Edge Computing", "Database"],
    deployment: ["both"],
  },
];

// Helper functions
export const getInfrastructureByType = (type: string) => {
  return INFRASTRUCTURE_PROVIDERS.filter((provider) =>
    provider.serviceTypes.includes(type)
  );
};

export const getInfrastructureByDeployment = (
  deployment: "cloud" | "edge" | "both"
) => {
  return INFRASTRUCTURE_PROVIDERS.filter(
    (provider) =>
      provider.deployment.includes(deployment) ||
      provider.deployment.includes("both")
  );
};

export const getFreeInfrastructureProviders = () => {
  return INFRASTRUCTURE_PROVIDERS.filter(
    (provider) => provider.pricing === "free"
  );
};

export const getFreemiumInfrastructureProviders = () => {
  return INFRASTRUCTURE_PROVIDERS.filter(
    (provider) => provider.pricing === "freemium"
  );
};

export const getPaidInfrastructureProviders = () => {
  return INFRASTRUCTURE_PROVIDERS.filter(
    (provider) => provider.pricing === "paid"
  );
};

export const INFRASTRUCTURE_TYPES = [
  "CDN",
  "Hosting",
  "Serverless",
  "Database",
  "Security",
  "DNS",
  "Edge Computing",
  "Analytics",
  "Deployment",
  "Load Balancing",
];
