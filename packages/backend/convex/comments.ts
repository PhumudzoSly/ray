import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexSession } from "./betterAuth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Pre-defined emoji reactions (Linear-style)
const ALLOWED_REACTIONS = [
  "👍",
  "👎",
  "❤️",
  "😄",
  "😮",
  "😢",
  "😡",
  "🎉",
  "🚀",
  "👀",
  "🔥",
  "💯",
  "✅",
  "❌",
  "⚠️",
  "💡",
];

// Helper function to get entity type from comment
function getEntityType(comment: any): string {
  if (comment.projectId) return "project";
  if (comment.issueId) return "issue";
  if (comment.featureId) return "feature";
  if (comment.assetId) return "asset";
  if (comment.milestoneId) return "milestone";
  throw new Error("Invalid comment: no entity reference found");
}

// Helper function to get entity ID from comment
function getEntityId(comment: any): string {
  return (
    comment.projectId ||
    comment.issueId ||
    comment.featureId ||
    comment.assetId ||
    comment.milestoneId
  );
}

// Create a new comment
export const createComment = mutation({
  args: {
    token: v.string(),
    content: v.string(),
    // Entity references - only one should be provided
    projectId: v.optional(v.id("projects")),
    issueId: v.optional(v.id("issues")),
    featureId: v.optional(v.id("feature")),
    assetId: v.optional(v.id("assets")),
    milestoneId: v.optional(v.id("milestones")),
    // For replies
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate that only one entity reference is provided
    const entityRefs = [
      args.projectId,
      args.issueId,
      args.featureId,
      args.assetId,
      args.milestoneId,
    ].filter(Boolean);
    if (entityRefs.length !== 1) {
      throw new Error("Exactly one entity reference must be provided");
    }

    // Get organization ID from the entity
    let organizationId: Id<"organization">;
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project) throw new Error("Project not found");
      organizationId = project.organizationId!;
    } else if (args.issueId) {
      const issue = await ctx.db.get(args.issueId);
      if (!issue) throw new Error("Issue not found");
      organizationId = issue.organizationId;
    } else if (args.featureId) {
      const feature = await ctx.db.get(args.featureId);
      if (!feature) throw new Error("Feature not found");
      organizationId = feature.organizationId;
    } else if (args.assetId) {
      const asset = await ctx.db.get(args.assetId);
      if (!asset) throw new Error("Asset not found");
      organizationId = asset.organizationId;
    } else if (args.milestoneId) {
      const milestone = await ctx.db.get(args.milestoneId);
      if (!milestone) throw new Error("Milestone not found");
      organizationId = milestone.organizationId;
    } else {
      throw new Error("No valid entity reference found");
    }

    // Handle nested replies (max 2 levels)
    let rootCommentId: Id<"comments"> | undefined;
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      // Check if this would exceed 2 levels
      if (parentComment.parentCommentId) {
        throw new Error("Cannot reply to a reply (max 2 levels allowed)");
      }

      rootCommentId = parentComment.rootCommentId || parentComment._id;
    }

    const now = Date.now();
    const commentId = await ctx.db.insert("comments", {
      content: args.content,
      projectId: args.projectId,
      issueId: args.issueId,
      featureId: args.featureId,
      assetId: args.assetId,
      milestoneId: args.milestoneId,
      organizationId,
      authorId: session.userId as Id<"user">,
      parentCommentId: args.parentCommentId,
      rootCommentId,
      isEdited: false,
      createdAt: now,
      updatedAt: now,
    });

    // Track activity
    const entityType = getEntityType({
      projectId: args.projectId,
      issueId: args.issueId,
      featureId: args.featureId,
      assetId: args.assetId,
      milestoneId: args.milestoneId,
    });

    await ctx.runMutation(internal.activities.trackActivity, {
      organizationId,
      userId: session.userId as Id<"user">,
      title: "added a comment",
      activity: "commented",
      entityType: entityType as any,
      entityId: getEntityId({
        projectId: args.projectId,
        issueId: args.issueId,
        featureId: args.featureId,
        assetId: args.assetId,
        milestoneId: args.milestoneId,
      }),
      entityName: "Comment",
      projectId: args.projectId,
      featureId: args.featureId,
      issueId: args.issueId,
      milestoneId: args.milestoneId,
    });

    return commentId;
  },
});

// Get comments for an entity
export const getComments = query({
  args: {
    token: v.string(),
    // Entity references - only one should be provided
    projectId: v.optional(v.id("projects")),
    issueId: v.optional(v.id("issues")),
    featureId: v.optional(v.id("feature")),
    assetId: v.optional(v.id("assets")),
    milestoneId: v.optional(v.id("milestones")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const limit = args.limit || 200;

    // Get comments based on entity type
    let comments;
    if (args.projectId) {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_entity", (q) => q.eq("projectId", args.projectId))
        .order("desc")
        .take(limit);
    } else if (args.issueId) {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_entity_issue", (q) => q.eq("issueId", args.issueId))
        .order("desc")
        .take(limit);
    } else if (args.featureId) {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_entity_feature", (q) =>
          q.eq("featureId", args.featureId)
        )
        .order("desc")
        .take(limit);
    } else if (args.assetId) {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_entity_asset", (q) => q.eq("assetId", args.assetId))
        .order("desc")
        .take(limit);
    } else if (args.milestoneId) {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_entity_milestone", (q) =>
          q.eq("milestoneId", args.milestoneId)
        )
        .order("desc")
        .take(limit);
    } else {
      throw new Error("No entity reference provided");
    }

    // Enrich comments with author data and reactions
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);

        // Get reactions for this comment
        const reactions = await ctx.db
          .query("commentReactions")
          .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
          .collect();

        // Group reactions by emoji
        const reactionGroups = reactions.reduce(
          (acc, reaction) => {
            if (!acc[reaction.emoji]) {
              acc[reaction.emoji] = [];
            }
            acc[reaction.emoji].push(reaction);
            return acc;
          },
          {} as Record<string, typeof reactions>
        );

        return {
          ...comment,
          author,
          reactions: reactionGroups,
          reactionCount: reactions.length,
        };
      })
    );

    return enrichedComments;
  },
});

// Update a comment
export const updateComment = mutation({
  args: {
    token: v.string(),
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is the author
    if (comment.authorId !== session.userId) {
      throw new Error("Only the author can edit this comment");
    }

    // Update the comment
    await ctx.db.patch(args.commentId, {
      content: args.content,
      isEdited: true,
      editedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.commentId;
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    token: v.string(),
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is the author or has admin rights
    if (comment.authorId !== session.userId) {
      // TODO: Add admin check here if needed
      throw new Error("Only the author can delete this comment");
    }

    // Delete all reactions for this comment
    const reactions = await ctx.db
      .query("commentReactions")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    return args.commentId;
  },
});

// Add a reaction to a comment
export const addReaction = mutation({
  args: {
    token: v.string(),
    commentId: v.id("comments"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate emoji
    if (!ALLOWED_REACTIONS.includes(args.emoji)) {
      throw new Error("Invalid emoji reaction");
    }

    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user already has this reaction
    const existingReaction = await ctx.db
      .query("commentReactions")
      .withIndex("unique_user_reaction", (q) =>
        q
          .eq("commentId", args.commentId)
          .eq("userId", session.userId as Id<"user">)
          .eq("emoji", args.emoji)
      )
      .first();

    if (existingReaction) {
      throw new Error("User already has this reaction");
    }

    // Add the reaction
    const reactionId = await ctx.db.insert("commentReactions", {
      commentId: args.commentId,
      userId: session.userId as Id<"user">,
      organizationId: comment.organizationId,
      emoji: args.emoji,
      createdAt: Date.now(),
    });

    return reactionId;
  },
});

// Remove a reaction from a comment
export const removeReaction = mutation({
  args: {
    token: v.string(),
    commentId: v.id("comments"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: args.token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Find the reaction
    const reaction = await ctx.db
      .query("commentReactions")
      .withIndex("unique_user_reaction", (q) =>
        q
          .eq("commentId", args.commentId)
          .eq("userId", session.userId as Id<"user">)
          .eq("emoji", args.emoji)
      )
      .first();

    if (!reaction) {
      throw new Error("Reaction not found");
    }

    // Remove the reaction
    await ctx.db.delete(reaction._id);

    return reaction._id;
  },
});

// Get available reactions
export const getAvailableReactions = query({
  args: {},
  handler: async () => {
    return ALLOWED_REACTIONS;
  },
});
