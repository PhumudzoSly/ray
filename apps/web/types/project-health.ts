import { ProjectOptionalDefaults } from "@workspace/backend";

export interface ProjectHealthMetrics {
    totalIssues: number;
    completedIssues: number;
    blockedIssues: number;
    cancelledIssues: number;
    issueCompletionRate: number;
    
    totalFeatures: number;
    completedFeatures: number;
    inProgressFeatures: number;
    featureCompletionRate: number;
    
    totalMilestones: number;
    completedMilestones: number;
    atRiskMilestones: number;
    delayedMilestones: number;
    milestoneCompletionRate: number;
    
    overallHealthScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    healthFactors: string[];
}

export interface ProjectWithHealth extends ProjectOptionalDefaults {
    healthMetrics: ProjectHealthMetrics;
    _count?: {
        features: number;
        issues: number;
        milestones: number;
    };
}

export interface ProjectHealthSummary extends ProjectHealthMetrics {
    criticalIssues: number;
    highPriorityFeatures: number;
    recentActivity: Array<{
        type: string;
        title: string;
        createdAt: Date;
    }>;
}

export interface OrganizationHealthInsights {
    totalProjects: number;
    projectHealths: Array<{
        id: string;
        name: string;
        healthMetrics: ProjectHealthMetrics;
    }>;
    healthDistribution: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
        critical: number;
    };
    averageHealthScore: number;
    organizationHealth: ProjectHealthMetrics;
    topPerformers: Array<{
        id: string;
        name: string;
        healthMetrics: ProjectHealthMetrics;
    }>;
    needsAttention: Array<{
        id: string;
        name: string;
        healthMetrics: ProjectHealthMetrics;
    }>;
}

export interface ProjectHealthTrends {
    dailyActivities: Record<string, Array<{
        type: string;
        title: string;
        createdAt: Date;
        oldValue?: string;
        newValue?: string;
    }>>;
    trendMetrics: {
        issueCompletions: number;
        featureProgressions: number;
        milestoneCompletions: number;
        totalActivities: number;
    };
    activityBreakdown: {
        created: number;
        updated: number;
        phaseChanged: number;
        assigned: number;
    };
} 