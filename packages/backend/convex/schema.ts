import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { user, member, organization } from "../schemas/user";
import { apiKeys } from "../schemas/auth";
import {
  projects,
  activities,
  milestones,
  milestoneDependencies,
} from "../schemas/project";
import { waitlists, waitlistEntries } from "../schemas/waitlist";
import { flows, flowNodes, flowEdges } from "../schemas/flows";
import { chats, messages } from "../schemas/chat";
import {
  prds,
  implementationPrompts,
  analysisReports,
} from "../schemas/documents";
import {
  libraryDependencies,
  promptTemplates,
  generatedPrompts,
} from "../schemas/libraries";
import {
  issues,
  feature,
  issueDependency,
  featureDependency,
  featurePhaseHistory,
  issueLink,
  featureLink,
} from "../schemas/issues";
import {
  idea,
  adopterProfile,
  keyFinding,
  nextStep,
  validationResults,
  marketSizeValidation,
  competitorValidation,
  customerFitValidation,
  feasibilityValidation,
  financialValidation,
  userStoryValidation,
  competitor,
  competitorSwot,
} from "../schemas/ideas";
import {
  publicRoadmaps,
  roadmapItems,
  roadmapVotes,
  roadmapFeedback,
  roadmapChangelogs,
  featureRequests,
} from "../schemas/roadmap";
import {
  launchPlans,
  launchChecklistItems,
  launchCopy,
  launchStrategy,
  launchMetrics,
} from "../schemas/launch";
import { document } from "../schemas/document";
import {
  notifications,
  notificationPreferences,
  notificationTemplates,
} from "../schemas/notifications";
import { agentConversations, agentMessages } from "../schemas/agent";
import { assets } from "../schemas/assets";

// Files table for file uploads
const files = defineTable({
  storageId: v.id("_storage"),
  name: v.string(),
  size: v.number(),
  type: v.string(),
  uploadedAt: v.number(),
  uploadedBy: v.string(),
})
  .index("by_uploaded_by", ["uploadedBy"])
  .index("by_uploaded_at", ["uploadedAt"]);

export default defineSchema({
  user,
  member,
  organization,
  apiKeys,
  projects,
  milestones,
  milestoneDependencies,
  waitlists,
  waitlistEntries,
  flows,
  flowNodes,
  flowEdges,
  chats,
  messages,
  prds,
  implementationPrompts,
  analysisReports,
  libraryDependencies,
  promptTemplates,
  generatedPrompts,
  issues,
  feature,
  issueDependency,
  featureDependency,
  featurePhaseHistory,
  idea,
  adopterProfile,
  keyFinding,
  nextStep,
  validationResults,
  marketSizeValidation,
  competitorValidation,
  customerFitValidation,
  feasibilityValidation,
  financialValidation,
  userStoryValidation,
  competitor,
  competitorSwot,
  publicRoadmaps,
  roadmapItems,
  roadmapVotes,
  roadmapFeedback,
  roadmapChangelogs,
  featureRequests,
  launchPlans,
  launchChecklistItems,
  launchCopy,
  launchStrategy,
  launchMetrics,
  issueLink,
  featureLink,
  document,
  files,
  notifications,
  notificationPreferences,
  notificationTemplates,
  activities,
  assets,
  agentConversations,
  agentMessages,
});
