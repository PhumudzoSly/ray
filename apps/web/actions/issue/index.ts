"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new issue
 */
export const createIssue = async (data: { title: string; projectId: string; status: string; priority: string; label: string; description?: string; milestoneId?: string; featureId?: string; parentIssueId?: string; dueDate?: Date; assignedToId?: string; achieved?: boolean; isPublic?: boolean; sourceType?: string; sourceFeedbackId?: string }) => {
    const { org } = await getSession();
    try {
        const issue = await prisma.issue.create({
            data: {
                ...data,
                organizationId: org,
            },
        });
        return { success: true, data: issue };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get an issue by ID (scoped to org)
 */
export const getIssue = async (id: string) => {
    const { org } = await getSession();
    try {
        const issue = await prisma.issue.findFirst({ where: { id, organizationId: org } });
        return { success: true, data: issue };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * List all issues for the current org
 */
export const getAllIssues = async () => {
    const { org } = await getSession();
    try {
        const issues = await prisma.issue.findMany({ where: { organizationId: org } });
        return { success: true, data: issues };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update an issue (scoped to org)
 */
export const updateIssue = async (id: string, data: Partial<{ title?: string; status?: string; priority?: string; label?: string; description?: string; milestoneId?: string; featureId?: string; parentIssueId?: string; dueDate?: Date; assignedToId?: string; achieved?: boolean; isPublic?: boolean; sourceType?: string; sourceFeedbackId?: string }>) => {
    const { org } = await getSession();
    try {
        const issue = await prisma.issue.update({ where: { id, organizationId: org }, data });
        return { success: true, data: issue };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete an issue (scoped to org)
 */
export const deleteIssue = async (id: string) => {
    const { org } = await getSession();
    try {
        await prisma.issue.delete({ where: { id, organizationId: org } });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}; 