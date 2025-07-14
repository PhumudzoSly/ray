import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projects = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  platform: v.union(
    v.literal("web"),
    v.literal("mobile"),
    v.literal("both"),
    v.literal("api"),
    v.literal("plugin"),
    v.literal("desktop"),
    v.literal("cli")
  ),
  techStack: v.object({
    auth: v.string(),
    orm: v.string(),
    database: v.string(),
    ai: v.string(),
  }),
  infrastructure: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  status: v.optional(
    v.union(
      v.literal("planning"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("completed")
    )
  ),
  ideaId: v.optional(v.id("idea")), // Link to parent idea
  createdAt: v.number(),
  updatedAt: v.number(),
  organizationId: v.optional(v.id("organization")),
})
  .index("by_idea", ["ideaId"])
  .index("byOrg", ["organizationId"])
  .index("byOrgStatus", ["organizationId", "status"])
  .index("byOrgDueDate", ["organizationId", "dueDate"]);

export const milestones = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  projectId: v.id("projects"),
  organizationId: v.id("organization"),
  startDate: v.optional(v.number()), // Storing date as a timestamp
  endDate: v.optional(v.number()), // Storing date as a timestamp
  targetDate: v.optional(v.number()), // Legacy field, will be removed after migration
  status: v.union(
    v.literal("not-started"),
    v.literal("in-progress"),
    v.literal("at-risk"),
    v.literal("completed"),
    v.literal("delayed")
  ),
  ownerId: v.optional(v.id("user")),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("user"),
})
  .index("by_project", ["projectId"])
  .index("by_organization", ["organizationId"])
  .index("by_owner", ["ownerId"])
  .index("by_status", ["status"])
  .index("by_date_range", ["organizationId", "startDate", "endDate"]);

export const milestoneDependencies = defineTable({
  milestoneId: v.id("milestones"),
  dependsOnMilestoneId: v.id("milestones"),
  organizationId: v.id("organization"),
  createdAt: v.number(),
})
  .index("by_milestone", ["milestoneId"])
  .index("by_depends_on", ["dependsOnMilestoneId"])
  .index("by_organization", ["organizationId"]);

export const activities = defineTable({
  // Entity references
  projectId: v.optional(v.id("projects")),
  issueId: v.optional(v.id("issues")),
  featureId: v.optional(v.id("feature")),
  ideaId: v.optional(v.id("idea")),
  milestoneId: v.optional(v.id("milestones")),

  organizationId: v.id("organization"),

  // User who performed the action
  userId: v.id("user"),

  // Activity details
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
    v.literal("milestone_created"),
    v.literal("milestone_updated"),
    v.literal("milestone_completed"),
    v.literal("milestone_assigned"),
    v.literal("milestone_unassigned")
  ),

  // Entity link for navigation
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

  // Additional metadata
  metadata: v.optional(
    v.object({
      oldValue: v.optional(v.string()),
      newValue: v.optional(v.string()),
      field: v.optional(v.string()),
    })
  ),

  createdAt: v.number(),
})
  .index("by_project", ["projectId", "createdAt"])
  .index("by_issue", ["issueId", "createdAt"])
  .index("by_feature", ["featureId", "createdAt"])
  .index("by_idea", ["ideaId", "createdAt"])
  .index("by_milestone", ["milestoneId", "createdAt"])
  .index("by_user", ["userId", "createdAt"])
  .index("by_organization", ["organizationId", "createdAt"])
  .index("by_entity", ["entityType", "entityId", "createdAt"]);
