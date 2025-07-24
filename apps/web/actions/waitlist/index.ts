"use server";
import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

/**
 * Create a new waitlist
 */
export const createWaitlist = async (data: {
  projectId: string;
  name: string;
  slug: string;
  description: string;
  isPublic: boolean;
  allowNameCapture: boolean;
  showPosition: boolean;
  showSocialProof: boolean;
  customMessage?: string;
  emailSyncEnabled?: boolean;
  integrationId?: string;
}) => {
  const { org, userId } = await getSession();
  try {
    const waitlist = await prisma.waitlist.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        isPublic: data.isPublic,
        allowNameCapture: data.allowNameCapture,
        showPosition: data.showPosition,
        showSocialProof: data.showSocialProof,
        customMessage: data.customMessage,
        organizationId: org,
        createdById: userId,
      },
    });

    // If email sync is enabled and integration ID is provided, create integration usage
    if (data.emailSyncEnabled && data.integrationId) {
      await prisma.integrationUsage.create({
        data: {
          integrationId: data.integrationId,
          entityType: "waitlist",
          entityId: waitlist.id,
          purpose: "email_sync",
          isActive: true,
        },
      });
    }

    return { success: true, data: waitlist };
  } catch (error) {
    console.error("Error creating waitlist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create waitlist",
    };
  }
};

/**
 * Get a waitlist by ID (scoped to org)
 */
export const getWaitlist = async (id: string) => {
  const { org } = await getSession();
  try {
    const waitlist = await prisma.waitlist.findFirst({
      where: { id, organizationId: org },
      include: { project: true },
    });

    if (!waitlist) {
      return { success: false, error: "Waitlist not found" };
    }

    // Get integration usage for email sync
    const emailSyncUsage = await prisma.integrationUsage.findFirst({
      where: {
        entityType: "waitlist",
        entityId: id,
        purpose: "email_sync",
        isActive: true,
      },
      include: {
        integration: true,
      },
    });

    return {
      success: true,
      data: {
        ...waitlist,
        emailSyncEnabled: !!emailSyncUsage,
        integrationId: emailSyncUsage?.integrationId || null,
      },
    };
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
    const waitlist = await prisma.waitlist.findFirst({
      where: { slug },
      include: { project: { select: { name: true } } },
    });

    if (!waitlist || !waitlist.isPublic) {
      return { success: false, error: "Waitlist not found or is not public" };
    }

    // Fetch stats
    const totalEntries = await prisma.waitlistEntry.count({
      where: { waitlistId: waitlist.id },
    });
    const verifiedCount = await prisma.waitlistEntry.count({
      where: { waitlistId: waitlist.id, verifiedAt: { not: null } },
    });
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
    const waitlists = await prisma.waitlist.findMany({
      where: { organizationId: org },
      include: { project: true },
    });
    // For each waitlist, fetch stats
    const waitlistsWithStats = await Promise.all(
      waitlists.map(async (waitlist) => {
        const totalEntries = await prisma.waitlistEntry.count({
          where: { waitlistId: waitlist.id },
        });
        const verifiedEntries = await prisma.waitlistEntry.count({
          where: { waitlistId: waitlist.id, verifiedAt: { not: null } },
        });
        // Count total referrals by summing up referral counts for each entry
        const entriesWithReferrals = await prisma.waitlistEntry.findMany({
          where: { waitlistId: waitlist.id },
          include: {
            _count: {
              select: {
                referrals: true,
              },
            },
          },
        });
        const totalReferrals = entriesWithReferrals.reduce(
          (sum, entry) => sum + entry._count.referrals,
          0
        );
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
export const updateWaitlist = async (
  id: string,
  data: Partial<{
    name?: string;
    slug?: string;
    description?: string;
    isPublic?: boolean;
    allowNameCapture?: boolean;
    showPosition?: boolean;
    showSocialProof?: boolean;
    customMessage?: string;
    emailSyncEnabled?: boolean;
    integrationId?: string;
  }>
) => {
  const { org } = await getSession();
  try {
    // Extract integration-related fields
    const { emailSyncEnabled, integrationId, ...waitlistData } = data;

    const waitlist = await prisma.waitlist.update({
      where: { id, organizationId: org },
      data: waitlistData,
    });

    // Handle integration usage
    if (emailSyncEnabled !== undefined || integrationId !== undefined) {
      // Check if integration usage already exists
      const existingUsage = await prisma.integrationUsage.findFirst({
        where: {
          entityType: "waitlist",
          entityId: id,
          purpose: "email_sync",
        },
      });

      if (emailSyncEnabled && integrationId) {
        if (existingUsage) {
          // Update existing usage
          await prisma.integrationUsage.update({
            where: { id: existingUsage.id },
            data: {
              integrationId,
              isActive: true,
            },
          });
        } else {
          // Create new usage
          await prisma.integrationUsage.create({
            data: {
              integrationId,
              entityType: "waitlist",
              entityId: id,
              purpose: "email_sync",
              isActive: true,
            },
          });
        }
      } else if (!emailSyncEnabled && existingUsage) {
        // Deactivate existing usage
        await prisma.integrationUsage.update({
          where: { id: existingUsage.id },
          data: { isActive: false },
        });
      }
    }

    return { success: true, data: waitlist };
  } catch (error) {
    console.error("Error updating waitlist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update waitlist",
    };
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
 * Get comprehensive analytics for a waitlist
 */
export const getWaitlistAnalytics = async (waitlistId: string) => {
  const { org } = await getSession();
  // Ensure the waitlist belongs to the org
  const waitlist = await prisma.waitlist.findFirst({
    where: { id: waitlistId, organizationId: org },
  });
  if (!waitlist)
    return {
      success: false,
      error: "Waitlist not found or not in your organization",
    };

  // Fetch all entries with their data
  const entries = await prisma.waitlistEntry.findMany({
    where: { waitlistId },
    include: {
      _count: {
        select: {
          referrals: true,
        },
      },
    },
  });

  // Calculate comprehensive analytics
  const totalEntries = entries.length;
  const totalReferrals = entries.reduce(
    (sum, entry) => sum + entry._count.referrals,
    0
  );

  // Status breakdowns
  const verifiedCount = entries.filter((e) => e.verifiedAt).length;
  const invitedCount = entries.filter(
    (e) => e.status === "invited" || e.status === "joined"
  ).length;
  const joinedCount = entries.filter((e) => e.status === "joined").length;
  const activeReferrers = entries.filter((e) => e._count.referrals > 0).length;

  // UTM source breakdown
  const utmSources = entries.reduce(
    (acc, entry) => {
      const source = entry.utmSource || "direct";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Status breakdown
  const statusBreakdown = entries.reduce(
    (acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentEntries = entries.filter(
    (e) => e.createdAt > sevenDaysAgo
  ).length;
  const recentVerifications = entries.filter(
    (e) => e.verifiedAt && e.verifiedAt > sevenDaysAgo
  ).length;

  // Conversion rates
  const verificationRate =
    totalEntries > 0 ? (verifiedCount / totalEntries) * 100 : 0;
  const invitationRate =
    verifiedCount > 0 ? (invitedCount / verifiedCount) * 100 : 0;
  const joinRate = invitedCount > 0 ? (joinedCount / invitedCount) * 100 : 0;
  const overallConversionRate =
    totalEntries > 0 ? (joinedCount / totalEntries) * 100 : 0;
  const avgReferralsPerUser =
    totalEntries > 0 ? totalReferrals / totalEntries : 0;

  return {
    success: true,
    data: {
      // Basic counts
      totalEntries,
      totalReferrals,
      verifiedCount,
      invitedCount,
      joinedCount,
      activeReferrers,
      recentEntries,
      recentVerifications,

      // Breakdowns
      utmSources,
      statusBreakdown,

      // Rates and percentages
      verificationRate: Math.round(verificationRate),
      invitationRate: Math.round(invitationRate),
      joinRate: Math.round(joinRate),
      overallConversionRate: Math.round(overallConversionRate * 10) / 10, // Keep 1 decimal
      avgReferralsPerUser: Math.round(avgReferralsPerUser * 10) / 10, // Keep 1 decimal

      // Raw entries for detailed analysis (if needed)
      entries: entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        verifiedAt: entry.verifiedAt?.toISOString(),
        invitedAt: entry.invitedAt?.toISOString(),
        joinedAt: entry.joinedAt?.toISOString(),
      })),
    },
  };
};
