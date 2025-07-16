"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new launch checklist item
 */
export const createLaunchChecklistItem = async (data: { launchPlanId: string; category: string; title: string; priority: string; status: string; isRequired: boolean; order: number; description?: string; dependsOn?: any; assignedTo?: string; dueDate?: Date; notes?: string }) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to the org
        const plan = await prisma.launchPlan.findFirst({ where: { id: data.launchPlanId, project: { organizationId: org } } });
        if (!plan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const item = await prisma.launchChecklistItem.create({ data });
        return { success: true, data: item };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get a launch checklist item by ID (scoped to org via parent launch plan)
 */
export const getLaunchChecklistItem = async (id: string) => {
    const { org } = await getSession();
    try {
        const item = await prisma.launchChecklistItem.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        return { success: true, data: item };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all launch checklist items for a launch plan (scoped to org)
 */
export const getAllLaunchChecklistItems = async (launchPlanId: string) => {
    const { org } = await getSession();
    try {
        // Ensure the launch plan belongs to the org
        const plan = await prisma.launchPlan.findFirst({ where: { id: launchPlanId, project: { organizationId: org } } });
        if (!plan) return { success: false, error: 'Launch plan not found or not in your organization' };
        const items = await prisma.launchChecklistItem.findMany({ where: { launchPlanId } });
        return { success: true, data: items };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update a launch checklist item (scoped to org via parent launch plan)
 */
export const updateLaunchChecklistItem = async (id: string, data: Partial<{ category?: string; title?: string; priority?: string; status?: string; isRequired?: boolean; order?: number; description?: string; dependsOn?: any; assignedTo?: string; dueDate?: Date; notes?: string }>) => {
    const { org } = await getSession();
    try {
        // Ensure the item belongs to a launch plan in the org
        const item = await prisma.launchChecklistItem.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Checklist item not found or not in your organization' };
        const updated = await prisma.launchChecklistItem.update({ where: { id }, data });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a launch checklist item (scoped to org via parent launch plan)
 */
export const deleteLaunchChecklistItem = async (id: string) => {
    const { org } = await getSession();
    try {
        // Ensure the item belongs to a launch plan in the org
        const item = await prisma.launchChecklistItem.findFirst({ where: { id, launchPlan: { project: { organizationId: org } } } });
        if (!item) return { success: false, error: 'Checklist item not found or not in your organization' };
        await prisma.launchChecklistItem.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 