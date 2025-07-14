import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexSession } from "../betterAuth";

// Create or update launch copy for a platform
export const upsertCopy = mutation({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    platform: v.union(
      v.literal("product-hunt"),
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("hackernews"),
      v.literal("readme"),
      v.literal("website"),
      v.literal("press-release"),
      v.literal("email")
    ),
    copy: v.object({
      title: v.string(),
      tagline: v.optional(v.string()),
      description: v.string(),
      callToAction: v.optional(v.string()),
      hashtags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
      media: v.optional(
        v.array(
          v.object({
            type: v.union(
              v.literal("image"),
              v.literal("video"),
              v.literal("gif")
            ),
            url: v.string(),
            alt: v.optional(v.string()),
          })
        )
      ),
    }),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    // Check if copy already exists for this platform
    const existing = await ctx.db
      .query("launchCopy")
      .withIndex("by_platform", (q) =>
        q.eq("launchPlanId", args.launchPlanId).eq("platform", args.platform)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing copy
      await ctx.db.patch(existing._id, {
        ...args.copy,
        version: existing.version + 1,
        isApproved: false, // Reset approval when content changes
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new copy
      const copyId = await ctx.db.insert("launchCopy", {
        launchPlanId: args.launchPlanId,
        platform: args.platform,
        ...args.copy,
        isApproved: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
      return copyId;
    }
  },
});

// Approve launch copy
export const approveCopy = mutation({
  args: {
    token: v.string(),
    copyId: v.id("launchCopy"),
    isApproved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.patch(args.copyId, {
      isApproved: args.isApproved,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all copy for a launch plan
export const getByLaunchPlan = query({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const copies = await ctx.db
      .query("launchCopy")
      .withIndex("by_launch_plan", (q) =>
        q.eq("launchPlanId", args.launchPlanId)
      )
      .collect();

    // Group by platform for easier access
    const copyByPlatform = copies.reduce(
      (acc, copy) => {
        acc[copy.platform] = copy;
        return acc;
      },
      {} as Record<string, any>
    );

    return {
      copies,
      copyByPlatform,
    };
  },
});

// Get copy for specific platform
export const getByPlatform = query({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
    platform: v.union(
      v.literal("product-hunt"),
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("reddit"),
      v.literal("hackernews"),
      v.literal("readme"),
      v.literal("website"),
      v.literal("press-release"),
      v.literal("email")
    ),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const copy = await ctx.db
      .query("launchCopy")
      .withIndex("by_platform", (q) =>
        q.eq("launchPlanId", args.launchPlanId).eq("platform", args.platform)
      )
      .first();

    return copy;
  },
});

// Delete copy for a platform
export const deleteCopy = mutation({
  args: {
    token: v.string(),
    copyId: v.id("launchCopy"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    await ctx.db.delete(args.copyId);
    return { success: true };
  },
});

// Get copy approval status summary
export const getApprovalStatus = query({
  args: {
    token: v.string(),
    launchPlanId: v.id("launchPlans"),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const copies = await ctx.db
      .query("launchCopy")
      .withIndex("by_launch_plan", (q) =>
        q.eq("launchPlanId", args.launchPlanId)
      )
      .collect();

    const total = copies.length;
    const approved = copies.filter((copy) => copy.isApproved).length;
    const pending = total - approved;

    const approvalByPlatform = copies.reduce(
      (acc, copy) => {
        acc[copy.platform] = copy.isApproved;
        return acc;
      },
      {} as Record<string, boolean>
    );

    return {
      total,
      approved,
      pending,
      approvalPercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      approvalByPlatform,
      isReadyForLaunch: approved === total && total > 0,
    };
  },
});
