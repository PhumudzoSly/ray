import {
  PublicRoadmap,
  Project,
} from "@workspace/backend/prisma/generated/zod";

export interface RoadmapStats {
  totalItems: number;
  totalChangelogs: number;
  totalFeatureRequests: number;
  statusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  totalVotes: number;
  totalFeedback: number;
  lastUpdated: Date;
}

export interface EnrichedRoadmapItem {
  id: string;
  status: string;
  category: string;
  voteCount: number;
  feedbackCount: number;
}

export interface EnrichedRoadmapChangelog {
  id: string;
  createdAt: Date;
}

export interface EnrichedRoadmapFeatureRequest {
  id: string;
  status: string;
  priority: string;
}

export interface EnrichedProject {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  platform: string;
  createdAt: Date;
}

export interface EnrichedPublicRoadmap extends PublicRoadmap {
  project: EnrichedProject;
  items: EnrichedRoadmapItem[];
  changelogs: EnrichedRoadmapChangelog[];
  featureRequests: EnrichedRoadmapFeatureRequest[];
  _count: {
    items: number;
    changelogs: number;
    featureRequests: number;
  };
  stats: RoadmapStats;
}

export interface RoadmapStatusConfig {
  label: string;
  color: string;
  icon: string;
}

export interface RoadmapCategoryConfig {
  label: string;
  color: string;
  icon: string;
}
