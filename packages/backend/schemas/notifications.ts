import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  notificationType,
  notificationPriority,
  notificationScope,
} from "./enums";

export const notifications = defineTable({
  type: notificationType,
  title: v.string(),
  message: v.string(),
  priority: notificationPriority,
  scope: notificationScope,
  
  // Recipients
  userId: v.optional(v.id("user")), // For user-specific notifications
  organizationId: v.optional(v.id("organization")), // For org-wide notifications
  projectId: v.optional(v.id("projects")), // For project-specific notifications
  
  // Related entities
  relatedEntityId: v.optional(v.string()), // ID of related issue, feature, etc.
  relatedEntityType: v.optional(v.string()), // Type of related entity
  
  // Metadata
  data: v.optional(v.any()), // Additional structured data
  actionUrl: v.optional(v.string()), // URL to navigate when clicked
  
  // Tracking
  isRead: v.boolean(),
  readAt: v.optional(v.number()),
  
  // Audit
  createdBy: v.optional(v.id("user")),
  createdAt: v.number(),
  expiresAt: v.optional(v.number()), // For time-sensitive notifications
})
  .index("byUser", ["userId", "isRead", "createdAt"])
  .index("byOrganization", ["organizationId", "isRead", "createdAt"])
  .index("byProject", ["projectId", "isRead", "createdAt"])
  .index("byUserAndType", ["userId", "type", "createdAt"])
  .index("byExpiration", ["expiresAt"]);

export const notificationPreferences = defineTable({
  userId: v.id("user"),
  organizationId: v.id("organization"),
  
  // Notification type preferences
  emailEnabled: v.boolean(),
  pushEnabled: v.boolean(),
  
  // Type-specific preferences
  issueNotifications: v.boolean(),
  projectNotifications: v.boolean(),
  commentNotifications: v.boolean(),
  dueDateNotifications: v.boolean(),
  dependencyNotifications: v.boolean(),
  orgAnnouncementNotifications: v.boolean(),
  
  // Frequency settings
  digestFrequency: v.union(
    v.literal("IMMEDIATE"),
    v.literal("HOURLY"),
    v.literal("DAILY"),
    v.literal("WEEKLY"),
    v.literal("NEVER")
  ),
  
  // Quiet hours
  quietHoursStart: v.optional(v.string()), // HH:MM format
  quietHoursEnd: v.optional(v.string()), // HH:MM format
  quietHoursEnabled: v.boolean(),
})
  .index("byUser", ["userId"])
  .index("byUserOrg", ["userId", "organizationId"]);

export const notificationTemplates = defineTable({
  type: notificationType,
  organizationId: v.optional(v.id("organization")), // For org-specific templates
  
  // Template content
  titleTemplate: v.string(), // Supports placeholders like {{userName}}
  messageTemplate: v.string(),
  
  // Template metadata
  isActive: v.boolean(),
  isDefault: v.boolean(), // System default templates
  
  // Audit
  createdBy: v.optional(v.id("user")),
  updatedBy: v.optional(v.id("user")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("byType", ["type", "isActive"])
  .index("byOrganization", ["organizationId", "isActive"]);