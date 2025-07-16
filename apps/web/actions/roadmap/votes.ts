"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new roadmap vote
 */
export const createRoadmapVote = async (data: { roadmapItemId: string; ipAddress: string; }) => {
    const { userId, org } = await getSession();
    try {
        // Ensure the roadmap item belongs to the org
        const item = await prisma.roadmapItem.findFirst({ where: { id: data.roadmapItemId, roadmap: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Roadmap item not found or not in your organization' };
        const vote = await prisma.roadmapVote.create({ data: { ...data, userId } });
        return { success: true, data: vote };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a roadmap vote by ID (scoped to org via parent roadmap item)
 */
export const getRoadmapVote = async (id: string) => {
    const { org } = await getSession();
    try {
        const vote = await prisma.roadmapVote.findFirst({ where: { id, roadmapItem: { roadmap: { project: { organizationId: org } } } } });
        return { success: true, data: vote };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all votes for a roadmap item (scoped to org)
 */
export const getAllRoadmapVotes = async (roadmapItemId: string) => {
    const { org } = await getSession();
    try {
        // Ensure the roadmap item belongs to the org
        const item = await prisma.roadmapItem.findFirst({ where: { id: roadmapItemId, roadmap: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Roadmap item not found or not in your organization' };
        const votes = await prisma.roadmapVote.findMany({ where: { roadmapItemId } });
        return { success: true, data: votes };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a roadmap vote (scoped to org via parent roadmap item)
 */
export const deleteRoadmapVote = async (id: string) => {
    const { org } = await getSession();
    try {
        // Ensure the vote belongs to a roadmap item in the org
        const vote = await prisma.roadmapVote.findFirst({ where: { id, roadmapItem: { roadmap: { project: { organizationId: org } } } } });
        if (!vote) return { success: false, error: 'Vote not found or not in your organization' };
        await prisma.roadmapVote.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 