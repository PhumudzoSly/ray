import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { redis } from "@/lib/redis";
import { createIdGenerator } from "ai";
import { getSession } from "@/actions/account/user";
import { Search } from "@upstash/search";
import { z } from "zod";
import { getIdeas, createIdea, getCurrentIdea } from "./tools/idea";
import {
  getIssues,
  createIssue,
  deleteIssue,
  getCurrentIssue,
  updateIssue,
} from "./tools/issue";
import {
  getProjects,
  createProject,
  getCurrentProject,
  updateProject,
  deleteProject,
} from "./tools/project";
import {
  getMilestones,
  createMilestone,
  getCurrentMilestone,
  updateMilestone,
  deleteMilestone,
} from "./tools/milestone";
import {
  getFeatures,
  createFeature,
  getCurrentFeature,
  updateFeature,
  deleteFeature,
} from "./tools/feature";
import {
  getRoadmaps,
  createRoadmap,
  getCurrentRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from "./tools/roadmap";
import {
  getRoadmapItems,
  createRoadmapItem,
  getCurrentRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
} from "./tools/roadmap-item";
import {
  getRoadmapChangelogs,
  createRoadmapChangelog,
  getCurrentRoadmapChangelog,
  updateRoadmapChangelog,
  deleteRoadmapChangelog,
} from "./tools/roadmap-changelog";
import {
  getWaitlists,
  createWaitlist,
  getCurrentWaitlist,
  updateWaitlist,
  deleteWaitlist,
} from "./tools/waitlist";
import { deepSearch, webSearch } from "@/lib/exa";
export const maxDuration = 30;

// Key helpers for consistent namespacing
const chatKey = (userId: string, orgId: string) =>
  `chat:history:user:${userId}:org:${orgId}`;
const userIndexKey = (userId: string) => `chat:index:user:${userId}`;
const orgIndexKey = (orgId: string) => `chat:index:org:${orgId}`;

const search = Search.fromEnv();

export async function POST(req: Request) {
  const body = await req.json();

  console.log("BODY", body);

  // get current message and chat id sent from client
  const {
    message,
    messages: bodyMessages,
    idea,
    project,
    issue,
  } = body as {
    message: UIMessage;
    messages?: UIMessage[];
    id: string;
    idea: string;
    project: string;
    issue: string;
  };

  console.log("Chat request received with context:", {
    idea: idea || "(empty)",
    project: project || "(empty)",
    issue: issue || "(empty)",
  });

  const { org, userId } = await getSession();
  const key = chatKey(userId, org);
  const searchClient = search.index(key);

  // // get existing chat history (fully type-safe)
  let history = await redis.get<UIMessage[]>(key);
  // // legacy fallback (pre-migration keys)
  if (!history) {
    history = await redis.get<UIMessage[]>(`chat:history:${userId}-${org}`);
  }

  // // Keep only the last 300 messages and add the new message
  const recentHistory = (history ?? []).slice(-300);
  console.log("RECENT HISTORY", recentHistory);

  // Build messages array: prioritize history, fallback to body messages, add new message if exists
  let messages: UIMessage[];
  if (recentHistory.length > 0) {
    // Use history and add new message if exists
    messages = message ? [...recentHistory, message] : recentHistory;
  } else if (bodyMessages && bodyMessages.length > 0) {
    // No history, use body messages and add new message if exists
    messages = message ? [...bodyMessages, message] : bodyMessages;
  } else if (message) {
    // No history, no body messages, but we have a new message
    messages = [message];
  } else {
    // No messages at all - create a default greeting message
    messages = [
      {
        id: "welcome-msg",
        role: "user",
        parts: [{ type: "text", text: "Hello, I need help with my project." }],
      },
    ];
  }

  console.log("MESSAGES", messages);

  const result = streamText({
    model: "google/gemini-2.5-flash-lite",
    messages: convertToModelMessages(messages),
    system: `Your name is Ray, you are an AI CoPilot within RayAI (https://rayai.dev) - a comprehensive project and product management platform. Based on the available tools and capabilities, you are designed to help users manage their entire product development lifecycle, from ideation to execution.

    ## 🚀 About Ray
    You are an intelligent assistant that helps with:
    - **Product Development**: Managing features, roadmaps, and product strategy
    - **Project Management**: Organizing tasks, milestones, and team coordination
    - **Idea Management**: Capturing and developing product concepts
    - **Waitlist Management**: Handling user queues and access control
    - **Knowledge Management**: Storing and retrieving important information

    ## 📋 Core Responsibilities

    ### 1. 🎯 Product & Project Management
    - Create and manage projects, features, and roadmaps
    - Track milestones and project progress
    - Maintain project documentation and changelogs
    - Suggest improvements based on industry best practices

    ### 2. ✅ Task & Issue Management
    - Create, update, and organize issues/tasks
    - Help with prioritization and categorization
    - Monitor progress and status updates
    - Suggest task dependencies and relationships

    ### 3. 🗺️ Strategic Planning
    - Help develop and maintain product roadmaps
    - Manage roadmap items and timeline updates
    - Track feature development progress
    - Assist with milestone planning

    ### 4. 💡 Idea & Innovation Management
    - Capture and organize product ideas
    - Help evaluate and develop concepts
    - Connect ideas to features and projects
    - Maintain an innovation pipeline

    ### 5. 🔍 Research & Enhancement
    - Use google_search for market research and best practices
    - Provide data-driven recommendations
    - Stay updated on industry trends
    - Store and retrieve relevant knowledge

    ## 🛠️ Available Tools & Usage
    | Category | Tools |
    |----------|-------|
    | **Product Tools** | createFeature, updateRoadmap, getMilestones, etc. |
    | **Project Tools** | createProject, updateProject, deleteProject, etc. |
    | **Task Tools** | createIssue, updateIssue, getIssues, etc. |
    | **Innovation Tools** | createIdea, getCurrentIdea, etc. |
    | **Knowledge Tools** | google_search, addResource, getResources |
    | **Waitlist Tools** | createWaitlist, updateWaitlist, etc. |

    ## 📊 Currently Selected Context
    - **Project ID**: ${project}
    - **Issue ID**: ${issue}
    - **Idea ID**: ${idea}
   
    ## 📝 Response Formatting Guidelines
    **IMPORTANT**: Always format your responses using rich markdown with:
    - 📝 **Emojis** for visual appeal and categorization
    - 🏷️ **Clear headings** (##, ###) to structure information
    - 📋 **Bullet points and numbered lists** for organization
    - 📊 **Tables** for data presentation when appropriate
    - 💡 **Code blocks** with syntax highlighting for technical content
    - 🎯 **Bold** and *italic* text for emphasis
    - 📌 **Callout boxes** using blockquotes for important information
    - 🔗 **Links** when referencing external resources
    - ✅ **Checkboxes** for task lists and action items
    - 📈 **Progress indicators** and status badges when relevant
    - **Spacing** (2-3 line breaks) for readability
    - **Consistency** in using emojis and markdown formatting
    - **Clarity** in language and structure


    Make your responses visually engaging, well-structured, and easy to scan. Use appropriate emojis that match the context and content type.

    ## 🎯 Operating Guidelines
    1. ✅ Always confirm understanding of user requests
    2. 🛠️ Use appropriate tools based on context and request type
    3. 📢 Provide clear feedback on actions taken
    4. 🚀 Proactively suggest related actions or next steps
    5. 🔍 Enhance responses with google_search when relevant
    6. 📚 Document important information using addResource
    7. 🔄 Maintain context across conversations
    8. 🎯 Focus on delivering actionable insights
    9. ❌ Avoid using google_search for general knowledge or questions
    10. ❓ If unsure, ask for clarification or suggest alternative approaches
    `,
    tools: {
      deepSearch,
      webSearch,
      // Idea tools
      getIdeas,
      createIdea,
      getCurrentIdea,
      // Issue tools
      getIssues,
      createIssue,
      deleteIssue,
      getCurrentIssue,
      updateIssue,
      // Project tools
      getProjects,
      createProject,
      getCurrentProject,
      updateProject,
      deleteProject,
      // Milestone tools
      getMilestones,
      createMilestone,
      getCurrentMilestone,
      updateMilestone,
      deleteMilestone,
      // Feature tools
      getFeatures,
      createFeature,
      getCurrentFeature,
      updateFeature,
      deleteFeature,
      // Roadmap tools
      getRoadmaps,
      createRoadmap,
      getCurrentRoadmap,
      updateRoadmap,
      deleteRoadmap,
      // Roadmap item tools
      getRoadmapItems,
      createRoadmapItem,
      getCurrentRoadmapItem,
      updateRoadmapItem,
      deleteRoadmapItem,
      // Roadmap changelog tools
      getRoadmapChangelogs,
      createRoadmapChangelog,
      getCurrentRoadmapChangelog,
      updateRoadmapChangelog,
      deleteRoadmapChangelog,
      // Waitlist tools
      getWaitlists,
      createWaitlist,
      getCurrentWaitlist,
      updateWaitlist,
      deleteWaitlist,
      addResource: tool({
        description: "Add knowledge and resource to memory",
        inputSchema: z.object({
          resource: z.string().describe("The resource to add"),
        }),
        execute: async ({ resource }: { resource: string }) => {
          await searchClient.upsert([
            {
              id: crypto.randomUUID(),
              content: { resource },
              metadata: {
                userId,
                orgId: org,
                chatKey: key,
                type: "resource",
                createdAt: new Date().toISOString(),
              },
            },
          ]);
          return "Resource added to memory";
        },
      }),
      getResources: tool({
        description: "Get resources from memory",
        inputSchema: z.object({
          query: z.string().describe("The query to search for"),
        }),
        execute: async ({ query }: { query: string }) => {
          const results = await searchClient.search({ query });
          return JSON.stringify(results);
        },
      }),
    },

    stopWhen: [stepCountIs(10)],
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    // generate consistent server-side IDs for persistence:
    generateMessageId: createIdGenerator({
      prefix: "msg",
      size: 16,
    }),
    onFinish: async ({ messages }) => {
      // save chat history to redis
      await redis.set(key, messages);
      // maintain secondary indexes for efficient cleanup
      await Promise.all([
        redis.sadd(userIndexKey(userId), key),
        redis.sadd(orgIndexKey(org), key),
      ]);
    },
  });
}

export async function DELETE(req: Request) {
  try {
    const { scope, targetUserId } = await req
      .json()
      .catch(
        () => ({}) as { scope?: "self" | "user" | "org"; targetUserId?: string }
      );
    const { org, userId, role } = await getSession();

    if (!org || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Default to self scope if not provided
    if (!scope || scope === "self") {
      const key = chatKey(userId, org);
      await Promise.all([
        redis.del(key),
        redis.srem(userIndexKey(userId), key),
        redis.srem(orgIndexKey(org), key),
        // Reset the Upstash Search index for this chat to remove stored resources
        search.index(key).reset(),
      ]);
      return new Response(null, { status: 204 });
    }

    // Admin-only cleanup flows
    if (scope === "user") {
      if (!(role === "admin" || role === "owner")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }
      if (!targetUserId) {
        return new Response(
          JSON.stringify({ error: "targetUserId is required" }),
          { status: 400 }
        );
      }
      const targetKey = chatKey(targetUserId, org);
      await Promise.all([
        redis.del(targetKey),
        redis.srem(userIndexKey(targetUserId), targetKey),
        redis.srem(orgIndexKey(org), targetKey),
        // Reset the Upstash Search index for the target user's chat
        search.index(targetKey).reset(),
      ]);
      return new Response(null, { status: 204 });
    }

    if (scope === "org") {
      if (!(role === "admin" || role === "owner")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }
      const keys = await redis.smembers<any>(orgIndexKey(org));
      if (!keys || keys.length === 0) {
        return new Response(null, { status: 204 });
      }

      // Remove keys and clean up user indexes
      await Promise.all([
        redis.del(...keys),
        ...keys.map((k: any) => {
          // k format: chat:history:user:${userId}:org:${org}
          const userIdFromKey = k.split(":")[3];
          return redis.srem(userIndexKey(userIdFromKey), k);
        }),
        // Reset all corresponding Upstash Search indexes for the org
        ...keys.map((k: any) => search.index(k).reset()),
        redis.del(orgIndexKey(org)),
      ]);
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ error: "Invalid scope" }), {
      status: 400,
    });
  } catch (error) {
    console.error("Error handling DELETE /api/chat:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
