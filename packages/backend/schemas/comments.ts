import { defineTable } from "convex/server";
import { v } from "convex/values";

export const comments = defineTable({
  // Content
  content: v.string(),

  // Entity references - only one should be set
  projectId: v.optional(v.id("projects")),
  issueId: v.optional(v.id("issues")),
  featureId: v.optional(v.id("feature")),
  assetId: v.optional(v.id("assets")),
  milestoneId: v.optional(v.id("milestones")),

  // Organization and user
  organizationId: v.id("organization"),
  authorId: v.id("user"),

  // Nested replies support (max 2 levels)
  parentCommentId: v.optional(v.id("comments")), // For replies
  rootCommentId: v.optional(v.id("comments")), // For tracking top-level comment

  // Metadata
  isEdited: v.optional(v.boolean()),
  editedAt: v.optional(v.number()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_entity", ["projectId", "createdAt"])
  .index("by_entity_issue", ["issueId", "createdAt"])
  .index("by_entity_feature", ["featureId", "createdAt"])
  .index("by_entity_asset", ["assetId", "createdAt"])
  .index("by_entity_milestone", ["milestoneId", "createdAt"])
  .index("by_organization", ["organizationId", "createdAt"])
  .index("by_author", ["authorId", "createdAt"])
  .index("by_parent", ["parentCommentId", "createdAt"])
  .index("by_root", ["rootCommentId", "createdAt"]);

export const commentReactions = defineTable({
  // References
  commentId: v.id("comments"),
  userId: v.id("user"),
  organizationId: v.id("organization"),
  emoji: v.string(), // Unicode emoji character

  // Timestamps
  createdAt: v.number(),
})
  .index("by_comment", ["commentId", "createdAt"])
  .index("by_user", ["userId", "createdAt"])
  .index("by_organization", ["organizationId", "createdAt"])
  .index("unique_user_reaction", ["commentId", "userId", "emoji"]);
