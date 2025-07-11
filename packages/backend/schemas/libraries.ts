import { defineTable } from "convex/server";
import { v } from "convex/values";

export const libraryDependencies = defineTable({
  projectId: v.id("projects"),
  nodeId: v.optional(v.string()), // If null, it's a project-level dependency
  name: v.string(),
  version: v.optional(v.string()),
  category: v.union(
    v.literal("ui"),
    v.literal("state"),
    v.literal("auth"),
    v.literal("database"),
    v.literal("api"),
    v.literal("testing"),
    v.literal("styling"),
    v.literal("validation"),
    v.literal("utils"),
    v.literal("ai"),
    v.literal("other")
  ),
  installCommand: v.string(),
  description: v.optional(v.string()),
  documentationUrl: v.optional(v.string()),
  configRequired: v.optional(v.boolean()),
  configNotes: v.optional(v.string()),
  isRecommended: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_node", ["nodeId"])
  .index("by_category", ["category"])
  .index("by_project_and_node", ["projectId", "nodeId"]);

export const promptTemplates = defineTable({
  name: v.string(),
  description: v.string(),
  category: v.union(
    v.literal("implementation"),
    v.literal("testing"),
    v.literal("documentation"),
    v.literal("debugging"),
    v.literal("optimization"),
    v.literal("deployment")
  ),
  targetTool: v.union(
    v.literal("cursor"),
    v.literal("bolt"),
    v.literal("v0"),
    v.literal("claude"),
    v.literal("chatgpt"),
    v.literal("copilot"),
    v.literal("universal")
  ),
  template: v.string(), // Template with variables like {{projectName}}, {{techStack}}, etc.
  variables: v.array(v.string()), // List of variables used in the template
  isDefault: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_category", ["category"])
  .index("by_tool", ["targetTool"]);

export const generatedPrompts = defineTable({
  projectId: v.id("projects"),
  nodeId: v.optional(v.string()),
  templateId: v.id("promptTemplates"),
  title: v.string(),
  content: v.string(),
  targetTool: v.string(),
  variables: v.object({}), // Key-value pairs of variables used
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_node", ["nodeId"])
  .index("by_template", ["templateId"]);