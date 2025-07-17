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
 * Get a public waitlist by slug, with stats
 * No auth required
 */
export const getWaitlistBySlug = async (slug: string) => {
    try {
        const waitlist = await prisma.waitlist.findUnique({
            where: { slug },
            include: { project: { select: { name: true } } },
        });

        if (!waitlist || !waitlist.isPublic) {
            return { success: false, error: "Waitlist not found or is not public" };
        }

        // Fetch stats
        const totalEntries = await prisma.waitlistEntry.count({ where: { waitlistId: waitlist.id } });
        const verifiedCount = await prisma.waitlistEntry.count({ where: { waitlistId: waitlist.id, verifiedAt: { not: null } } });
        const todayCount = await prisma.waitlistEntry.count({
            where: {
                waitlistId: waitlist.id,
                createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
        });

        return {
            success: true,
            data: {
                ...waitlist,
                stats: {
                    totalEntries,
                    verifiedCount,
                    todayCount,
                },
            },
        };
    } catch (error) {
        return { success: false, error };
    }
};


/**
 * List all waitlists for the current org, with stats for each
 */
export const getAllWaitlists = async () => {
    const { org } = await getSession();
    try {
        const waitlists = await prisma.waitlist.findMany({ where: { organizationId: org }, include: { project: true } });
        // For each waitlist, fetch stats
        const waitlistsWithStats = await Promise.all(
            waitlists.map(async (waitlist) => {
                const totalEntries = await prisma.waitlistEntry.count({ where: { waitlistId: waitlist.id } });
                const verifiedEntries = await prisma.waitlistEntry.count({ where: { waitlistId: waitlist.id, verifiedAt: { not: null } } });
                const referralAgg = await prisma.waitlistEntry.aggregate({
                    _sum: { referralCount: true },
                    where: { waitlistId: waitlist.id },
                });
                const totalReferrals = referralAgg._sum.referralCount || 0;
                return {
                    ...waitlist,
                    stats: {
                        totalEntries,
                        verifiedEntries,
                        totalReferrals,
                    },
                };
            })
        );
        return { success: true, data: waitlistsWithStats };
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

/**
 * Get analytics for a waitlist (total entries, total referrals, recent signups)
 */
export const getWaitlistAnalytics = async (waitlistId: string) => {
    const { org } = await getSession();
    // Ensure the waitlist belongs to the org
    const waitlist = await prisma.waitlist.findFirst({ where: { id: waitlistId, organizationId: org } });
    if (!waitlist) return { success: false, error: 'Waitlist not found or not in your organization' };
    // Total entries
    const totalEntries = await prisma.waitlistEntry.count({ where: { waitlistId } });
    // Total referrals (sum of referralCount)
    const referralAgg = await prisma.waitlistEntry.aggregate({
        _sum: { referralCount: true },
        where: { waitlistId },
    });
    const totalReferrals = referralAgg._sum.referralCount || 0;
    // Recent signups (last 7 days)
    const recentEntries = await prisma.waitlistEntry.count({
        where: {
            waitlistId,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
    });
    return {
        success: true,
        data: {
            totalEntries,
            totalReferrals,
            recentEntries,
        },
    };
}; 