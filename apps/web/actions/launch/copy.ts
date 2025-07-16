"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new launch copy
 */
export const createLaunchCopy = async (data: { launchPlanId: string; platform: string; title: string; description: string; isApproved: boolean; version: number; tagline?: string; callToAction?: string; hashtags?: any; mentions?: any; media?: any }) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to the org
        const plan = await prisma.launchPlan.findFirst({ where: { id: data.launchPlanId, project: { organizationId: org } } });
        if (!plan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const copy = await prisma.launchCopy.create({ data });
        return { success: true, data: copy };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a launch copy by ID (scoped to org via parent launch plan)
 */
export const getLaunchCopy = async (id: string) => {
    const { org } = await getSession();
    try {
        const copy = await prisma.launchCopy.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        return { success: true, data: copy };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all launch copies for a launch plan (scoped to org)
 */
export const getAllLaunchCopies = async (launchPlanId: string) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to the org
        const plan = await prisma.launchPlan.findFirst({ where: { id: launchPlanId, project: { organizationId: org } } });
        if (!plan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const copies = await prisma.launchCopy.findMany({ where: { launchPlanId } });
        return { success: true, data: copies };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update a launch copy (scoped to org via parent launch plan)
 */
export const updateLaunchCopy = async (id: string, data: Partial<{ platform?: string; title?: string; description?: string; isApproved?: boolean; version?: number; tagline?: string; callToAction?: string; hashtags?: any; mentions?: any; media?: any }>) => {
    const { org } = await getSession();
    try {
        // Ensure the copy belongs to a launch plan in the org
        const copy = await prisma.launchCopy.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        if (!copy) return { success: false, error: 'Copy not found or not in your organization' };
        const updated = await prisma.launchCopy.update({ where: { id }, data });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a launch copy (scoped to org via parent launch plan)
 */
export const deleteLaunchCopy = async (id: string) => {
    const { org } = await getSession();
    try {
        // Ensure the copy belongs to a launch plan in the org
        const copy = await prisma.launchCopy.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        if (!copy) return { success: false, error: 'Copy not found or not in your organization' };
        await prisma.launchCopy.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 