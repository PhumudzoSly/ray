import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { generateReferralCode } from "../lib/crypto-convex";
import {
  sendWaitlistWelcomeEmail,
  sendEmailVerificationConfirmation,
  sendWaitlistInviteEmail,
} from "../lib/waitlist-emails";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

// Create a new waitlist
export const createWaitlist = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    isPublic: v.optional(v.boolean()),
    allowNameCapture: v.optional(v.boolean()),
    showPosition: v.optional(v.boolean()),
    showSocialProof: v.optional(v.boolean()),
    customMessage: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if slug already exists
    const existingWaitlist = await ctx.db
      .query("waitlists")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingWaitlist) {
      throw new Error("Waitlist with this slug already exists");
    }

    const now = Date.now();
    const waitlistId = await ctx.db.insert("waitlists", {
      projectId: args.projectId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      isPublic: args.isPublic ?? true,
      allowNameCapture: args.allowNameCapture ?? true,
      showPosition: args.showPosition ?? true,
      showSocialProof: args.showSocialProof ?? true,
      customMessage: args.customMessage,
      organizationId: session.activeOrganizationId as Id<"organization">,
      createdAt: now,
      updatedAt: now,
      createdBy: session.userId as Id<"user">,
    });

    return waitlistId;
  },
});

// Get all waitlists for an organization
export const getAllWaitlists = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const waitlists = await ctx.db
      .query("waitlists")
      .withIndex("by_organization", (q) =>
        q.eq(
          "organizationId",
          session.activeOrganizationId as Id<"organization">
        )
      )
      .collect();

    // Get stats for each waitlist
    const waitlistsWithStats = await Promise.all(
      waitlists.map(async (waitlist) => {
        const entries = await ctx.db
          .query("waitlistEntries")
          .withIndex("by_waitlist", (q) => q.eq("waitlistId", waitlist._id))
          .collect();

        const totalEntries = entries.length;
        const verifiedEntries = entries.filter(
          (e) => e.status === "verified"
        ).length;
        const invitedEntries = entries.filter(
          (e) => e.status === "invited"
        ).length;
        const joinedEntries = entries.filter(
          (e) => e.status === "joined"
        ).length;
        const totalReferrals = entries.reduce(
          (sum, e) => sum + e.referralCount,
          0
        );

        // Get project info
        const project = await ctx.db.get(waitlist.projectId);

        return {
          ...waitlist,
          project,
          stats: {
            totalEntries,
            verifiedEntries,
            invitedEntries,
            joinedEntries,
            totalReferrals,
            conversionRate:
              totalEntries > 0 ? (joinedEntries / totalEntries) * 100 : 0,
          },
        };
      })
    );

    return waitlistsWithStats;
  },
});

// Get waitlist by slug (for public pages)
export const getWaitlistBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const waitlist = await ctx.db
      .query("waitlists")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!waitlist || !waitlist.isPublic) {
      return null;
    }

    // Get project info
    const project = await ctx.db.get(waitlist.projectId);

    // Get total entries for social proof
    const totalEntries = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_waitlist", (q) => q.eq("waitlistId", waitlist._id))
      .collect();

    const verifiedCount = totalEntries.filter(
      (e) => e.status === "verified"
    ).length;
    const todayCount = totalEntries.filter(
      (e) => e.createdAt > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    return {
      ...waitlist,
      project,
      stats: {
        totalEntries: totalEntries.length,
        verifiedCount,
        todayCount,
      },
    };
  },
});

// Get waitlist by ID (for admin pages)
export const getWaitlistById = query({
  args: {
    waitlistId: v.id("waitlists"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const waitlist = await ctx.db.get(args.waitlistId);
    if (!waitlist) return null;

    // Check if user has access to this waitlist (same organization)
    if (waitlist.organizationId !== session.activeOrganizationId) {
      throw Error("Unauthorized");
    }

    // Get project info
    const project = await ctx.db.get(waitlist.projectId);

    return {
      ...waitlist,
      project,
    };
  },
});

// Get waitlist by ID with organization verification (for API access)
export const getWaitlistByIdWithOrg = query({
  args: {
    waitlistId: v.id("waitlists"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const waitlist = await ctx.db.get(args.waitlistId);
    if (!waitlist) return null;

    // Check if waitlist belongs to the specified organization
    if (waitlist.organizationId !== args.organizationId) {
      return null;
    }

    // Get project info
    const project = await ctx.db.get(waitlist.projectId);

    return {
      ...waitlist,
      project,
    };
  },
});

// Join waitlist
export const joinWaitlist = mutation({
  args: {
    waitlistId: v.id("waitlists"),
    email: v.string(),
    name: v.optional(v.string()),
    referredBy: v.optional(v.string()),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists in this waitlist
    const existingEntry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_waitlist", (q) => q.eq("waitlistId", args.waitlistId))
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingEntry) {
      throw new Error("Email already registered for this waitlist");
    }

    // Get current position (next available position)
    const entries = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_waitlist", (q) => q.eq("waitlistId", args.waitlistId))
      .collect();

    const nextPosition = entries.length + 1;

    // Generate unique referral code
    const referralCode = generateReferralCode();

    // Generate verification token
    const verificationToken = generateReferralCode();

    const now = Date.now();
    const entryId = await ctx.db.insert("waitlistEntries", {
      waitlistId: args.waitlistId,
      email: args.email,
      name: args.name,
      status: "pending",
      position: nextPosition,
      referralCode,
      referredBy: args.referredBy,
      referralCount: 0,
      verificationToken,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      createdAt: now,
      updatedAt: now,
    });

    // If this was a referral, update the referrer's count and position
    if (args.referredBy) {
      const referrer = await ctx.db
        .query("waitlistEntries")
        .withIndex("by_referral_code", (q) =>
          q.eq("referralCode", args.referredBy!)
        )
        .first();

      if (referrer && referrer.waitlistId === args.waitlistId) {
        const newReferralCount = referrer.referralCount + 1;
        await ctx.db.patch(referrer._id, {
          referralCount: newReferralCount,
          updatedAt: now,
        });

        // Move referrer up one position (if not already at position 1)
        if (referrer.position > 1) {
          await moveUserUp(ctx, referrer._id, referrer.position - 1);
        }
      }
    }

    // Send welcome email
    try {
      const waitlist = await ctx.db.get(args.waitlistId);
      if (waitlist) {
        const project = await ctx.db.get(waitlist.projectId);
        if (project) {
          await sendWaitlistWelcomeEmail(
            {
              email: args.email,
              name: args.name,
              position: nextPosition,
              referralCode,
              verificationToken,
            },
            {
              name: waitlist.name,
              description: waitlist.description,
              slug: waitlist.slug,
              project: { name: project.name },
            }
          );
        }
      }
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't fail the entire operation if email fails
    }

    return entryId;
  },
});

// Verify email
export const verifyEmail = mutation({
  args: {
    verificationToken: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_verification_token", (q) =>
        q.eq("verificationToken", args.verificationToken)
      )
      .first();

    if (!entry) {
      throw new Error("Invalid verification token");
    }

    if (entry.status !== "pending") {
      throw new Error("Email already verified");
    }

    const now = Date.now();
    await ctx.db.patch(entry._id, {
      status: "verified",
      verifiedAt: now,
      updatedAt: now,
      verificationToken: undefined,
    });

    // Send verification confirmation email
    try {
      const waitlist = await ctx.db.get(entry.waitlistId);
      if (waitlist) {
        const project = await ctx.db.get(waitlist.projectId);
        if (project) {
          await sendEmailVerificationConfirmation(
            {
              email: entry.email,
              name: entry.name,
              position: entry.position,
              referralCode: entry.referralCode,
            },
            {
              name: waitlist.name,
              description: waitlist.description,
              slug: waitlist.slug,
              project: { name: project.name },
            }
          );
        }
      }
    } catch (error) {
      console.error("Failed to send verification confirmation email:", error);
      // Don't fail the entire operation if email fails
    }

    return entry._id;
  },
});

// Get waitlist entries (for admin)
export const getWaitlistEntries = query({
  args: {
    waitlistId: v.id("waitlists"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if user has access to this waitlist
    const waitlist = await ctx.db.get(args.waitlistId);
    if (!waitlist || waitlist.organizationId !== session.activeOrganizationId) {
      throw Error("Unauthorized");
    }

    let query = ctx.db
      .query("waitlistEntries")
      .withIndex("by_waitlist", (q) => q.eq("waitlistId", args.waitlistId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const entries = await query.collect();

    // Sort by position
    entries.sort((a, b) => a.position - b.position);

    // Apply pagination if specified
    const start = args.offset || 0;
    const end = args.limit ? start + args.limit : entries.length;
    const paginatedEntries = entries.slice(start, end);

    return {
      entries: paginatedEntries,
      total: entries.length,
    };
  },
});

// Update entry status
export const updateEntryStatus = mutation({
  args: {
    entryId: v.id("waitlistEntries"),
    status: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Entry not found");
    }

    // Check if user has access to this waitlist
    const waitlist = await ctx.db.get(entry.waitlistId);
    if (!waitlist || waitlist.organizationId !== session.activeOrganizationId) {
      throw Error("Unauthorized");
    }

    const now = Date.now();
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === "invited") {
      updates.invitedAt = now;
    } else if (args.status === "joined") {
      updates.joinedAt = now;
    }

    await ctx.db.patch(args.entryId, updates);

    // Send invite email if status changed to invited
    if (args.status === "invited") {
      try {
        if (waitlist) {
          const project = await ctx.db.get(waitlist.projectId);
          if (project) {
            await sendWaitlistInviteEmail(
              {
                email: entry.email,
                name: entry.name,
                position: entry.position,
                referralCode: entry.referralCode,
              },
              {
                name: waitlist.name,
                description: waitlist.description,
                slug: waitlist.slug,
                project: { name: project.name },
              }
            );
          }
        }
      } catch (error) {
        console.error("Failed to send invite email:", error);
        // Don't fail the entire operation if email fails
      }
    }

    return args.entryId;
  },
});

// Get entry by referral code (for referral tracking)
export const getEntryByReferralCode = query({
  args: {
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_referral_code", (q) =>
        q.eq("referralCode", args.referralCode)
      )
      .first();

    if (!entry) return null;

    // Get waitlist info
    const waitlist = await ctx.db.get(entry.waitlistId);

    return {
      ...entry,
      waitlist,
    };
  },
});

// Helper function to move user up in position
async function moveUserUp(
  ctx: any,
  entryId: Id<"waitlistEntries">,
  newPosition: number
) {
  const entry = await ctx.db.get(entryId);
  if (!entry) return;

  const oldPosition = entry.position;
  if (newPosition >= oldPosition) return; // Can't move down

  // Get all entries in the waitlist
  const allEntries = await ctx.db
    .query("waitlistEntries")
    .withIndex("by_waitlist", (q: any) => q.eq("waitlistId", entry.waitlistId))
    .collect();

  // Find entries that need to be shifted down
  const entriesToShift = allEntries.filter(
    (e: any) =>
      e.position >= newPosition && e.position < oldPosition && e._id !== entryId
  );

  // Shift them down by 1
  await Promise.all(
    entriesToShift.map((e: any) =>
      ctx.db.patch(e._id, {
        position: e.position + 1,
        updatedAt: Date.now(),
      })
    )
  );

  // Update the moving entry
  await ctx.db.patch(entryId, {
    position: newPosition,
    updatedAt: Date.now(),
  });
}

// Delete waitlist entry
export const deleteWaitlistEntry = mutation({
  args: {
    entryId: v.id("waitlistEntries"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Entry not found");
    }

    // Check if user has access to this waitlist
    const waitlist = await ctx.db.get(entry.waitlistId);
    if (!waitlist || waitlist.organizationId !== session.activeOrganizationId) {
      throw Error("Unauthorized");
    }

    // Get all entries in the same waitlist with higher positions
    const entriesToReposition = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_waitlist", (q) => q.eq("waitlistId", entry.waitlistId))
      .filter((q) => q.gt(q.field("position"), entry.position))
      .collect();

    // Move all higher positioned entries up by 1
    await Promise.all(
      entriesToReposition.map((e) =>
        ctx.db.patch(e._id, {
          position: e.position - 1,
          updatedAt: Date.now(),
        })
      )
    );

    // Delete the entry
    await ctx.db.delete(args.entryId);
    return args.entryId;
  },
});

// Update waitlist settings
export const updateWaitlist = mutation({
  args: {
    waitlistId: v.id("waitlists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    allowNameCapture: v.optional(v.boolean()),
    showPosition: v.optional(v.boolean()),
    showSocialProof: v.optional(v.boolean()),
    customMessage: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const waitlist = await ctx.db.get(args.waitlistId);
    if (!waitlist || waitlist.organizationId !== session.activeOrganizationId) {
      throw Error("Unauthorized");
    }

    const { waitlistId, token, ...updates } = args;

    await ctx.db.patch(waitlistId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return waitlistId;
  },
});

// Get waitlist analytics
export const getWaitlistAnalytics = query({
  args: {
    waitlistId: v.id("waitlists"),
    days: v.optional(v.number()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if user has access to this waitlist
    const waitlist = await ctx.db.get(args.waitlistId);
    if (!waitlist || waitlist.organizationId !== session.activeOrganizationId) {
      throw Error("Unauthorized");
    }

    const days = args.days || 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_waitlist", (q) => q.eq("waitlistId", args.waitlistId))
      .collect();

    const recentEntries = entries.filter((e) => e.createdAt >= startDate);

    // Calculate daily signups
    const dailySignups: { [key: string]: number } = {};
    recentEntries.forEach((entry) => {
      const date = new Date(entry.createdAt).toISOString().split("T")[0];
      dailySignups[date] = (dailySignups[date] || 0) + 1;
    });

    // Calculate referral stats
    const totalReferrals = entries.reduce((sum, e) => sum + e.referralCount, 0);
    const topReferrers = entries
      .filter((e) => e.referralCount > 0)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 10);

    // Status breakdown
    const statusBreakdown = entries.reduce(
      (acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    return {
      totalEntries: entries.length,
      recentEntries: recentEntries.length,
      totalReferrals,
      dailySignups,
      topReferrers,
      statusBreakdown,
      conversionRate:
        entries.length > 0
          ? ((statusBreakdown.joined || 0) / entries.length) * 100
          : 0,
    };
  },
});
