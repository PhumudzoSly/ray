"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new launch strategy
 */
export const createLaunchStrategy = async (data: { launchPlanId: string; phase: string; name: string; description: string; startDate: Date; endDate: Date; order: number; platforms?: any; targetAudience?: any; keyMetrics?: any; tasks?: any }) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to the org
        const plan = await prisma.launchPlan.findFirst({ where: { id: data.launchPlanId, project: { organizationId: org } } });
        if (!plan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const strategy = await prisma.launchStrategy.create({ data });
        return { success: true, data: strategy };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a launch strategy by ID (scoped to org via parent launch plan)
 */
export const getLaunchStrategy = async (id: string) => {
    const { org } = await getSession();
    try {
        const strategy = await prisma.launchStrategy.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        return { success: true, data: strategy };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all launch strategies for a launch plan (scoped to org)
 */
export const getAllLaunchStrategies = async (launchPlanId: string) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to the org
        const plan = await prisma.launchPlan.findFirst({ where: { id: launchPlanId, project: { organizationId: org } } });
        if (!plan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const strategies = await prisma.launchStrategy.findMany({ where: { launchPlanId } });
        return { success: true, data: strategies };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update a launch strategy (scoped to org via parent launch plan)
 */
export const updateLaunchStrategy = async (id: string, data: Partial<{ phase?: string; name?: string; description?: string; startDate?: Date; endDate?: Date; order?: number; platforms?: any; targetAudience?: any; keyMetrics?: any; tasks?: any }>) => {
    const { org } = await getSession();
    try {
        // Ensure the strategy belongs to a launch plan in the org
        const strategy = await prisma.launchStrategy.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        if (!strategy) return { success: false, error: 'Strategy not found or not in your organization' };
        const updated = await prisma.launchStrategy.update({ where: { id }, data });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a launch strategy (scoped to org via parent launch plan)
 */
export const deleteLaunchStrategy = async (id: string) => {
    const { org } = await getSession();
    try {
        // Ensure the strategy belongs to a launch plan in the org
        const strategy = await prisma.launchStrategy.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        if (!strategy) return { success: false, error: 'Strategy not found or not in your organization' };
        await prisma.launchStrategy.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 