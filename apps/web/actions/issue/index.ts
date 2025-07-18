"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { EntityType, ActivityType } from "@workspace/backend/prisma/generated/client/client";

/**
 * Create a new issue
 */
export const createIssue = async (data: { title: string; projectId: string; status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED" | "CANCELLED"; priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; label: "UI" | "BUG" | "FEATURE" | "DOCUMENTATION" | "REFACTOR" | "PERFORMANCE" | "DESIGN" | "SECURITY" | "ACCESSIBILITY" | "TESTING" | "INTERNATIONALIZATION"; description?: string; milestoneId?: string; featureId?: string; parentIssueId?: string; dueDate?: Date; assignedToId?: string; achieved?: boolean; isPublic?: boolean; sourceType?: string; sourceFeedbackId?: string }) => {
    const { org, userId } = await getSession();
    try {
        const issue = await prisma.issue.create({
            data: {
                ...data,
                organizationId: org,
            },
            include: {
                project: true,
                assignedTo: true,
            },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.CREATED,
                title: `Issue "${data.title}" created`,
                description: `New issue created.`,
                entityType: EntityType.ISSUE,
                entityId: issue.id,
                organizationId: org,
                userId: userId,
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
        const issues = await prisma.issue.findMany({ where: { organizationId: org }, include: { project: true } });
        return { success: true, data: issues };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Update an issue (scoped to org)
 */
export const updateIssue = async (id: string, data: Partial<{ title?: string; status?: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED" | "CANCELLED"; priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; label?: "UI" | "BUG" | "FEATURE" | "DOCUMENTATION" | "REFACTOR" | "PERFORMANCE" | "DESIGN" | "SECURITY" | "ACCESSIBILITY" | "TESTING" | "INTERNATIONALIZATION"; description?: string; milestoneId?: string | null; featureId?: string; parentIssueId?: string; dueDate?: Date; assignedToId?: string; achieved?: boolean; isPublic?: boolean; sourceType?: string; sourceFeedbackId?: string }>) => {
    const { org, userId } = await getSession();
    try {
        // Get the original issue to compare changes
        const originalIssue = await prisma.issue.findFirst({
            where: { id, organizationId: org },
        });

        if (!originalIssue) {
            return { success: false, error: "Issue not found" };
        }

        const updatedIssue = await prisma.issue.update({
            where: { id, organizationId: org },
            data
        });

        // Track changes for activity feed
        const changes: string[] = [];

        // Check for status changes
        if (data.status && data.status !== originalIssue.status) {
            changes.push(`Status changed from ${originalIssue.status} to ${data.status}`);
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.UPDATED,
                    title: `Issue "${updatedIssue.title}" status updated`,
                    description: `Status changed from ${originalIssue.status} to ${data.status}`,
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalIssue.status,
                    newValue: data.status,
                },
            });
        }

        // Check for priority changes
        if (data.priority && data.priority !== originalIssue.priority) {
            changes.push(`Priority changed from ${originalIssue.priority} to ${data.priority}`);
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.UPDATED,
                    title: `Issue "${updatedIssue.title}" priority updated`,
                    description: `Priority changed from ${originalIssue.priority} to ${data.priority}`,
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalIssue.priority,
                    newValue: data.priority,
                },
            });
        }

        // Check for assignment changes
        if (data.assignedToId !== undefined && data.assignedToId !== originalIssue.assignedToId) {
            const activityType = data.assignedToId ? ActivityType.ASSIGNED : ActivityType.UNASSIGNED;
            await prisma.activityFeed.create({
                data: {
                    type: activityType,
                    title: `Issue "${updatedIssue.title}" ${data.assignedToId ? 'assigned' : 'unassigned'}`,
                    description: data.assignedToId ? 'Issue assigned to user' : 'Issue unassigned',
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalIssue.assignedToId,
                    newValue: data.assignedToId,
                },
            });
        }

        // Check for parent issue changes
        if (data.parentIssueId !== undefined && data.parentIssueId !== originalIssue.parentIssueId) {
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.PARENT_CHANGED,
                    title: `Issue "${updatedIssue.title}" parent changed`,
                    description: 'Issue parent relationship updated',
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalIssue.parentIssueId,
                    newValue: data.parentIssueId,
                },
            });
        }

        // Check for title changes
        if (data.title && data.title !== originalIssue.title) {
            changes.push(`Title updated`);
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.UPDATED,
                    title: `Issue title updated`,
                    description: `Title changed from "${originalIssue.title}" to "${data.title}"`,
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                    oldValue: originalIssue.title,
                    newValue: data.title,
                },
            });
        }

        // Check for description changes
        if (data.description !== undefined && data.description !== originalIssue.description) {
            changes.push(`Description updated`);
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.UPDATED,
                    title: `Issue "${updatedIssue.title}" description updated`,
                    description: 'Issue description modified',
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                },
            });
        }

        // Create general update activity if there are other changes
        if (changes.length > 0) {
            await prisma.activityFeed.create({
                data: {
                    type: ActivityType.UPDATED,
                    title: `Issue "${updatedIssue.title}" updated`,
                    description: changes.join(', '),
                    entityType: EntityType.ISSUE,
                    entityId: id,
                    organizationId: org,
                    userId: userId,
                },
            });
        }

        return { success: true, data: updatedIssue };
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
    const { org, userId } = await getSession();
    try {
        // Get issue details for activity tracking
        const issue = await prisma.issue.findFirst({
            where: { id: issueId, organizationId: org },
        });

        if (!issue) {
            return { success: false, error: "Issue not found" };
        }

        const link = await prisma.issueLink.create({
            data: { issueId, url, organizationId: org },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.LINK_ADDED,
                title: `Link added to "${issue.title}"`,
                description: `New link: ${url}`,
                entityType: EntityType.ISSUE,
                entityId: issueId,
                organizationId: org,
                userId: userId,
            },
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
    const { org, userId } = await getSession();
    try {
        // Get link details for activity tracking
        const link = await prisma.issueLink.findFirst({
            where: { id: linkId, organizationId: org },
            include: {
                issue: true,
            },
        });

        if (!link) {
            return { success: false, error: "Link not found" };
        }

        await prisma.issueLink.delete({
            where: { id: linkId, organizationId: org },
        });

        // Create activity feed entry
        await prisma.activityFeed.create({
            data: {
                type: ActivityType.LINK_REMOVED,
                title: `Link removed from "${link.issue.title}"`,
                description: `Link removed: ${link.url}`,
                entityType: EntityType.ISSUE,
                entityId: link.issueId,
                organizationId: org,
                userId: userId,
            },
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
            dependentOn: {
                some: {
                    issueId: issueId,
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
                    dependencyId: issueId,
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
 * Get issue activity feed
 */
export const getIssueActivity = async (issueId: string, limit = 50) => {
    const { org } = await getSession();
    try {
        const activities = await prisma.activityFeed.findMany({
            where: {
                entityType: EntityType.ISSUE,
                entityId: issueId,
                organizationId: org,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                user: true,
            },
        });
        return { success: true, data: activities };
    } catch (error) {
        return { success: false, error };
    }
};

/**
 * Add a dependency between two issues (scoped to org)
 */
export const addIssueDependency = async ({ parentId, dependentIssueId }: { parentId: string; dependentIssueId: string }) => {
    const { org, userId } = await getSession();
    // Prevent circular dependencies (not implemented here, just a placeholder)
    if (parentId === dependentIssueId) throw new Error("Cannot add self as dependency");

    // Get issue details for activity tracking
    const dependentIssue = await prisma.issue.findFirst({
        where: { id: dependentIssueId, organizationId: org },
    });

    if (!dependentIssue) {
        return { success: false, error: "Dependent issue not found" };
    }

    // Add the dependency
    await prisma.issueDependency.create({
        data: {
            issueId: dependentIssueId,
            dependencyId: parentId,
            organizationId: org,
        },
    });

    // Create activity feed entry
    await prisma.activityFeed.create({
        data: {
            type: ActivityType.DEPENDENCY_ADDED,
            title: `Dependency added to "${dependentIssue.title}"`,
            description: `Issue now depends on another issue`,
            entityType: EntityType.ISSUE,
            entityId: dependentIssueId,
            organizationId: org,
            userId: userId,
        },
    });

    return { success: true };
};

/**
 * Remove a dependency between two issues (scoped to org)
 */
export const removeIssueDependency = async ({ parentId, dependentIssueId }: { parentId: string; dependentIssueId: string }) => {
    const { org, userId } = await getSession();

    // Get issue details for activity tracking
    const dependentIssue = await prisma.issue.findFirst({
        where: { id: dependentIssueId, organizationId: org },
    });

    if (!dependentIssue) {
        return { success: false, error: "Dependent issue not found" };
    }

    await prisma.issueDependency.deleteMany({
        where: {
            issueId: dependentIssueId,
            dependencyId: parentId,
            organizationId: org,
        },
    });

    // Create activity feed entry
    await prisma.activityFeed.create({
        data: {
            type: ActivityType.DEPENDENCY_REMOVED,
            title: `Dependency removed from "${dependentIssue.title}"`,
            description: `Issue dependency removed`,
            entityType: EntityType.ISSUE,
            entityId: dependentIssueId,
            organizationId: org,
            userId: userId,
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
            dependentOn: {
                some: {
                    issueId: issueId,
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
                    some: { dependencyId: id, organizationId: org },
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