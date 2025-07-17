'use server'

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { MilestoneStatusType } from "@workspace/backend";

// Types for milestone operations
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

// Helper function to calculate milestone progress
const calculateMilestoneProgress = (issues: any[], features: any[]) => {
    const totalItems = issues.length + features.length;
    if (totalItems === 0) return 0;

    const completedIssues = issues.filter(issue => issue.achieved || issue.status === 'DONE').length;
    const completedFeatures = features.filter(feature =>
        feature.phase === 'LIVE' || feature.phase === 'RELEASE'
    ).length;

    return Math.round(((completedIssues + completedFeatures) / totalItems) * 100);
};

// Helper function to count overdue items
const countOverdueItems = (issues: any[], features: any[], milestoneEndDate: Date | null) => {
    const now = new Date();
    let overdueCount = 0;

    // Check if milestone itself is overdue
    if (milestoneEndDate && milestoneEndDate < now) {
        overdueCount += issues.length + features.length;
    } else {
        // Check individual items
        issues.forEach(issue => {
            if (issue.dueDate && new Date(issue.dueDate) < now && !issue.achieved) {
                overdueCount++;
            }
        });

        features.forEach(feature => {
            if (feature.endDate && new Date(feature.endDate) < now && feature.phase !== 'LIVE') {
                overdueCount++;
            }
        });
    }

    return overdueCount;
};

// Get all milestones for a project with basic info
export const getProjectMilestones = async (projectId: string) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    return await prisma.milestone.findMany({
        where: {
            projectId,
            organizationId: org
        },
        select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            description: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// Create a new milestone
export const createMilestone = async (data: CreateMilestoneData) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    // Validate project belongs to organization
    const project = await prisma.project.findFirst({
        where: {
            id: data.projectId,
            organizationId: org
        }
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    // Validate owner if provided
    if (data.ownerId) {
        const owner = await prisma.member.findFirst({
            where: {
                userId: data.ownerId,
                organizationId: org
            }
        });

        if (!owner) {
            throw new Error("Invalid owner");
        }
    }

    return await prisma.milestone.create({
        data: {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            projectId: data.projectId,
            organizationId: org,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            ownerId: data.ownerId || null,
            status: data.status || 'NOT_STARTED',
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        }
    });
};

// Get a single milestone with full details and calculated progress
export const getMilestone = async (milestoneId: string): Promise<MilestoneWithProgress | null> => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    const milestone = await prisma.milestone.findUnique({
        where: {
            id: milestoneId,
            organizationId: org
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            },
            dependsOn: {
                include: {
                    dependency: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            blocking: {
                include: {
                    milestone: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            issues: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    achieved: true,
                    dueDate: true
                }
            },
            features: {
                select: {
                    id: true,
                    name: true,
                    phase: true,
                    endDate: true
                }
            }
        }
    });

    if (!milestone) {
        return null;
    }

    // Calculate progress metrics
    const progress = calculateMilestoneProgress(milestone.issues, milestone.features);
    const completedIssueCount = milestone.issues.filter(issue => issue.achieved || issue.status === 'DONE').length;
    const completedFeatureCount = milestone.features.filter(feature =>
        feature.phase === 'LIVE' || feature.phase === 'RELEASE'
    ).length;
    const overdueItems = countOverdueItems(milestone.issues, milestone.features, milestone.endDate);

    // Transform dependency data
    const dependsOn = milestone.dependsOn.map(dep => ({
        id: dep.dependency.id,
        name: dep.dependency.name
    }));

    const blocking = milestone.blocking.map(block => ({
        id: block.milestone.id,
        name: block.milestone.name
    }));

    return {
        ...milestone,
        progress,
        completedIssueCount,
        issueCount: milestone.issues.length,
        completedFeatureCount,
        featureCount: milestone.features.length,
        overdueItems,
        dependsOn,
        blocking
    };
};

// Update a milestone
export const updateMilestone = async (milestoneId: string, updates: UpdateMilestoneData) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    // Verify milestone exists and belongs to organization
    const existingMilestone = await prisma.milestone.findFirst({
        where: {
            id: milestoneId,
            organizationId: org
        }
    });

    if (!existingMilestone) {
        throw new Error("Milestone not found or access denied");
    }

    // Validate owner if being updated
    if (updates.ownerId) {
        const owner = await prisma.member.findFirst({
            where: {
                userId: updates.ownerId,
                organizationId: org
            }
        });

        if (!owner) {
            throw new Error("Invalid owner");
        }
    }

    // Prepare update data
    const updateData: any = {};

    if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
        updateData.description = updates.description?.trim() || null;
    }

    if (updates.startDate !== undefined) {
        updateData.startDate = updates.startDate ? new Date(updates.startDate) : null;
    }

    if (updates.endDate !== undefined) {
        updateData.endDate = updates.endDate ? new Date(updates.endDate) : null;
    }

    if (updates.ownerId !== undefined) {
        updateData.ownerId = updates.ownerId;
    }

    if (updates.status !== undefined) {
        updateData.status = updates.status;
    }

    return await prisma.milestone.update({
        where: {
            id: milestoneId,
            organizationId: org
        },
        data: updateData,
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            }
        }
    });
};

// Delete a milestone
export const deleteMilestone = async (milestoneId: string) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    // Verify milestone exists and belongs to organization
    const existingMilestone = await prisma.milestone.findFirst({
        where: {
            id: milestoneId,
            organizationId: org
        },
        include: {
            issues: { select: { id: true } },
            features: { select: { id: true } }
        }
    });

    if (!existingMilestone) {
        throw new Error("Milestone not found or access denied");
    }

    // Check if milestone has assigned items
    if (existingMilestone.issues.length > 0 || existingMilestone.features.length > 0) {
        throw new Error("Cannot delete milestone with assigned issues or features. Please reassign them first.");
    }

    return await prisma.milestone.delete({
        where: {
            id: milestoneId,
            organizationId: org
        }
    });
};

// Add dependency between milestones
export const addMilestoneDependency = async (milestoneId: string, dependencyId: string) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    // Verify both milestones exist and belong to organization
    const [milestone, dependency] = await Promise.all([
        prisma.milestone.findFirst({
            where: { id: milestoneId, organizationId: org }
        }),
        prisma.milestone.findFirst({
            where: { id: dependencyId, organizationId: org }
        })
    ]);

    if (!milestone || !dependency) {
        throw new Error("One or both milestones not found or access denied");
    }

    if (milestoneId === dependencyId) {
        throw new Error("Milestone cannot depend on itself");
    }

    // Check for circular dependencies
    const existingDependency = await prisma.milestoneDependency.findFirst({
        where: {
            milestoneId: dependencyId,
            dependencyId: milestoneId,
            organizationId: org
        }
    });

    if (existingDependency) {
        throw new Error("Circular dependency detected");
    }

    return await prisma.milestoneDependency.create({
        data: {
            milestoneId,
            dependencyId,
            organizationId: org
        }
    });
};

// Remove dependency between milestones
export const removeMilestoneDependency = async (milestoneId: string, dependencyId: string) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    return await prisma.milestoneDependency.deleteMany({
        where: {
            milestoneId,
            dependencyId,
            organizationId: org
        }
    });
};

// Get milestone dependencies
export const getMilestoneDependencies = async (milestoneId: string) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    const [dependsOn, blocking] = await Promise.all([
        prisma.milestoneDependency.findMany({
            where: {
                milestoneId,
                organizationId: org
            },
            include: {
                dependency: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        }),
        prisma.milestoneDependency.findMany({
            where: {
                dependencyId: milestoneId,
                organizationId: org
            },
            include: {
                milestone: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        })
    ]);

    return {
        dependsOn: dependsOn.map(dep => dep.dependency),
        blocking: blocking.map(block => block.milestone)
    };
};

// Bulk update milestone statuses
export const bulkUpdateMilestoneStatuses = async (updates: { id: string; status: MilestoneStatusType }[]) => {
    const { org } = await getSession();

    if (!org) {
        throw new Error("No organization found");
    }

    // Verify all milestones belong to organization
    const milestoneIds = updates.map(u => u.id);
    const existingMilestones = await prisma.milestone.findMany({
        where: {
            id: { in: milestoneIds },
            organizationId: org
        },
        select: { id: true }
    });

    if (existingMilestones.length !== milestoneIds.length) {
        throw new Error("One or more milestones not found or access denied");
    }

    // Perform bulk update
    const results = await Promise.all(
        updates.map(update =>
            prisma.milestone.update({
                where: { id: update.id, organizationId: org },
                data: { status: update.status }
            })
        )
    );

    return results;
};