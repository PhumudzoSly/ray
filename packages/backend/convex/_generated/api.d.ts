/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as agent from "../agent.js";
import type * as agentTools_aiTools from "../agentTools/aiTools.js";
import type * as agentTools_conversationTools from "../agentTools/conversationTools.js";
import type * as agentTools_databaseTools from "../agentTools/databaseTools.js";
import type * as agentTools_index from "../agentTools/index.js";
import type * as agentTools_searchTools from "../agentTools/searchTools.js";
import type * as analysisReports from "../analysisReports.js";
import type * as apiKeys from "../apiKeys.js";
import type * as assets from "../assets.js";
import type * as betterAuth from "../betterAuth.js";
import type * as chats from "../chats.js";
import type * as comments from "../comments.js";
import type * as dashboard from "../dashboard.js";
import type * as doc from "../doc.js";
import type * as files from "../files.js";
import type * as flows from "../flows.js";
import type * as generatedPrompts from "../generatedPrompts.js";
import type * as idea from "../idea.js";
import type * as implementationPrompts from "../implementationPrompts.js";
import type * as issue_dependency from "../issue/dependency.js";
import type * as issue_feature from "../issue/feature.js";
import type * as issue_index from "../issue/index.js";
import type * as issue_quickAction from "../issue/quickAction.js";
import type * as launch_checklist from "../launch/checklist.js";
import type * as launch_copy from "../launch/copy.js";
import type * as launch_generator from "../launch/generator.js";
import type * as launch_index from "../launch/index.js";
import type * as launch_strategy from "../launch/strategy.js";
import type * as milestoneAnalytics from "../milestoneAnalytics.js";
import type * as milestones from "../milestones.js";
import type * as notifications from "../notifications.js";
import type * as prds from "../prds.js";
import type * as projects from "../projects.js";
import type * as roadmap_changelog from "../roadmap/changelog.js";
import type * as roadmap_featureRequests from "../roadmap/featureRequests.js";
import type * as roadmap_feedback from "../roadmap/feedback.js";
import type * as roadmap_items from "../roadmap/items.js";
import type * as roadmap from "../roadmap.js";
import type * as user from "../user.js";
import type * as validation_additionalValidations from "../validation/additionalValidations.js";
import type * as validation_competitorAnalysis from "../validation/competitorAnalysis.js";
import type * as validation_customerFit from "../validation/customerFit.js";
import type * as validation_feasibility from "../validation/feasibility.js";
import type * as validation_financials from "../validation/financials.js";
import type * as validation_marketSize from "../validation/marketSize.js";
import type * as validation_orchestrator from "../validation/orchestrator.js";
import type * as waitlists from "../waitlists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  agent: typeof agent;
  "agentTools/aiTools": typeof agentTools_aiTools;
  "agentTools/conversationTools": typeof agentTools_conversationTools;
  "agentTools/databaseTools": typeof agentTools_databaseTools;
  "agentTools/index": typeof agentTools_index;
  "agentTools/searchTools": typeof agentTools_searchTools;
  analysisReports: typeof analysisReports;
  apiKeys: typeof apiKeys;
  assets: typeof assets;
  betterAuth: typeof betterAuth;
  chats: typeof chats;
  comments: typeof comments;
  dashboard: typeof dashboard;
  doc: typeof doc;
  files: typeof files;
  flows: typeof flows;
  generatedPrompts: typeof generatedPrompts;
  idea: typeof idea;
  implementationPrompts: typeof implementationPrompts;
  "issue/dependency": typeof issue_dependency;
  "issue/feature": typeof issue_feature;
  "issue/index": typeof issue_index;
  "issue/quickAction": typeof issue_quickAction;
  "launch/checklist": typeof launch_checklist;
  "launch/copy": typeof launch_copy;
  "launch/generator": typeof launch_generator;
  "launch/index": typeof launch_index;
  "launch/strategy": typeof launch_strategy;
  milestoneAnalytics: typeof milestoneAnalytics;
  milestones: typeof milestones;
  notifications: typeof notifications;
  prds: typeof prds;
  projects: typeof projects;
  "roadmap/changelog": typeof roadmap_changelog;
  "roadmap/featureRequests": typeof roadmap_featureRequests;
  "roadmap/feedback": typeof roadmap_feedback;
  "roadmap/items": typeof roadmap_items;
  roadmap: typeof roadmap;
  user: typeof user;
  "validation/additionalValidations": typeof validation_additionalValidations;
  "validation/competitorAnalysis": typeof validation_competitorAnalysis;
  "validation/customerFit": typeof validation_customerFit;
  "validation/feasibility": typeof validation_feasibility;
  "validation/financials": typeof validation_financials;
  "validation/marketSize": typeof validation_marketSize;
  "validation/orchestrator": typeof validation_orchestrator;
  waitlists: typeof waitlists;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  prosemirrorSync: {
    lib: {
      deleteDocument: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        null
      >;
      deleteSnapshots: FunctionReference<
        "mutation",
        "internal",
        { afterVersion?: number; beforeVersion?: number; id: string },
        null
      >;
      deleteSteps: FunctionReference<
        "mutation",
        "internal",
        {
          afterVersion?: number;
          beforeTs: number;
          deleteNewerThanLatestSnapshot?: boolean;
          id: string;
        },
        null
      >;
      getSnapshot: FunctionReference<
        "query",
        "internal",
        { id: string; version?: number },
        { content: null } | { content: string; version: number }
      >;
      getSteps: FunctionReference<
        "query",
        "internal",
        { id: string; version: number },
        {
          clientIds: Array<string | number>;
          steps: Array<string>;
          version: number;
        }
      >;
      latestVersion: FunctionReference<
        "query",
        "internal",
        { id: string },
        null | number
      >;
      submitSnapshot: FunctionReference<
        "mutation",
        "internal",
        {
          content: string;
          id: string;
          pruneSnapshots?: boolean;
          version: number;
        },
        null
      >;
      submitSteps: FunctionReference<
        "mutation",
        "internal",
        {
          clientId: string | number;
          id: string;
          steps: Array<string>;
          version: number;
        },
        | {
            clientIds: Array<string | number>;
            status: "needs-rebase";
            steps: Array<string>;
          }
        | { status: "synced" }
      >;
    };
  };
};
