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
import { webSearch } from "@/lib/exa";
import { Search } from "@upstash/search";
import { z } from "zod";
import { getIdeas, createIdea } from "./tools/idea";
export const maxDuration = 30;

// Key helpers for consistent namespacing
const chatKey = (userId: string, orgId: string) =>
  `chat:history:user:${userId}:org:${orgId}`;
const userIndexKey = (userId: string) => `chat:index:user:${userId}`;
const orgIndexKey = (orgId: string) => `chat:index:org:${orgId}`;

const search = Search.fromEnv();

export async function POST(req: Request) {
  const body = await req.json();

  // get current message and chat id sent from client
  const { message, model, idea, project, issue, waitlist, roadmap } = body as {
    message: UIMessage;
    id: string;
  };

  const { org, userId } = await getSession();
  const key = chatKey(userId, org);
  const searchClient = search.index(key);

  // get existing chat history (fully type-safe)
  let history = await redis.get<UIMessage[]>(key);
  // legacy fallback (pre-migration keys)
  if (!history) {
    history = await redis.get<UIMessage[]>(`chat:history:${userId}-${org}`);
  }

  // Keep only the last 300 messages and add the new message
  const recentHistory = (history ?? []).slice(-300);
  const messages = [...recentHistory, message];

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    tools: {
      webSearch,
      getIdeas,
      createIdea,
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
    stopWhen: [stepCountIs(5)],
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
