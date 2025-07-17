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
        const issue = await prisma.issue.findFirst({
            where: { id, organizationId: org },
            include: {
                project: true,
                assignedTo: true,
            },
        });
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

export const getIssuesByProject = async (projectId: string) => {
    const { org } = await getSession();
    return await prisma.issue.findMany({
        where: { projectId, organizationId: org },
        select: { id: true, title: true }, // add more fields as needed
    });
};

export const listAllIssues = async () => {
    const { org } = await getSession();
    return await prisma.issue.findMany({
        where: { organizationId: org },
        select: { id: true, title: true }, // add more fields as needed
    });
};

/**
 * Get all links for an issue (scoped to org)
 */
export const getLinks = async (issueId: string) => {
    const { org } = await getSession();
    try {
        const links = await prisma.issueLink.findMany({
            where: { issueId, organizationId: org },
        });
        return { success: true, data: links };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Add a link to an issue (scoped to org)
 */
export const addLink = async ({ issueId, url }: { issueId: string; url: string }) => {
    const { org } = await getSession();
    try {
        const link = await prisma.issueLink.create({
            data: { issueId, url, organizationId: org },
        });
        return { success: true, data: link };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Delete a link from an issue (scoped to org)
 */
export const deleteLink = async (linkId: string) => {
    const { org } = await getSession();
    try {
        await prisma.issueLink.delete({
            where: { id: linkId, organizationId: org },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Get the hierarchy for an issue (parent and sub-issues)
 */
export const getIssueHierarchy = async (issueId: string) => {
    const { org } = await getSession();
    // Get the issue
    const issue = await prisma.issue.findFirst({
        where: { id: issueId, organizationId: org },
    });
    if (!issue) return { parentIssue: null, subIssues: [] };

    // Get parent issue (if any)
    let parentIssue = null;
    if (issue.parentIssueId) {
        parentIssue = await prisma.issue.findFirst({
            where: { id: issue.parentIssueId, organizationId: org },
            include: {
                project: true,
                assignedTo: true,
            },
        });
    }

    // Get sub-issues
    const subIssues = await prisma.issue.findMany({
        where: { parentIssueId: issueId, organizationId: org },
        include: {
            project: true,
            assignedTo: true,
        },
    });

    return { parentIssue, subIssues };
};

/**
 * Get dependencies and dependents for an issue (scoped to org)
 */
export const getIssueDependencies = async ({ issueId }: { issueId: string }) => {
    const { org } = await getSession();
    // Issues that this issue depends on (parent issues)
    const dependencies = await prisma.issue.findMany({
        where: {
            dependents: {
                some: {
                    id: issueId,
                    organizationId: org,
                },
            },
            organizationId: org,
        },
        include: { assignedTo: true, project: true },
    });
    // Issues that depend on this issue (child issues)
    const dependents = await prisma.issue.findMany({
        where: {
            dependencies: {
                some: {
                    id: issueId,
                    organizationId: org,
                },
            },
            organizationId: org,
        },
        include: { assignedTo: true, project: true },
    });
    return { dependencies, dependents };
};

/**
 * Add a dependency between two issues (scoped to org)
 */
export const addIssueDependency = async ({ parentId, dependentIssueId }: { parentId: string; dependentIssueId: string }) => {
    const { org } = await getSession();
    // Prevent circular dependencies (not implemented here, just a placeholder)
    if (parentId === dependentIssueId) throw new Error("Cannot add self as dependency");
    // Add the dependency
    await prisma.issue.update({
        where: { id: dependentIssueId, organizationId: org },
        data: {
            dependencies: {
                connect: { id: parentId },
            },
        },
    });
    return { success: true };
};

/**
 * Remove a dependency between two issues (scoped to org)
 */
export const removeIssueDependency = async ({ parentId, dependentIssueId }: { parentId: string; dependentIssueId: string }) => {
    const { org } = await getSession();
    await prisma.issue.update({
        where: { id: dependentIssueId, organizationId: org },
        data: {
            dependencies: {
                disconnect: { id: parentId },
            },
        },
    });
    return { success: true };
};

/**
 * Validate if an issue can be completed (all dependencies are DONE)
 */
export const validateIssueCompletion = async ({ issueId }: { issueId: string }) => {
    const { org } = await getSession();
    // Get dependencies
    const dependencies = await prisma.issue.findMany({
        where: {
            dependents: {
                some: {
                    id: issueId,
                    organizationId: org,
                },
            },
            organizationId: org,
        },
    });
    // Blockers: dependencies that are not DONE
    const blockers = dependencies.filter((dep) => dep.status !== "DONE");
    return {
        canComplete: blockers.length === 0,
        blockers,
    };
};

/**
 * Get all descendant issues (recursive, returns flat array of IDs)
 */
export const getAllDescendantIssues = async ({ issueId }: { issueId: string }) => {
    const { org } = await getSession();
    // Recursive helper
    const findDescendants = async (id: string, acc: Set<string>) => {
        const children = await prisma.issue.findMany({
            where: {
                dependencies: {
                    some: { id, organizationId: org },
                },
                organizationId: org,
            },
            select: { id: true },
        });
        for (const child of children) {
            if (!acc.has(child.id)) {
                acc.add(child.id);
                await findDescendants(child.id, acc);
            }
        }
    };
    const acc = new Set<string>();
    await findDescendants(issueId, acc);
    return Array.from(acc);
}; 