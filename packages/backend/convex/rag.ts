// convex/example.ts
import { api, components, internal } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
// Any AI SDK model that supports embeddings will work.
import { google } from "@ai-sdk/google";
import { ConvexSession } from "./betterAuth";
import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";

const rag = new RAG(components.rag, {
  textEmbeddingModel: google.textEmbeddingModel("text-embedding-004"),
  embeddingDimension: 1536,
});

export const add = internalAction({
  args: { text: v.string(), token: v.string(), key: v.any() },
  handler: async (ctx, { text, token, key }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const namespace = await rag.getOrCreateNamespace(ctx, {
      namespace: `org-${session.activeOrganizationId}`,
    });

    await rag.add(ctx, {
      namespaceId: namespace.namespaceId,
      namespace: `org-${session.activeOrganizationId}`,
      text,
      key: key,
    });
  },
});

export const search = internalAction({
  args: {
    query: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    const { results, text, entries } = await rag.search(ctx, {
      namespace: `org-${session.activeOrganizationId}`,
      query: args.query,
      limit: 100,
      vectorScoreThreshold: 0.5,
    });

    return { results, text, entries };
  },
});
