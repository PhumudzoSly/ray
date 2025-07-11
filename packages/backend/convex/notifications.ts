import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { ConvexSession } from "./betterAuth";

// Create a notification
export const createNotification = mutation({
  args: {
    token: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    priority: v.string(),
    scope: v.string(),
    userId: v.optional(v.id("user")),
    organizationId: v.optional(v.id("organization")),
    projectId: v.optional(v.id("projects")),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    data: v.optional(v.any()),
    actionUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const notificationId = await ctx.db.insert("notifications", {
      type: args.type as any,
      title: args.title,
      message: args.message,
      priority: args.priority as any,
      scope: args.scope as any,
      userId: args.userId,
      organizationId: args.organizationId,
      projectId: args.projectId,
      relatedEntityId: args.relatedEntityId,
      relatedEntityType: args.relatedEntityType,
      data: args.data,
      actionUrl: args.actionUrl,
      isRead: false,
      createdBy: session.userId as Id<"user">,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });

    return notificationId;
  },
});

// Get user notifications with organization notifications
export const getUserNotifications = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean()),
  },
  handler: async (ctx, { token, limit = 50, includeRead = false }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    // Get user-specific notifications
    const userNotificationsQuery = ctx.db
      .query("notifications")
      .withIndex("byUser", (q: any) => q.eq("userId", userId));

    const userNotifications = await (includeRead
      ? userNotificationsQuery
      : userNotificationsQuery.filter((q: any) => q.eq(q.field("isRead"), false))
    )
      .order("desc")
      .take(Math.floor(limit / 2));

    // Get organization-wide notifications
    const orgNotificationsQuery = ctx.db
      .query("notifications")
      .withIndex("byOrganization", (q: any) => q.eq("organizationId", organizationId));

    const orgNotifications = await (includeRead
      ? orgNotificationsQuery
      : orgNotificationsQuery.filter((q: any) => q.eq(q.field("isRead"), false))
    )
      .order("desc")
      .take(Math.floor(limit / 2));

    // Combine and sort by creation time
    const allNotifications = [...userNotifications, ...orgNotifications]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return allNotifications;
  },
});

// Get notification count
export const getNotificationCount = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    // Count unread user notifications
    const userUnreadCount = await ctx.db
      .query("notifications")
      .withIndex("byUser", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("isRead"), false))
      .collect()
      .then((notifications) => notifications.length);

    // Count unread organization notifications
    const orgUnreadCount = await ctx.db
      .query("notifications")
      .withIndex("byOrganization", (q: any) => q.eq("organizationId", organizationId))
      .filter((q: any) => q.eq(q.field("isRead"), false))
      .collect()
      .then((notifications) => notifications.length);

    return {
      total: userUnreadCount + orgUnreadCount,
      user: userUnreadCount,
      organization: orgUnreadCount,
    };
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    token: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, { token, notificationId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Check if user has permission to mark this notification as read
    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    const hasPermission =
      notification.userId === userId ||
      notification.organizationId === organizationId;

    if (!hasPermission) {
      throw new Error("Unauthorized to mark this notification as read");
    }

    await ctx.db.patch(notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {
    token: v.string(),
    scope: v.optional(v.union(v.literal("user"), v.literal("organization"))),
  },
  handler: async (ctx, { token, scope }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    // Get unread notifications based on scope
    let notifications;
    if (scope === "user") {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("byUser", (q: any) => q.eq("userId", userId))
        .filter((q: any) => q.eq(q.field("isRead"), false))
        .collect();
    } else if (scope === "organization") {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("byOrganization", (q: any) => q.eq("organizationId", organizationId))
        .filter((q: any) => q.eq(q.field("isRead"), false))
        .collect();
    } else {
      // Mark all notifications as read
      const userNotifications = await ctx.db
        .query("notifications")
        .withIndex("byUser", (q: any) => q.eq("userId", userId))
        .filter((q: any) => q.eq(q.field("isRead"), false))
        .collect();

      const orgNotifications = await ctx.db
        .query("notifications")
        .withIndex("byOrganization", (q: any) => q.eq("organizationId", organizationId))
        .filter((q: any) => q.eq(q.field("isRead"), false))
        .collect();

      notifications = [...userNotifications, ...orgNotifications];
    }

    // Mark all as read
    const readAt = Date.now();
    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt,
        })
      )
    );

    return notifications.length;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    token: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, { token, notificationId }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Check permissions
    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    const hasPermission =
      notification.userId === userId ||
      notification.organizationId === organizationId ||
      notification.createdBy === userId;

    if (!hasPermission) {
      throw new Error("Unauthorized to delete this notification");
    }

    await ctx.db.delete(notificationId);
  },
});

// Clean up expired notifications (internal function)
export const cleanupExpiredNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredNotifications = await ctx.db
      .query("notifications")
      .withIndex("byExpiration")
      .filter((q: any) => q.lt(q.field("expiresAt"), now))
      .collect();

    await Promise.all(
      expiredNotifications.map((notification) =>
        ctx.db.delete(notification._id)
      )
    );

    return expiredNotifications.length;
  },
});

// Notification preferences
export const getNotificationPreferences = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("byUserOrg", (q: any) => q.eq("userId", userId).eq("organizationId", organizationId))
      .first();

    // Return default preferences if none exist
    if (!preferences) {
      return {
        emailEnabled: true,
        pushEnabled: true,
        issueNotifications: true,
        projectNotifications: true,
        commentNotifications: true,
        dueDateNotifications: true,
        dependencyNotifications: true,
        orgAnnouncementNotifications: true,
        digestFrequency: "IMMEDIATE" as const,
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
      };
    }

    return preferences;
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    token: v.string(),
    preferences: v.object({
      emailEnabled: v.optional(v.boolean()),
      pushEnabled: v.optional(v.boolean()),
      issueNotifications: v.optional(v.boolean()),
      projectNotifications: v.optional(v.boolean()),
      commentNotifications: v.optional(v.boolean()),
      dueDateNotifications: v.optional(v.boolean()),
      dependencyNotifications: v.optional(v.boolean()),
      orgAnnouncementNotifications: v.optional(v.boolean()),
      digestFrequency: v.optional(v.string()),
      quietHoursEnabled: v.optional(v.boolean()),
      quietHoursStart: v.optional(v.string()),
      quietHoursEnd: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { token, preferences }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.userId as Id<"user">;
    const organizationId = session.activeOrganizationId as Id<"organization">;

    const existingPreferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("byUserOrg", (q: any) => q.eq("userId", userId).eq("organizationId", organizationId))
      .first();

    if (existingPreferences) {
      await ctx.db.patch(existingPreferences._id, preferences as any);
    } else {
      await ctx.db.insert("notificationPreferences", {
        userId,
        organizationId,
        emailEnabled: preferences.emailEnabled ?? true,
        pushEnabled: preferences.pushEnabled ?? true,
        issueNotifications: preferences.issueNotifications ?? true,
        projectNotifications: preferences.projectNotifications ?? true,
        commentNotifications: preferences.commentNotifications ?? true,
        dueDateNotifications: preferences.dueDateNotifications ?? true,
        dependencyNotifications: preferences.dependencyNotifications ?? true,
        orgAnnouncementNotifications: preferences.orgAnnouncementNotifications ?? true,
        digestFrequency: (preferences.digestFrequency as any) ?? "IMMEDIATE",
        quietHoursEnabled: preferences.quietHoursEnabled ?? false,
        quietHoursStart: preferences.quietHoursStart ?? "22:00",
        quietHoursEnd: preferences.quietHoursEnd ?? "08:00",
      });
    }
  },
});