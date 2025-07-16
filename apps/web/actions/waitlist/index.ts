"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new waitlist
 */
export const createWaitlist = async (data: { projectId: string; name: string; slug: string; description: string; isPublic: boolean; allowNameCapture: boolean; showPosition: boolean; showSocialProof: boolean; customMessage?: string; }) => {
    const { org, userId } = await getSession();
    try {
        const waitlist = await prisma.waitlist.create({
            data: {
                ...data,
                organizationId: org,
                createdById: userId,
            },
        });
        return { success: true, data: waitlist };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a waitlist by ID (scoped to org)
 */
export const getWaitlist = async (id: string) => {
    const { org } = await getSession();
    try {
        const waitlist = await prisma.waitlist.findFirst({ where: { id, organizationId: org } });
        return { success: true, data: waitlist };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all waitlists for the current org
 */
export const getAllWaitlists = async () => {
    const { org } = await getSession();
    try {
        const waitlists = await prisma.waitlist.findMany({ where: { organizationId: org } });
        return { success: true, data: waitlists };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update a waitlist (scoped to org)
 */
export const updateWaitlist = async (id: string, data: Partial<{ name?: string; slug?: string; description?: string; isPublic?: boolean; allowNameCapture?: boolean; showPosition?: boolean; showSocialProof?: boolean; customMessage?: string; }>) => {
    const { org } = await getSession();
    try {
        const waitlist = await prisma.waitlist.update({ where: { id, organizationId: org }, data });
        return { success: true, data: waitlist };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a waitlist (scoped to org)
 */
export const deleteWaitlist = async (id: string) => {
    const { org } = await getSession();
    try {
        await prisma.waitlist.delete({ where: { id, organizationId: org } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 