import { defineTable } from "convex/server";
import { v } from "convex/values";

export const assets = defineTable({
  // Basic asset info
  name: v.string(),
  description: v.optional(v.string()),
  type: v.union(
    v.literal("image"),
    v.literal("document"),
    v.literal("video"),
    v.literal("link"),
    v.literal("code"),
    v.literal("design"),
    v.literal("other")
  ),

  // Project association
  projectId: v.id("projects"),
  organizationId: v.id("organization"),

  // File-specific fields (for uploaded files)
  storageId: v.optional(v.id("_storage")),
  fileName: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  mimeType: v.optional(v.string()),

  // Link-specific fields (for external resources)
  url: v.optional(v.string()),
  linkType: v.optional(
    v.union(
      v.literal("youtube"),
      v.literal("figma"),
      v.literal("notion"),
      v.literal("github"),
      v.literal("dribbble"),
      v.literal("behance"),
      v.literal("external")
    )
  ),

  // Metadata
  tags: v.optional(v.array(v.string())),
  category: v.optional(
    v.union(
      v.literal("branding"),
      v.literal("ui-design"),
      v.literal("mockups"),
      v.literal("documentation"),
      v.literal("inspiration"),
      v.literal("code-snippets"),
      v.literal("presentations"),
      v.literal("tutorials"),
      v.literal("other")
    )
  ),

  // Thumbnail/preview
  thumbnailUrl: v.optional(v.string()),

  // Access control
  isPublic: v.optional(v.boolean()),

  // Tracking
  uploadedBy: v.id("user"),
  uploadedAt: v.number(),
  updatedAt: v.number(),
  viewCount: v.optional(v.number()),
  downloadCount: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
  .index("by_organization", ["organizationId"])
  .index("by_type", ["type"])
  .index("by_category", ["category"])
  .index("by_uploaded_by", ["uploadedBy"])
  .index("by_uploaded_at", ["uploadedAt"])
  .index("by_project_and_type", ["projectId", "type"])
  .index("by_project_and_category", ["projectId", "category"]);
