export interface StorageProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: "free" | "freemium" | "paid";
  storageTypes: string[];
  deployment: ("cloud" | "self-hosted" | "both")[];
}

export const STORAGE_PROVIDERS: StorageProvider[] = [
  {
    name: "In-House Storage",
    description: "Custom-built storage solution with full control",
    features: [
      "Complete control",
      "Custom security policies",
      "No vendor lock-in",
      "Direct server integration",
      "Custom file processing",
    ],
    link: "#",
    pricing: "free",
    storageTypes: ["Object", "File", "Block"],
    deployment: ["both"],
  },
  {
    name: "Amazon S3",
    description: "Object storage service with industry-leading scalability",
    features: [
      "99.999999999% durability",
      "Lifecycle management",
      "Versioning",
      "Access control",
      "Analytics",
      "Transfer acceleration",
    ],
    link: "https://aws.amazon.com/s3/",
    pricing: "paid",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Google Cloud Storage",
    description: "Unified object storage for developers and enterprises",
    features: [
      "Multi-regional storage",
      "Lifecycle management",
      "Fine-grained access control",
      "Strong consistency",
      "Integration with GCP",
      "Transfer service",
    ],
    link: "https://cloud.google.com/storage",
    pricing: "paid",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Microsoft Azure Blob Storage",
    description: "Massively scalable object storage for unstructured data",
    features: [
      "Hot, cool, and archive tiers",
      "Lifecycle management",
      "Immutable storage",
      "Encryption at rest",
      "Geo-redundancy",
      "Data Lake integration",
    ],
    link: "https://azure.microsoft.com/en-us/products/storage/blobs/",
    pricing: "paid",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Cloudinary",
    description: "Cloud-based image and video management platform",
    features: [
      "Image/video optimization",
      "Real-time transformations",
      "Automatic format selection",
      "CDN delivery",
      "AI-powered features",
      "Upload widgets",
    ],
    link: "https://cloudinary.com/",
    pricing: "freemium",
    storageTypes: ["Media"],
    deployment: ["cloud"],
  },
  {
    name: "Supabase Storage",
    description: "Open-source object storage with RLS policies",
    features: [
      "Row-level security",
      "Image transformations",
      "Resumable uploads",
      "CDN integration",
      "Dashboard management",
      "PostgreSQL integration",
    ],
    link: "https://supabase.com/storage",
    pricing: "freemium",
    storageTypes: ["Object"],
    deployment: ["both"],
  },
  {
    name: "Firebase Storage",
    description: "Object storage built for Google scale",
    features: [
      "Security rules",
      "Resumable uploads",
      "Strong consistency",
      "CDN-backed",
      "Mobile SDKs",
      "Integration with Firebase",
    ],
    link: "https://firebase.google.com/products/storage",
    pricing: "freemium",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Vercel Blob",
    description: "Fast object storage for the frontend cloud",
    features: [
      "Edge-optimized",
      "Simple API",
      "Automatic CDN",
      "Vercel integration",
      "Fast uploads",
      "Global distribution",
    ],
    link: "https://vercel.com/storage/blob",
    pricing: "freemium",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Uploadcare",
    description: "Complete file handling platform for web and mobile",
    features: [
      "File uploading",
      "Image processing",
      "CDN delivery",
      "Virus scanning",
      "Adaptive delivery",
      "Upload widgets",
    ],
    link: "https://uploadcare.com/",
    pricing: "freemium",
    storageTypes: ["File", "Media"],
    deployment: ["cloud"],
  },
  {
    name: "DigitalOcean Spaces",
    description: "Object storage with a built-in CDN",
    features: [
      "S3-compatible API",
      "Built-in CDN",
      "Simple pricing",
      "Spaces Sync",
      "CORS support",
      "Access control",
    ],
    link: "https://www.digitalocean.com/products/spaces",
    pricing: "paid",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Backblaze B2",
    description: "Cloud storage that's ¼ the price of Amazon S3",
    features: [
      "S3-compatible API",
      "Low-cost storage",
      "Lifecycle rules",
      "Encryption",
      "CORS support",
      "Partner integrations",
    ],
    link: "https://www.backblaze.com/b2/cloud-storage.html",
    pricing: "paid",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Wasabi",
    description: "Hot cloud storage that's 80% cheaper than Amazon S3",
    features: [
      "S3-compatible API",
      "No egress fees",
      "Immutable storage",
      "Encryption",
      "Versioning",
      "Lifecycle policies",
    ],
    link: "https://wasabi.com/",
    pricing: "paid",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "MinIO",
    description:
      "High-performance object storage for cloud-native applications",
    features: [
      "S3-compatible API",
      "Kubernetes native",
      "Erasure coding",
      "Encryption",
      "Versioning",
      "Lifecycle management",
    ],
    link: "https://min.io/",
    pricing: "free",
    storageTypes: ["Object"],
    deployment: ["both"],
  },
  {
    name: "Filebase",
    description: "S3-compatible object storage powered by blockchain",
    features: [
      "S3-compatible API",
      "Decentralized storage",
      "Geo-redundancy",
      "No egress fees",
      "IPFS integration",
      "Cryptocurrency payments",
    ],
    link: "https://filebase.com/",
    pricing: "freemium",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
  {
    name: "Storj",
    description: "Decentralized cloud storage with enterprise-grade security",
    features: [
      "S3-compatible API",
      "Decentralized network",
      "Client-side encryption",
      "No vendor lock-in",
      "Lower costs",
      "Global distribution",
    ],
    link: "https://www.storj.io/",
    pricing: "freemium",
    storageTypes: ["Object"],
    deployment: ["cloud"],
  },
];

// Helper functions
export const getStorageByType = (type: string) => {
  return STORAGE_PROVIDERS.filter((provider) =>
    provider.storageTypes.includes(type)
  );
};

export const getStorageByDeployment = (
  deployment: "cloud" | "self-hosted" | "both"
) => {
  return STORAGE_PROVIDERS.filter(
    (provider) =>
      provider.deployment.includes(deployment) ||
      provider.deployment.includes("both")
  );
};

export const getFreeStorageProviders = () => {
  return STORAGE_PROVIDERS.filter((provider) => provider.pricing === "free");
};

export const getFreemiumStorageProviders = () => {
  return STORAGE_PROVIDERS.filter(
    (provider) => provider.pricing === "freemium"
  );
};

export const getPaidStorageProviders = () => {
  return STORAGE_PROVIDERS.filter((provider) => provider.pricing === "paid");
};

export const STORAGE_TYPES = [
  "Object",
  "File",
  "Block",
  "Media",
  "Database",
  "Archive",
];
