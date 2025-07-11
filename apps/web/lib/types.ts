import { Node, Edge } from "reactflow";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  platform: "web" | "mobile" | "both" | "api" | "plugin" | "desktop" | "cli";
  techStack: {
    auth: string;
    orm: string;
    database: string;
    ai: string;
  };
  flowData?: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface Flow {
  _id: string;
  projectId: string;
  parentNodeId?: string;
  name: string;
  description?: string;
  type: "main" | "sub";
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FlowNode extends Node {
  type: "flowNode";
  data: {
    type:
      | "auth"
      | "onboarding"
      | "feature"
      | "feedback"
      | "error"
      | "settings"
      | "permissions"
      | "custom"
      | "api"
      | "payment"
      | "notification"
      | "analytics"
      | "integration"
      | "database"
      | "security"
      | "storage"
      | "caching"
      | "search"
      | "email"
      | "sms"
      | "group"
      | "conditional"
      | "start"
      | "end"
      | "stickyNote";
    label: string;
    description?: string;
    priority: "low" | "medium" | "high";
    features?: string[];
    dependencies?: string[];
    hasSubFlow?: boolean;
    subFlowData?: {
      nodes: FlowNode[];
      edges: FlowEdge[];
    };
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface NodeType {
  type: string;
  label: string;
  color: string;
  description: string;
  icon?: string;
}

export const nodeTypes: NodeType[] = [
  {
    type: "auth",
    label: "Authentication",
    color: "bg-blue-500",
    description: "User login, registration, and security",
    icon: "Shield",
  },
  {
    type: "onboarding",
    label: "Onboarding",
    color: "bg-green-500",
    description: "User introduction and setup flow",
    icon: "UserPlus",
  },
  {
    type: "feature",
    label: "Core Feature",
    color: "bg-purple-500",
    description: "Main application functionality",
    icon: "Zap",
  },
  {
    type: "feedback",
    label: "Feedback",
    color: "bg-orange-500",
    description: "User feedback and rating system",
    icon: "MessageSquare",
  },
  {
    type: "error",
    label: "Error Handling",
    color: "bg-red-500",
    description: "Error pages and exception handling",
    icon: "AlertTriangle",
  },
  {
    type: "settings",
    label: "Settings",
    color: "bg-gray-500",
    description: "User preferences and configuration",
    icon: "Settings",
  },
  {
    type: "permissions",
    label: "Permissions",
    color: "bg-yellow-500",
    description: "Role-based access control",
    icon: "Lock",
  },
  {
    type: "api",
    label: "API Endpoint",
    color: "bg-cyan-500",
    description: "External API integration or endpoint",
    icon: "Globe",
  },
  {
    type: "payment",
    label: "Payment",
    color: "bg-emerald-500",
    description: "Payment processing and billing",
    icon: "CreditCard",
  },
  {
    type: "notification",
    label: "Notification",
    color: "bg-amber-500",
    description: "User notifications and alerts",
    icon: "Bell",
  },
  {
    type: "analytics",
    label: "Analytics",
    color: "bg-indigo-500",
    description: "Data tracking and reporting",
    icon: "BarChart",
  },
  {
    type: "integration",
    label: "Integration",
    color: "bg-rose-500",
    description: "Third-party service integration",
    icon: "Link",
  },
  {
    type: "database",
    label: "Database",
    color: "bg-teal-500",
    description: "Database models and operations",
    icon: "Database",
  },
  {
    type: "security",
    label: "Security",
    color: "bg-slate-500",
    description: "Security features and protections",
    icon: "ShieldCheck",
  },
  {
    type: "storage",
    label: "Storage",
    color: "bg-lime-500",
    description: "File storage and management",
    icon: "HardDrive",
  },
  {
    type: "caching",
    label: "Caching",
    color: "bg-fuchsia-500",
    description: "Data caching mechanisms",
    icon: "Clock",
  },
  {
    type: "search",
    label: "Search",
    color: "bg-sky-500",
    description: "Search functionality",
    icon: "Search",
  },
  {
    type: "email",
    label: "Email",
    color: "bg-blue-400",
    description: "Email sending and templates",
    icon: "Mail",
  },
  {
    type: "sms",
    label: "SMS",
    color: "bg-violet-500",
    description: "SMS messaging functionality",
    icon: "MessageCircle",
  },
  {
    type: "group",
    label: "Group",
    color: "bg-zinc-500",
    description: "Group of related nodes",
    icon: "Folder",
  },
  {
    type: "conditional",
    label: "Conditional",
    color: "bg-amber-600",
    description: "Decision point or condition",
    icon: "GitBranch",
  },
  {
    type: "start",
    label: "Start",
    color: "bg-green-600",
    description: "Flow start point",
    icon: "Play",
  },
  {
    type: "end",
    label: "End",
    color: "bg-red-600",
    description: "Flow end point",
    icon: "Square",
  },
  {
    type: "custom",
    label: "Custom",
    color: "bg-pink-500",
    description: "Custom functionality",
    icon: "Package",
  },
];

export const techStackOptions = {
  auth: [
    "No Auth",
    "BetterAuth (OAuth)",
    "BetterAuth (Email/Password)",
    "BetterAuth (Magic Links)",
    "NextAuth.js",
    "Clerk",
    "Auth0",
    "Custom JWT",
    "Firebase Auth",
    "Supabase Auth",
    "Cognito",
  ],
  orm: [
    "No ORM",
    "Drizzle ORM",
    "Prisma",
    "TypeORM",
    "Mongoose",
    "Raw SQL",
    "Sequelize",
    "Knex.js",
    "MikroORM",
    "Objection.js",
  ],
  database: [
    "No Database",
    "Neon (PostgreSQL)",
    "PlanetScale (MySQL)",
    "Supabase (PostgreSQL)",
    "MongoDB Atlas",
    "SQLite",
    "Redis",
    "Firebase Firestore",
    "DynamoDB",
    "Fauna",
    "CockroachDB",
  ],
  ai: [
    "No AI",
    "Vercel AI SDK",
    "OpenAI GPT-4o",
    "Anthropic Claude",
    "LangChain",
    "Google Gemini",
    "Local LLM",
    "Hugging Face",
    "Cohere",
    "Mistral AI",
    "Replicate",
  ],
};

export const projectTypes = [
  { id: "web", name: "Web Application", icon: "Globe" },
  { id: "mobile", name: "Mobile Application", icon: "Smartphone" },
  { id: "both", name: "Web & Mobile", icon: "Devices" },
  { id: "api", name: "API Service", icon: "Server" },
  { id: "plugin", name: "Plugin/Extension", icon: "Puzzle" },
  { id: "desktop", name: "Desktop Application", icon: "Monitor" },
  { id: "cli", name: "CLI Tool", icon: "Terminal" },
];

export interface FlowHistory {
  past: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  }[];
  future: {
    nodes: FlowNode[];
    edges: FlowEdge[];
  }[];
}

export interface FlowStats {
  nodeCount: number;
  edgeCount: number;
  nodeTypes: Record<string, number>;
  averageConnections: number;
  depth: number;
}

export interface FlowTemplate {
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
