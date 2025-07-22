import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Zap,
  Star,
  Heart,
  Target,
  Bug,
  Sparkles,
  TrendingUp,
  Settings,
  Users,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Lock,
} from "lucide-react";
import { RoadmapStatusConfig, RoadmapCategoryConfig } from "@/types/roadmap";

export const ROADMAP_STATUS_CONFIG: Record<string, RoadmapStatusConfig> = {
  "not-started": {
    label: "Not Started",
    color: "bg-muted text-muted-foreground",
    icon: "Clock",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    icon: "TrendingUp",
  },
  completed: {
    label: "Completed",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    icon: "CheckCircle",
  },
  "on-hold": {
    label: "On Hold",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: "AlertCircle",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: "XCircle",
  },
  planning: {
    label: "Planning",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    icon: "Target",
  },
  review: {
    label: "In Review",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    icon: "Settings",
  },
};

export const ROADMAP_CATEGORY_CONFIG: Record<string, RoadmapCategoryConfig> = {
  feature: {
    label: "Feature",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    icon: "Sparkles",
  },
  enhancement: {
    label: "Enhancement",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    icon: "Zap",
  },
  bug: {
    label: "Bug Fix",
    color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: "Bug",
  },
  improvement: {
    label: "Improvement",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    icon: "Star",
  },
  security: {
    label: "Security",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    icon: "Shield",
  },
  performance: {
    label: "Performance",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
    icon: "TrendingUp",
  },
  accessibility: {
    label: "Accessibility",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
    icon: "Heart",
  },
  infrastructure: {
    label: "Infrastructure",
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
    icon: "Database",
  },
  "ui-ux": {
    label: "UI/UX",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
    icon: "Monitor",
  },
  mobile: {
    label: "Mobile",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    icon: "Smartphone",
  },
  api: {
    label: "API",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    icon: "Globe",
  },
  integration: {
    label: "Integration",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
    icon: "Cloud",
  },
  authentication: {
    label: "Authentication",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
    icon: "Lock",
  },
  "user-management": {
    label: "User Management",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
    icon: "Users",
  },
};

export const getStatusIcon = (status: string) => {
  const config = ROADMAP_STATUS_CONFIG[status];
  if (!config) return Clock;

  const iconMap: Record<string, any> = {
    Clock,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    XCircle,
    Target,
    Settings,
  };

  return iconMap[config.icon] || Clock;
};

export const getCategoryIcon = (category: string) => {
  const config = ROADMAP_CATEGORY_CONFIG[category];
  if (!config) return Sparkles;

  const iconMap: Record<string, any> = {
    Sparkles,
    Zap,
    Bug,
    Star,
    Shield,
    TrendingUp,
    Heart,
    Database,
    Monitor,
    Smartphone,
    Globe,
    Cloud,
    Lock,
    Users,
  };

  return iconMap[config.icon] || Sparkles;
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
};
