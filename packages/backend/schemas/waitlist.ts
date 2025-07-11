import { defineTable } from "convex/server";
import { v } from "convex/values";

export const waitlists = defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  isPublic: v.boolean(),
  allowNameCapture: v.boolean(),
  showPosition: v.boolean(),
  showSocialProof: v.boolean(),
  customMessage: v.optional(v.string()),
  organizationId: v.id("organization"),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("user"),
})
  .index("by_project", ["projectId"])
  .index("by_organization", ["organizationId"])
  .index("by_slug", ["slug"]);

export const waitlistEntries = defineTable({
  waitlistId: v.id("waitlists"),
  email: v.string(),
  name: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),     // Just signed up, needs verification
    v.literal("verified"),    // Email verified, on waitlist
    v.literal("invited"),     // Invited to join/access
    v.literal("joined"),      // Accepted invitation
    v.literal("bounced")      // Email bounced
  ),
  position: v.number(),
  referralCode: v.string(),
  referredBy: v.optional(v.string()), // referralCode of referrer
  referralCount: v.number(),
  verificationToken: v.optional(v.string()),
  verifiedAt: v.optional(v.number()),
  invitedAt: v.optional(v.number()),
  joinedAt: v.optional(v.number()),
  ipAddress: v.string(),
  userAgent: v.optional(v.string()),
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_waitlist", ["waitlistId"])
  .index("by_email", ["email"])
  .index("by_referral_code", ["referralCode"])
  .index("by_referred_by", ["referredBy"])
  .index("by_status", ["status"])
  .index("by_waitlist_and_status", ["waitlistId", "status"])
  .index("by_waitlist_and_position", ["waitlistId", "position"])
  .index("by_verification_token", ["verificationToken"]); 