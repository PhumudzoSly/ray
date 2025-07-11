import { defineTable } from "convex/server";
import { v } from "convex/values";

export const user = defineTable({
  name: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  image: v.optional(v.string()),
  role: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
  twoFactorEnabled: v.optional(v.boolean()),
});

export const member = defineTable({
  organizationId: v.id("organization"),
  role: v.string(),
  userId: v.id("user"),
}).index("byOrg", ["organizationId"]);

export const organization = defineTable({
  name: v.string(),
  slug: v.string(),
  logo: v.optional(v.string()),
});
