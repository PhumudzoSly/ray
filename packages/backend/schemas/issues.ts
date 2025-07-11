import { defineTable } from "convex/server";
import { v } from "convex/values";
import { importance, issueLabel, issueStatus, featurePhase } from "./enums";

export const issues = defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  organizationId: v.id("organization"),
  projectId: v.id("projects"),
  milestoneId: v.optional(v.id("milestones")),
  featureId: v.optional(v.id("feature")),
  parentIssueId: v.optional(v.id("issues")),
  status: issueStatus,
  priority: importance,
  label: issueLabel,
  dueDate: v.optional(v.string()),
  assignedTo: v.optional(v.id("user")),
  achieved: v.optional(v.boolean()),
  isPublic: v.optional(v.boolean()),
  // Source tracking
  sourceType: v.optional(v.union(v.literal("feedback"), v.literal("manual"))),
  sourceFeedbackId: v.optional(v.id("roadmapFeedback")),
})
  .index("byOrg", ["organizationId", "achieved"])
  .index("byOrgProject", ["projectId", "organizationId", "achieved"])
  .index("bySourceFeedback", ["sourceFeedbackId"])
  .index("byMilestone", ["milestoneId"])
  .index("byParentIssue", ["parentIssueId"]);

export const issueDependency = defineTable({
  parentId: v.id("issues"),
  dependentIssueId: v.id("issues"),
})
  .index("byParent", ["parentId"])
  .index("byDependent", ["dependentIssueId"]);

export const feature = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  organizationId: v.id("organization"),
  projectId: v.id("projects"),
  milestoneId: v.optional(v.id("milestones")),
  parentFeatureId: v.optional(v.id("feature")),
  priority: importance,
  phase: featurePhase,
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  estimatedEffort: v.optional(v.float64()),
  businessValue: v.optional(v.number()),
  assignedTo: v.optional(v.id("user")),
  achieved: v.optional(v.boolean()),
  isPublic: v.optional(v.boolean()),
  // Source tracking
  sourceType: v.optional(v.union(v.literal("feedback"), v.literal("manual"))),
  sourceFeedbackId: v.optional(v.id("roadmapFeedback")),
})
  .index("byProject", ["projectId"])
  .index("byOrg", ["organizationId", "achieved"])
  .index("byOrgProject", ["projectId", "organizationId", "achieved"])
  .index("byParentFeature", ["parentFeatureId"])
  .index("byMilestone", ["milestoneId"])
  .index("bySourceFeedback", ["sourceFeedbackId"]);

export const featurePhaseHistory = defineTable({
  from: featurePhase,
  to: featurePhase,
  userId: v.id("user"),
  featureId: v.id("feature"),
}).index("byFeature", ["featureId"]);

export const featureDependency = defineTable({
  parentId: v.id("feature"),
  dependentFeatureId: v.id("feature"),
})
  .index("byParent", ["parentId"])
  .index("byDependent", ["dependentFeatureId"]);

export const issueLink = defineTable({
  issueId: v.id("issues"),
  url: v.string(),
  metadata: v.optional(
    v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      siteName: v.optional(v.string()),
      favigo: v.optional(v.string()),
    })
  ),
}).index("byIssue", ["issueId"]);

export const featureLink = defineTable({
  featureId: v.id("feature"),
  url: v.string(),
  metadata: v.optional(
    v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      siteName: v.optional(v.string()),
      favigo: v.optional(v.string()),
    })
  ),
}).index("byFeature", ["featureId"]);
