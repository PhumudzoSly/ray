import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { ConvexSession } from "./betterAuth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Internal mutation to track activities - centralized for all entities
export const trackActivity = internalMutation({
  args: {
    organizationId: v.id("organization"),
    userId: v.id("user"),
    title: v.string(),
    description: v.optional(v.string()),
    activity: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("viewed"),
      v.literal("commented"),
      v.literal("phase_changed"),
      v.literal("assigned"),
      v.literal("unassigned"),
      v.literal("dependency_added"),
      v.literal("dependency_removed"),
      v.literal("link_added"),
      v.literal("link_removed"),
      v.literal("parent_changed"),
      v.literal("status_changed"),
      v.literal("milestone_assigned"),
      v.literal("milestone_unassigned")
    ),
    entityType: v.union(
      v.literal("project"),
      v.literal("feature"),
      v.literal("issue"),
      v.literal("idea"),
      v.literal("roadmap"),
      v.literal("milestone")
    ),
    entityId: v.string(),
    entityName: v.string(),
    projectId: v.optional(v.id("projects")),
    featureId: v.optional(v.id("feature")),
    issueId: v.optional(v.id("issues")),
    ideaId: v.optional(v.id("idea")),
    milestoneId: v.optional(v.id("milestones")),
    metadata: v.optional(
      v.object({
        oldValue: v.optional(v.string()),
        newValue: v.optional(v.string()),
        field: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    console.log("Creating activity:", {
      title: args.title,
      activity: args.activity,
      entityType: args.entityType,
      entityId: args.entityId,
      featureId: args.featureId,
      projectId: args.projectId,
      issueId: args.issueId,
      ideaId: args.ideaId,
    });

    const activityId = await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });

    console.log(`Activity created with ID: ${activityId}`);
    return activityId;
  },
});

// Generic query to get activities for any entity type
export const getActivitiesByEntity = query({
  args: {
    token: v.string(),
    entityType: v.union(
      v.literal("project"),
      v.literal("feature"),
      v.literal("issue"),
      v.literal("idea"),
      v.literal("roadmap"),
      v.literal("milestone")
    ),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { token, entityType, entityId, limit = 50 }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    let activities;

    // Use the appropriate index based on entity type
    switch (entityType) {
      case "feature":
        activities = await ctx.db
          .query("activities")
          .withIndex("by_feature", (q) =>
            q.eq("featureId", entityId as Id<"feature">)
          )
          .order("desc")
          .take(limit);
        break;
      case "project":
        activities = await ctx.db
          .query("activities")
          .withIndex("by_project", (q) =>
            q.eq("projectId", entityId as Id<"projects">)
          )
          .order("desc")
          .take(limit);
        break;
      case "issue":
        activities = await ctx.db
          .query("activities")
          .withIndex("by_issue", (q) =>
            q.eq("issueId", entityId as Id<"issues">)
          )
          .order("desc")
          .take(limit);
        break;
      case "idea":
        activities = await ctx.db
          .query("activities")
          .withIndex("by_idea", (q) => q.eq("ideaId", entityId as Id<"idea">))
          .order("desc")
          .take(limit);
        break;
      case "roadmap":
        // For roadmap, we might need to filter by entityType and entityId
        activities = await ctx.db
          .query("activities")
          .filter((q) =>
            q.and(
              q.eq(q.field("entityType"), "roadmap"),
              q.eq(q.field("entityId"), entityId)
            )
          )
          .order("desc")
          .take(limit);
        break;
      case "milestone":
        // For milestone, use the by_milestone index
        activities = await ctx.db
          .query("activities")
          .withIndex("by_milestone", (q) =>
            q.eq("milestoneId", entityId as Id<"milestones">)
          )
          .order("desc")
          .take(limit);
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Enrich activities with user data
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user,
        };
      })
    );

    return enrichedActivities;
  },
});
