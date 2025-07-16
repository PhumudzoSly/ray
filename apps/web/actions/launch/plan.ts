"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new launch plan
 */
export const createLaunchPlan = async (data: { projectId: string; status: string; targetLaunchDate?: Date; actualLaunchDate?: Date }) => {
    const { org } = await getSession();
    try {
        // Ensure the project belongs to the org
        const project = await prisma.project.findFirst({ where: { id: data.projectId, organizationId: org } });
        if (!project) return { success: false, error: 'Project not found or not in your organization' };
        const launchPlan = await prisma.launchPlan.create({ data });
        return { success: true, data: launchPlan };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a launch plan by ID (scoped to org via parent project)
 */
export const getLaunchPlan = async (id: string) => {
    const { org } = await getSession();
    try {
        const launchPlan = await prisma.launchPlan.findFirst({ where: { id, project: { organizationId: org } } });
        return { success: true, data: launchPlan };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all launch plans for the current org
 */
export const getAllLaunchPlans = async () => {
    const { org } = await getSession();
    try {
        const launchPlans = await prisma.launchPlan.findMany({ where: { project: { organizationId: org } } });
        return { success: true, data: launchPlans };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update a launch plan (scoped to org via parent project)
 */
export const updateLaunchPlan = async (id: string, data: Partial<{ status?: string; targetLaunchDate?: Date; actualLaunchDate?: Date }>) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to a project in the org
        const launchPlan = await prisma.launchPlan.findFirst({ where: { id, project: { organizationId: org } } });
        if (!launchPlan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const updated = await prisma.launchPlan.update({ where: { id }, data });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a launch plan (scoped to org via parent project)
 */
export const deleteLaunchPlan = async (id: string) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to a project in the org
        const launchPlan = await prisma.launchPlan.findFirst({ where: { id, project: { organizationId: org } } });
        if (!launchPlan) return { success: false, error: 'Launch plan not found or not in your organization' };
        await prisma.launchPlan.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 