import { MilestoneStatusType } from "@workspace/backend";

export interface MilestoneWithProgress {
  id: string;
  name: string;
  description: string | null;
  status: MilestoneStatusType;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  organizationId: string;
  ownerId: string | null;
  owner: { id: string; name: string; image: string | null } | null;
  progress: number;
  completedIssueCount: number;
  issueCount: number;
  completedFeatureCount: number;
  featureCount: number;
  overdueItems: number;
  dependsOn: { id: string; name: string }[];
  blocking: { id: string; name: string }[];
  issues: any[];
  features: any[];
}

export interface CreateMilestoneData {
  name: string;
  description?: string;
  projectId: string;
  startDate?: number;
  endDate?: number;
  ownerId?: string;
  status?: MilestoneStatusType;
}

export interface UpdateMilestoneData {
  name?: string;
  description?: string;
  startDate?: number | null;
  endDate?: number | null;
  ownerId?: string | null;
  status?: MilestoneStatusType;
}
