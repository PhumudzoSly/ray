"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap feedback
 */
export const createRoadmapFeedback = async (data: { roadmapItemId: string; ipAddress: string; content: string; sentiment: string; isApproved: boolean; convertedToFeatureId?: string; convertedToIssueId?: string; convertedAt?: Date; convertedBy?: string; conversionNotes?: string }) => {
    const { userId, org } = await getSession();
    try {
        // Ensure the roadmap item belongs to the org
        const item = await prisma.roadmapItem.findFirst({ where: { id: data.roadmapItemId, roadmap: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Roadmap item not found or not in your organization' };
        const feedback = await prisma.roadmapFeedback.create({ data: { ...data, userId } });
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