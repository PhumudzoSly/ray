"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap feedback
 */
export const createRoadmapFeedback = async (data: { roadmapItemId: string; ipAddress: string; content: string; sentiment: "positive" | "neutral" | "negative"; isApproved: boolean; convertedToFeatureId?: string; convertedToIssueId?: string; convertedAt?: Date; convertedBy?: string; conversionNotes?: string }) => {
    const { userId, org } = await getSession();
    try {
        // Ensure the roadmap item belongs to the org
        const item = await prisma.roadmapItem.findFirst({ where: { id: data.roadmapItemId, roadmap: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Roadmap item not found or not in your organization' };
        const feedback = await prisma.roadmapFeedback.create({
            data: {
                ...data,
                userId,
                createdAt: new Date()
            }
        });
        return { success: true, data: feedback };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a roadmap feedback by ID (scoped to org via parent roadmap item)
 */
export const getRoadmapFeedback = async (id: string) => {
    const { org } = await getSession();
    try {
        const feedback = await prisma.roadmapFeedback.findFirst({ where: { id, roadmapItem: { roadmap: { project: { organizationId: org } } } } });
        return { success: true, data: feedback };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all feedback for a roadmap item (scoped to org)
 */
export const getAllRoadmapFeedback = async (roadmapItemId: string) => {
    const { org } = await getSession();
    try {
        // Ensure the roadmap item belongs to the org
        const item = await prisma.roadmapItem.findFirst({ where: { id: roadmapItemId, roadmap: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Roadmap item not found or not in your organization' };
        const feedbacks = await prisma.roadmapFeedback.findMany({ where: { roadmapItemId } });
        return { success: true, data: feedbacks };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get all feedback for a roadmap (scoped to org)
 */
export const getAllRoadmapFeedbackForRoadmap = async (roadmapId: string) => {
    const { org } = await getSession();
    try {
        // Ensure the roadmap belongs to the org
        const roadmap = await prisma.publicRoadmap.findFirst({ where: { id: roadmapId, project: { organizationId: org } } });
        if (!roadmap) return { success: false, error: 'Roadmap not found or not in your organization' };

        const feedbacks = await prisma.roadmapFeedback.findMany({
            where: {
                roadmapItem: {
                    roadmapId: roadmapId
                }
            },
            include: {
                roadmapItem: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                    }
                },
                convertedFeature: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                convertedIssue: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: feedbacks };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Moderate feedback (approve/reject)
 */
export const moderateFeedback = async (id: string, isApproved: boolean) => {
    const { org } = await getSession();
    try {
        // Ensure the feedback belongs to a roadmap item in the org
        const feedback = await prisma.roadmapFeedback.findFirst({
            where: {
                id,
                roadmapItem: {
                    roadmap: {
                        project: {
                            organizationId: org
                        }
                    }
                }
            }
        });
        if (!feedback) return { success: false, error: 'Feedback not found or not in your organization' };

        const updatedFeedback = await prisma.roadmapFeedback.update({
            where: { id },
            data: { isApproved }
        });
        return { success: true, data: updatedFeedback };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Convert feedback to feature
 */
export const convertFeedbackToFeature = async (data: {
    feedbackId: string;
    featureName: string;
    featureDescription: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    phase: "DISCOVERY" | "PLANNING" | "DEVELOPMENT" | "TESTING" | "RELEASE" | "LIVE" | "DEPRECATED";
    conversionNotes?: string;
}) => {
    const { org, userId } = await getSession();
    try {
        // Ensure the feedback belongs to a roadmap item in the org
        const feedback = await prisma.roadmapFeedback.findFirst({
            where: {
                id: data.feedbackId,
                roadmapItem: {
                    roadmap: {
                        project: {
                            organizationId: org
                        }
                    }
                }
            },
            include: {
                roadmapItem: {
                    select: {
                        roadmap: {
                            select: {
                                projectId: true,
                            }
                        }
                    }
                }
            }
        });
        if (!feedback) return { success: false, error: 'Feedback not found or not in your organization' };

        // Create the feature
        const feature = await prisma.feature.create({
            data: {
                name: data.featureName,
                description: data.featureDescription,
                priority: data.priority,
                phase: data.phase,
                projectId: feedback.roadmapItem.roadmap.projectId,
                organizationId: org,
            },
        });

        // Update the feedback to mark it as converted
        await prisma.roadmapFeedback.update({
            where: { id: data.feedbackId },
            data: {
                convertedToFeatureId: feature.id,
                convertedAt: new Date(),
                convertedBy: userId,
                conversionNotes: data.conversionNotes,
            },
        });

        return { success: true, data: feature };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Convert feedback to issue
 */
export const convertFeedbackToIssue = async (data: {
    feedbackId: string;
    issueTitle: string;
    issueDescription: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED" | "CANCELLED";
    label: "UI" | "BUG" | "FEATURE" | "DOCUMENTATION" | "REFACTOR" | "PERFORMANCE" | "DESIGN" | "SECURITY" | "ACCESSIBILITY" | "TESTING" | "INTERNATIONALIZATION";
    conversionNotes?: string;
}) => {
    const { org, userId } = await getSession();
    try {
        // Ensure the feedback belongs to a roadmap item in the org
        const feedback = await prisma.roadmapFeedback.findFirst({
            where: {
                id: data.feedbackId,
                roadmapItem: {
                    roadmap: {
                        project: {
                            organizationId: org
                        }
                    }
                }
            },
            include: {
                roadmapItem: {
                    select: {
                        roadmap: {
                            select: {
                                projectId: true,
                            }
                        }
                    }
                }
            }
        });
        if (!feedback) return { success: false, error: 'Feedback not found or not in your organization' };

        // Create the issue
        const issue = await prisma.issue.create({
            data: {
                title: data.issueTitle,
                description: data.issueDescription,
                priority: data.priority,
                status: data.status,
                label: data.label,
                projectId: feedback.roadmapItem.roadmap.projectId,
                organizationId: org,
                sourceType: "roadmap_feedback",
                sourceFeedbackId: data.feedbackId,
            },
        });

        // Update the feedback to mark it as converted
        await prisma.roadmapFeedback.update({
            where: { id: data.feedbackId },
            data: {
                convertedToIssueId: issue.id,
                convertedAt: new Date(),
                convertedBy: userId,
                conversionNotes: data.conversionNotes,
            },
        });

        return { success: true, data: issue };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a roadmap feedback (scoped to org via parent roadmap item)
 */
export const deleteRoadmapFeedback = async (id: string) => {
    const { org } = await getSession();
    try {
        // Ensure the feedback belongs to a roadmap item in the org
        const feedback = await prisma.roadmapFeedback.findFirst({ where: { id, roadmapItem: { roadmap: { project: { organizationId: org } } } } });
        if (!feedback) return { success: false, error: 'Feedback not found or not in your organization' };
        await prisma.roadmapFeedback.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 