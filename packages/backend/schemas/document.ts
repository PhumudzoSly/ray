import { defineTable } from "convex/server";
import { v } from "convex/values";

export const document = defineTable({
  content: v.optional(v.any()),
  type: v.optional(v.string()),
  docId: v.string(),
}).index("byDocId", ["docId"]);
