import { defineTable } from "convex/server";
import { v } from "convex/values";

export const prds = defineTable({
  projectId: v.id("projects"),
  nodeId: v.string(),
  title: v.string(),
  content: v.string(), // Markdown content
  version: v.number(),
  status: v.union(v.literal("draft"), v.literal("approved"), v.literal("archived")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_node", ["nodeId"])
  .index("by_project_and_node", ["projectId", "nodeId"]);

export const implementationPrompts = defineTable({
  projectId: v.id("projects"),
  nodeId: v.string(),
  prdId: v.id("prds"),
  title: v.string(),
  content: v.string(), // Markdown content
  techStack: v.object({
    auth: v.string(),
    orm: v.string(),
    database: v.string(),
    ai: v.string(),
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_node", ["nodeId"])
  .index("by_prd", ["prdId"]);

export const analysisReports = defineTable({
  projectId: v.id("projects"),
  type: v.union(v.literal("flow_analysis"), v.literal("missing_flows"), v.literal("recommendations")),
  title: v.string(),
  content: v.string(), // Markdown content
  metadata: v.optional(v.object({
    missingFlowsCount: v.optional(v.number()),
    recommendationsCount: v.optional(v.number()),
    analysisScore: v.optional(v.number()),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_type", ["type"])
  .index("by_project_and_type", ["projectId", "type"]);