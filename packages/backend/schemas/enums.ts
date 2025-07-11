import { v } from "convex/values";

export const ideaStatus = v.union(
  v.literal("INVALIDATED"),
  v.literal("VALIDATED"),
  v.literal("FAILED"),
  v.literal("IN_PROGRESS"),
  v.literal("LAUNCHED")
);

export const importance = v.union(
  v.literal("CRITICAL"),
  v.literal("HIGH"),
  v.literal("MEDIUM"),
  v.literal("LOW")
);

export const category = v.union(
  v.literal("PRODUCT"),
  v.literal("MARKETING"),
  v.literal("FINANCIAL"),
  v.literal("LEGAL"),
  v.literal("OTHER")
);

export const financialResources = v.union(
  v.literal("LIMITED"),
  v.literal("ADEQUATE"),
  v.literal("ABUNDANT")
);

export const projectType = v.union(
  v.literal("WEB_APP_FRONTEND"),
  v.literal("WEB_APP_BACKEND"),
  v.literal("MOBILE_APP_IOS"),
  v.literal("MOBILE_APP_ANDROID"),
  v.literal("CROSS_PLATFORM_APP"),
  v.literal("FULLSTACK_APP"),
  v.literal("API"),
  v.literal("OTHER")
);

export const projectStatus = v.union(
  v.literal("PLANNING"),
  v.literal("IN_PROGRESS"),
  v.literal("ON_HOLD"),
  v.literal("COMPLETED"),
  v.literal("BACKLOG")
);

export const issueLabel = v.union(
  v.literal("UI"),
  v.literal("BUG"),
  v.literal("FEATURE"),
  v.literal("DOCUMENTATION"),
  v.literal("REFACTOR"),
  v.literal("PERFORMANCE"),
  v.literal("DESIGN"),
  v.literal("SECURITY"),
  v.literal("ACCESSIBILITY"),
  v.literal("TESTING"),
  v.literal("INTERNATIONALIZATION")
);

export const issueStatus = v.union(
  v.literal("BACKLOG"),
  v.literal("IN_PROGRESS"),
  v.literal("REVIEW"),
  v.literal("DONE"),
  v.literal("BLOCKED"),
  v.literal("CANCELLED")
);

export const reactionType = v.union(
  v.literal("THUMBS_UP"),
  v.literal("THUMBS_DOWN"),
  v.literal("HEART"),
  v.literal("ROCKET"),
  v.literal("EYES"),
  v.literal("CELEBRATE")
);

export const projectUpdateStatus = v.union(
  v.literal("ON_TRACK"),
  v.literal("AT_RISK"),
  v.literal("OFF_TRACK"),
  v.literal("BLOCKED"),
  v.literal("COMPLETED")
);

export const projectActivityType = v.union(
  v.literal("PROJECT"),
  v.literal("FEATURE"),
  v.literal("ISSUE"),
  v.literal("COMMENT")
);

export const projectRole = v.union(
  v.literal("OWNER"),
  v.literal("ADMIN"),
  v.literal("MANAGER"),
  v.literal("MEMBER"),
  v.literal("VIEWER")
);

export const activityTargetType = v.union(
  v.literal("PROJECT"),
  v.literal("FEATURE"),
  v.literal("ISSUE"),
  v.literal("COMMENT"),
  v.literal("USER")
);

export const activityAction = v.union(
  v.literal("CREATED"),
  v.literal("UPDATED"),
  v.literal("DELETED"),
  v.literal("ASSIGNED"),
  v.literal("UNASSIGNED"),
  v.literal("STARTED"),
  v.literal("COMPLETED"),
  v.literal("CANCELLED"),
  v.literal("COMMENTED"),
  v.literal("UPLOADED"),
  v.literal("DOWNLOADED"),
  v.literal("STATUS_CHANGED"),
  v.literal("PRIORITY_CHANGED")
);

export const featurePhase = v.union(
  v.literal("DISCOVERY"),
  v.literal("PLANNING"),
  v.literal("DEVELOPMENT"),
  v.literal("TESTING"),
  v.literal("RELEASE"),
  v.literal("LIVE"),
  v.literal("DEPRECATED")
);

export const notificationType = v.union(
  v.literal("ISSUE_ASSIGNED"),
  v.literal("ISSUE_UPDATED"),
  v.literal("ISSUE_COMPLETED"),
  v.literal("PROJECT_INVITED"),
  v.literal("PROJECT_UPDATED"),
  v.literal("FEATURE_ADDED"),
  v.literal("COMMENT_ADDED"),
  v.literal("DEPENDENCY_BLOCKED"),
  v.literal("DUE_DATE_APPROACHING"),
  v.literal("ROADMAP_UPDATED"),
  v.literal("LAUNCH_REMINDER"),
  v.literal("ORG_ANNOUNCEMENT"),
  v.literal("SYSTEM_UPDATE")
);

export const notificationPriority = v.union(
  v.literal("LOW"),
  v.literal("MEDIUM"),
  v.literal("HIGH"),
  v.literal("URGENT")
);

export const notificationScope = v.union(
  v.literal("USER"),
  v.literal("ORGANIZATION"),
  v.literal("PROJECT")
);
