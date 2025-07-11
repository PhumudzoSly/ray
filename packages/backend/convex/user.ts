import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexSession } from "./betterAuth";
import { Id } from "./_generated/dataModel";

export const session = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    return session;
  },
});

export const orgMembers = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      {
        sessionToken: token,
      }
    );

    if (!session) {
      throw new Error("Unauthorized");
    }

    const members = await ctx.db
      .query("member")
      .withIndex("byOrg", (q) =>
        q.eq(
          "organizationId",
          session.activeOrganizationId as Id<"organization">
        )
      )
      .collect();

    const users = Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (user) return user;
      })
    );

    return users;
  },
});
