import { defineTable } from "convex/server";
import { v } from "convex/values";
import { importance, issueStatus } from "./enums";

export const publicRoadmaps = defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  isPublic: v.boolean(),
  customDomain: v.optional(v.string()),
  theme: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  accentColor: v.optional(v.string()),
  allowVoting: v.boolean(),
  allowFeedback: v.boolean(),
  showChangelog: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_slug", ["slug"]);

export const roadmapItems = defineTable({
  roadmapId: v.id("publicRoadmaps"),
  issueId: v.optional(v.id("issues")),
  nodeId: v.optional(v.string()),
  title: v.string(),
  description: v.string(),
  status: issueStatus,
  category: v.string(),
  isPublic: v.boolean(),
  priority: importance,
  targetDate: v.optional(v.number()),
  order: v.number(),
  voteCount: v.number(),
  feedbackCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_issue", ["issueId"])
  .index("by_node", ["nodeId"])
  .index("by_roadmap_and_status", ["roadmapId", "status"])
  .index("by_roadmap_and_category", ["roadmapId", "category"]);

export const roadmapVotes = defineTable({
  roadmapItemId: v.id("roadmapItems"),
  userId: v.optional(v.string()),
  ipAddress: v.string(),
  createdAt: v.number(),
})
  .index("by_item", ["roadmapItemId"])
  .index("by_item_and_ip", ["roadmapItemId", "ipAddress"])
  .index("by_item_and_user", ["roadmapItemId", "userId"]);

export const roadmapFeedback = defineTable({
  roadmapItemId: v.id("roadmapItems"),
  userId: v.optional(v.string()),
  ipAddress: v.string(),
  content: v.string(),
  sentiment: v.union(
    v.literal("positive"),
    v.literal("neutral"),
    v.literal("negative")
  ),
  isApproved: v.boolean(),
  // Conversion tracking
  convertedToFeatureId: v.optional(v.id("feature")),
  convertedToIssueId: v.optional(v.id("issues")),
  convertedAt: v.optional(v.number()),
  convertedBy: v.optional(v.id("user")),
  conversionNotes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_item", ["roadmapItemId"])
  .index("by_item_and_ip", ["roadmapItemId", "ipAddress"])
  .index("by_item_and_user", ["roadmapItemId", "userId"])
  .index("by_converted_feature", ["convertedToFeatureId"])
  .index("by_converted_issue", ["convertedToIssueId"]);

export const roadmapChangelogs = defineTable({
  roadmapId: v.id("publicRoadmaps"),
  title: v.string(),
  description: v.string(),
  items: v.array(
    v.object({
      itemId: v.id("roadmapItems"),
      title: v.string(),
      description: v.string(),
      status: v.string(),
    })
  ),
  publishDate: v.number(),
  isPublished: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_publish_date", ["publishDate"]);

export const featureRequests = defineTable({
  roadmapId: v.id("publicRoadmaps"),
  title: v.string(),
  description: v.string(),
  category: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  ipAddress: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("under_review"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("implemented")
  ),
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("urgent")
  ),
  upvotes: v.number(),
  isPublic: v.boolean(),
  adminNotes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_email", ["email"])
  .index("by_status", ["status"])
  .index("by_roadmap_and_status", ["roadmapId", "status"]);
