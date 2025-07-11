import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";

// Queries
export const getProjectMilestones = query({
  args: { projectId: v.id("projects"), token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get milestone dependencies and calculate progress
    const milestonesWithDetails = await Promise.all(
      milestones.map(async (milestone) => {
        // Get dependencies
        const dependencies = await ctx.db
          .query("milestoneDependencies")
          .withIndex("by_milestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const dependsOn = await Promise.all(
          dependencies.map(async (dep) => {
            const dependentMilestone = await ctx.db.get(
              dep.dependsOnMilestoneId
            );
            return dependentMilestone;
          })
        );

        // Get blocking dependencies
        const blockingDependencies = await ctx.db
          .query("milestoneDependencies")
          .withIndex("by_depends_on", (q) =>
            q.eq("dependsOnMilestoneId", milestone._id)
          )
          .collect();

        const blocking = await Promise.all(
          blockingDependencies.map(async (dep) => {
            const blockingMilestone = await ctx.db.get(dep.milestoneId);
            return blockingMilestone;
          })
        );

        // Calculate progress based on associated issues and features
        const issues = await ctx.db
          .query("issues")
          .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const features = await ctx.db
          .query("feature")
          .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const completedIssues = issues.filter(
          (issue) => issue.achieved === true
        );
        const completedFeatures = features.filter(
          (feature) => feature.achieved === true || feature.phase === "LIVE"
        );

        const totalItems = issues.length + features.length;
        const completedItems =
          completedIssues.length + completedFeatures.length;
        const progress =
          totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        // Calculate overdue items
        const now = Date.now();
        const overdueIssues = issues.filter(
          (issue) =>
            issue.dueDate &&
            new Date(issue.dueDate).getTime() < now &&
            !issue.achieved
        );
        const overdueFeatures = features.filter(
          (feature) =>
            feature.endDate &&
            new Date(feature.endDate).getTime() < now &&
            !feature.achieved &&
            feature.phase !== "LIVE"
        );

        // Get owner details
        const owner = milestone.ownerId
          ? await ctx.db.get(milestone.ownerId)
          : null;

        return {
          ...milestone,
          dependsOn: dependsOn.filter(Boolean),
          blocking: blocking.filter(Boolean),
          progress: Math.round(progress),
          issueCount: issues.length,
          featureCount: features.length,
          completedIssueCount: completedIssues.length,
          completedFeatureCount: completedFeatures.length,
          totalItems,
          completedItems,
          overdueIssueCount: overdueIssues.length,
          overdueFeatureCount: overdueFeatures.length,
          overdueItems: overdueIssues.length + overdueFeatures.length,
          owner,
        };
      })
    );

    return milestonesWithDetails;
  },
});

export const getMilestone = query({
  args: { milestoneId: v.id("milestones"), token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) {
      return null;
    }

    // Get dependencies
    const dependencies = await ctx.db
      .query("milestoneDependencies")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestone._id))
      .collect();

    const dependsOn = await Promise.all(
      dependencies.map(async (dep) => {
        const dependentMilestone = await ctx.db.get(dep.dependsOnMilestoneId);
        return dependentMilestone;
      })
    );

    // Get blocking dependencies
    const blockingDependencies = await ctx.db
      .query("milestoneDependencies")
      .withIndex("by_depends_on", (q) =>
        q.eq("dependsOnMilestoneId", milestone._id)
      )
      .collect();

    const blocking = await Promise.all(
      blockingDependencies.map(async (dep) => {
        const blockingMilestone = await ctx.db.get(dep.milestoneId);
        return blockingMilestone;
      })
    );

    // Get associated issues and features
    const issues = await ctx.db
      .query("issues")
      .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
      .collect();

    const features = await ctx.db
      .query("feature")
      .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
      .collect();

    const completedIssues = issues.filter((issue) => issue.achieved === true);
    const completedFeatures = features.filter(
      (feature) => feature.achieved === true || feature.phase === "LIVE"
    );

    const totalItems = issues.length + features.length;
    const completedItems = completedIssues.length + completedFeatures.length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Calculate overdue items
    const now = Date.now();
    const overdueIssues = issues.filter(
      (issue) =>
        issue.dueDate &&
        new Date(issue.dueDate).getTime() < now &&
        !issue.achieved
    );
    const overdueFeatures = features.filter(
      (feature) =>
        feature.endDate &&
        new Date(feature.endDate).getTime() < now &&
        !feature.achieved &&
        feature.phase !== "LIVE"
    );

    // Get owner details
    const owner = milestone.ownerId
      ? await ctx.db.get(milestone.ownerId)
      : null;

    return {
      ...milestone,
      dependsOn: dependsOn.filter(Boolean),
      blocking: blocking.filter(Boolean),
      progress: Math.round(progress),
      issueCount: issues.length,
      featureCount: features.length,
      completedIssueCount: completedIssues.length,
      completedFeatureCount: completedFeatures.length,
      totalItems,
      completedItems,
      overdueIssueCount: overdueIssues.length,
      overdueFeatureCount: overdueFeatures.length,
      overdueItems: overdueIssues.length + overdueFeatures.length,
      owner,
      issues,
      features,
    };
  },
});

export const getOrganizationMilestones = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_organization", (q) =>
        q.eq(
          "organizationId",
          session.activeOrganizationId as Id<"organization">
        )
      )
      .collect();

    // Get milestone dependencies and calculate progress
    const milestonesWithDetails = await Promise.all(
      milestones.map(async (milestone) => {
        // Get project details
        const project = await ctx.db.get(milestone.projectId);

        // Get dependencies
        const dependencies = await ctx.db
          .query("milestoneDependencies")
          .withIndex("by_milestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const dependsOn = await Promise.all(
          dependencies.map(async (dep) => {
            const dependentMilestone = await ctx.db.get(
              dep.dependsOnMilestoneId
            );
            return dependentMilestone;
          })
        );

        // Get blocking dependencies
        const blockingDependencies = await ctx.db
          .query("milestoneDependencies")
          .withIndex("by_depends_on", (q) =>
            q.eq("dependsOnMilestoneId", milestone._id)
          )
          .collect();

        const blocking = await Promise.all(
          blockingDependencies.map(async (dep) => {
            const blockingMilestone = await ctx.db.get(dep.milestoneId);
            return blockingMilestone;
          })
        );

        // Calculate progress based on associated issues and features
        const issues = await ctx.db
          .query("issues")
          .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const features = await ctx.db
          .query("feature")
          .withIndex("byMilestone", (q) => q.eq("milestoneId", milestone._id))
          .collect();

        const completedIssues = issues.filter(
          (issue) => issue.achieved === true
        );
        const completedFeatures = features.filter(
          (feature) => feature.achieved === true || feature.phase === "LIVE"
        );

        const totalItems = issues.length + features.length;
        const completedItems =
          completedIssues.length + completedFeatures.length;
        const progress =
          totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        // Calculate overdue items
        const now = Date.now();
        const overdueIssues = issues.filter(
          (issue) =>
            issue.dueDate &&
            new Date(issue.dueDate).getTime() < now &&
            !issue.achieved
        );
        const overdueFeatures = features.filter(
          (feature) =>
            feature.endDate &&
            new Date(feature.endDate).getTime() < now &&
            !feature.achieved &&
            feature.phase !== "LIVE"
        );

        // Get owner details
        const owner = milestone.ownerId
          ? await ctx.db.get(milestone.ownerId)
          : null;

        return {
          ...milestone,
          project,
          dependsOn: dependsOn.filter(Boolean),
          blocking: blocking.filter(Boolean),
          progress: Math.round(progress),
          issueCount: issues.length,
          featureCount: features.length,
          completedIssueCount: completedIssues.length,
          completedFeatureCount: completedFeatures.length,
          totalItems,
          completedItems,
          overdueIssueCount: overdueIssues.length,
          overdueFeatureCount: overdueFeatures.length,
          overdueItems: overdueIssues.length + overdueFeatures.length,
          owner,
        };
      })
    );

    return milestonesWithDetails;
  },
});

// Mutations
export const createMilestone = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    targetDate: v.optional(v.number()), // Legacy support
    ownerId: v.optional(v.id("user")),
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
      throw new Error("Unauthorized");
    }

    // Validate project exists and user has access
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const now = Date.now();

    // Handle date logic: if only targetDate provided (legacy), use it for endDate
    const startDate = args.startDate || args.targetDate || now;
    const endDate =
      args.endDate || args.targetDate || startDate + 7 * 24 * 60 * 60 * 1000; // Default 7 days from start

    const milestoneId = await ctx.db.insert("milestones", {
      name: args.name,
      description: args.description,
      projectId: args.projectId,
      organizationId: session.activeOrganizationId as Id<"organization">,
      startDate,
      endDate,
      targetDate: args.targetDate, // Keep for backward compatibility
      status: "not-started",
      ownerId: args.ownerId,
      createdAt: now,
      updatedAt: now,
      createdBy: session.userId as Id<"user">,
    });

    // Create activity log
    await ctx.db.insert("activities", {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Created milestone "${args.name}"`,
      activity: "milestone_created",
      entityType: "milestone",
      entityId: milestoneId,
      entityName: args.name,
      projectId: args.projectId,
      milestoneId,
      createdAt: now,
    });

    return milestoneId;
  },
});

export const updateMilestone = mutation({
  args: {
    milestoneId: v.id("milestones"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    targetDate: v.optional(v.number()), // Legacy support
    status: v.optional(
      v.union(
        v.literal("not-started"),
        v.literal("in-progress"),
        v.literal("at-risk"),
        v.literal("completed"),
        v.literal("delayed")
      )
    ),
    ownerId: v.optional(v.id("user")),
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
      throw new Error("Unauthorized");
    }

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) {
      throw new Error("Milestone not found");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.startDate !== undefined) updateData.startDate = args.startDate;
    if (args.endDate !== undefined) updateData.endDate = args.endDate;
    if (args.targetDate !== undefined) updateData.targetDate = args.targetDate; // Legacy support
    if (args.status !== undefined) updateData.status = args.status;
    if (args.ownerId !== undefined) updateData.ownerId = args.ownerId;

    await ctx.db.patch(args.milestoneId, updateData);

    // Create activity log
    await ctx.db.insert("activities", {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Updated milestone "${milestone.name}"`,
      activity: "milestone_updated",
      entityType: "milestone",
      entityId: args.milestoneId,
      entityName: milestone.name,
      projectId: milestone.projectId,
      milestoneId: args.milestoneId,
      createdAt: Date.now(),
    });

    return args.milestoneId;
  },
});

export const deleteMilestone = mutation({
  args: { milestoneId: v.id("milestones"), token: v.string() },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) {
      throw new Error("Milestone not found");
    }

    // Remove milestone from all issues
    const issues = await ctx.db
      .query("issues")
      .withIndex("byMilestone", (q) => q.eq("milestoneId", args.milestoneId))
      .collect();

    for (const issue of issues) {
      await ctx.db.patch(issue._id, { milestoneId: undefined });
    }

    // Delete all dependencies
    const dependencies = await ctx.db
      .query("milestoneDependencies")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", args.milestoneId))
      .collect();

    const blockingDependencies = await ctx.db
      .query("milestoneDependencies")
      .withIndex("by_depends_on", (q) =>
        q.eq("dependsOnMilestoneId", args.milestoneId)
      )
      .collect();

    for (const dep of [...dependencies, ...blockingDependencies]) {
      await ctx.db.delete(dep._id);
    }

    // Delete the milestone
    await ctx.db.delete(args.milestoneId);

    // Create activity log
    await ctx.db.insert("activities", {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Deleted milestone "${milestone.name}"`,
      activity: "deleted",
      entityType: "milestone",
      entityId: args.milestoneId,
      entityName: milestone.name,
      projectId: milestone.projectId,
      createdAt: Date.now(),
    });

    return args.milestoneId;
  },
});

export const addMilestoneDependency = mutation({
  args: {
    milestoneId: v.id("milestones"),
    dependsOnMilestoneId: v.id("milestones"),
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
      throw new Error("Unauthorized");
    }

    // Validate milestones exist
    const milestone = await ctx.db.get(args.milestoneId);
    const dependsOnMilestone = await ctx.db.get(args.dependsOnMilestoneId);

    if (!milestone || !dependsOnMilestone) {
      throw new Error("One or both milestones not found");
    }

    // Check for circular dependencies
    const wouldCreateCircularDependency = await checkCircularDependency(
      ctx,
      args.dependsOnMilestoneId,
      args.milestoneId
    );

    if (wouldCreateCircularDependency) {
      throw new Error("This dependency would create a circular dependency");
    }

    // Check if dependency already exists
    const existingDependency = await ctx.db
      .query("milestoneDependencies")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", args.milestoneId))
      .filter((q) =>
        q.eq(q.field("dependsOnMilestoneId"), args.dependsOnMilestoneId)
      )
      .first();

    if (existingDependency) {
      throw new Error("This dependency already exists");
    }

    const dependencyId = await ctx.db.insert("milestoneDependencies", {
      milestoneId: args.milestoneId,
      dependsOnMilestoneId: args.dependsOnMilestoneId,
      organizationId: session.activeOrganizationId as Id<"organization">,
      createdAt: Date.now(),
    });

    // Create activity log
    await ctx.db.insert("activities", {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Added dependency: "${milestone.name}" depends on "${dependsOnMilestone.name}"`,
      activity: "dependency_added",
      entityType: "milestone",
      entityId: args.milestoneId,
      entityName: milestone.name,
      projectId: milestone.projectId,
      milestoneId: args.milestoneId,
      createdAt: Date.now(),
    });

    return dependencyId;
  },
});

export const removeMilestoneDependency = mutation({
  args: {
    milestoneId: v.id("milestones"),
    dependsOnMilestoneId: v.id("milestones"),
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
      throw new Error("Unauthorized");
    }

    const dependency = await ctx.db
      .query("milestoneDependencies")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", args.milestoneId))
      .filter((q) =>
        q.eq(q.field("dependsOnMilestoneId"), args.dependsOnMilestoneId)
      )
      .first();

    if (!dependency) {
      throw new Error("Dependency not found");
    }

    await ctx.db.delete(dependency._id);

    const milestone = await ctx.db.get(args.milestoneId);
    const dependsOnMilestone = await ctx.db.get(args.dependsOnMilestoneId);

    // Create activity log
    await ctx.db.insert("activities", {
      organizationId: session.activeOrganizationId as Id<"organization">,
      userId: session.userId as Id<"user">,
      title: `Removed dependency: "${milestone?.name}" no longer depends on "${dependsOnMilestone?.name}"`,
      activity: "dependency_removed",
      entityType: "milestone",
      entityId: args.milestoneId,
      entityName: milestone?.name || "Unknown",
      projectId: milestone?.projectId,
      milestoneId: args.milestoneId,
      createdAt: Date.now(),
    });

    return dependency._id;
  },
});

// Helper function to check for circular dependencies
async function checkCircularDependency(
  ctx: any,
  startMilestoneId: Id<"milestones">,
  targetMilestoneId: Id<"milestones">,
  visited: Set<string> = new Set()
): Promise<boolean> {
  if (startMilestoneId === targetMilestoneId) {
    return true;
  }

  if (visited.has(startMilestoneId)) {
    return false;
  }

  visited.add(startMilestoneId);

  const dependencies = await ctx.db
    .query("milestoneDependencies")
    .withIndex("by_milestone", (q: any) =>
      q.eq("milestoneId", startMilestoneId)
    )
    .collect();

  for (const dependency of dependencies) {
    if (
      await checkCircularDependency(
        ctx,
        dependency.dependsOnMilestoneId,
        targetMilestoneId,
        visited
      )
    ) {
      return true;
    }
  }

  return false;
}
