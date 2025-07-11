import { defineTable } from "convex/server";
import { v } from "convex/values";

// Main launch plan table
export const launchPlans = defineTable({
  projectId: v.id("projects"),
  status: v.union(
    v.literal("draft"),
    v.literal("in-progress"), 
    v.literal("ready"),
    v.literal("launched")
  ),
  targetLaunchDate: v.optional(v.string()),
  actualLaunchDate: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_project", ["projectId"]);

// Checklist items for launch preparation
export const launchChecklistItems = defineTable({
  launchPlanId: v.id("launchPlans"),
  category: v.union(
    v.literal("technical"),
    v.literal("content"),
    v.literal("legal"),
    v.literal("marketing"),
    v.literal("analytics"),
    v.literal("support")
  ),
  title: v.string(),
  description: v.string(),
  priority: v.union(
    v.literal("high"),
    v.literal("medium"), 
    v.literal("low")
  ),
  status: v.union(
    v.literal("pending"),
    v.literal("in-progress"),
    v.literal("completed"),
    v.literal("skipped")
  ),
  isRequired: v.boolean(),
  dependsOn: v.optional(v.array(v.id("launchChecklistItems"))),
  assignedTo: v.optional(v.id("user")),
  dueDate: v.optional(v.string()),
  notes: v.optional(v.string()),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_launch_plan", ["launchPlanId"])
.index("by_category", ["launchPlanId", "category"])
.index("by_status", ["launchPlanId", "status"]);

// Launch copy for different platforms
export const launchCopy = defineTable({
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
  title: v.string(),
  tagline: v.optional(v.string()),
  description: v.string(),
  callToAction: v.optional(v.string()),
  hashtags: v.optional(v.array(v.string())),
  mentions: v.optional(v.array(v.string())),
  media: v.optional(v.array(v.object({
    type: v.union(v.literal("image"), v.literal("video"), v.literal("gif")),
    url: v.string(),
    alt: v.optional(v.string())
  }))),
  isApproved: v.boolean(),
  version: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_launch_plan", ["launchPlanId"])
.index("by_platform", ["launchPlanId", "platform"]);

// Launch strategy and timeline
export const launchStrategy = defineTable({
  launchPlanId: v.id("launchPlans"),
  phase: v.union(
    v.literal("pre-launch"),
    v.literal("soft-launch"),
    v.literal("public-launch"),
    v.literal("post-launch")
  ),
  name: v.string(),
  description: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  platforms: v.array(v.string()),
  targetAudience: v.array(v.string()),
  keyMetrics: v.array(v.object({
    name: v.string(),
    target: v.string(),
    current: v.optional(v.number())
  })),
  tasks: v.array(v.object({
    title: v.string(),
    description: v.string(),
    assignedTo: v.optional(v.id("user")),
    dueDate: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"), 
      v.literal("completed")
    )
  })),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_launch_plan", ["launchPlanId"])
.index("by_phase", ["launchPlanId", "phase"]);

// Launch metrics tracking
export const launchMetrics = defineTable({
  launchPlanId: v.id("launchPlans"),
  platform: v.string(),
  metricType: v.union(
    v.literal("views"),
    v.literal("clicks"),
    v.literal("signups"),
    v.literal("conversions"),
    v.literal("revenue"),
    v.literal("shares"),
    v.literal("comments"),
    v.literal("votes")
  ),
  value: v.number(),
  date: v.string(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_launch_plan", ["launchPlanId"])
.index("by_platform", ["launchPlanId", "platform"])
.index("by_metric_type", ["launchPlanId", "metricType"]);