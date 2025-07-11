import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

// Action: Search database for relevant information
export const searchDatabase = action({
  args: {
    query: v.string(),
    organizationId: v.id("organization"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const results: any[] = [];
    const queryLower = args.query.toLowerCase();

    try {
      // Analyze query to determine what to search for
      const searchProjects =
        queryLower.includes("project") ||
        queryLower.includes("projects") ||
        queryLower.includes("all") ||
        queryLower.includes("show") ||
        queryLower.includes("list") ||
        queryLower.includes("what") ||
        queryLower.includes("tell me about");

      const searchIdeas =
        queryLower.includes("idea") ||
        queryLower.includes("ideas") ||
        queryLower.includes("concept") ||
        queryLower.includes("brainstorm") ||
        searchProjects; // Also search ideas for general queries

      const searchIssues =
        queryLower.includes("issue") ||
        queryLower.includes("issues") ||
        queryLower.includes("bug") ||
        queryLower.includes("problem") ||
        queryLower.includes("error") ||
        searchProjects; // Also search issues for general queries

      const searchFeatures =
        queryLower.includes("feature") ||
        queryLower.includes("features") ||
        queryLower.includes("functionality") ||
        queryLower.includes("capability") ||
        searchProjects; // Also search features for general queries

      // Search projects if relevant
      if (searchProjects) {
        const projects = await ctx.runQuery(
          api.agent.searchProjects,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 2),
          }
        );
        console.log(
          `Found ${projects.length} projects for query: "${args.query}"`
        );
        results.push(...projects);
      }

      // Search ideas if relevant
      if (searchIdeas) {
        const ideas = await ctx.runQuery(
          api.agent.searchIdeas,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 2),
          }
        );
        console.log(`Found ${ideas.length} ideas for query: "${args.query}"`);
        results.push(...ideas);
      }

      // Search issues if relevant
      if (searchIssues) {
        const issues = await ctx.runQuery(
          api.agent.searchIssues,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 2),
          }
        );
        console.log(`Found ${issues.length} issues for query: "${args.query}"`);
        results.push(...issues);
      }

      // Search features if relevant
      if (searchFeatures) {
        const features = await ctx.runQuery(
          api.agent.searchFeatures,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 2),
          }
        );
        console.log(
          `Found ${features.length} features for query: "${args.query}"`
        );
        results.push(...features);
      }

      // If no specific type was detected, search everything
      if (!searchProjects && !searchIdeas && !searchIssues && !searchFeatures) {
        const projects = await ctx.runQuery(
          api.agent.searchProjects,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 4),
          }
        );
        results.push(...projects);

        const ideas = await ctx.runQuery(
          api.agent.searchIdeas,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 4),
          }
        );
        results.push(...ideas);

        const issues = await ctx.runQuery(
          api.agent.searchIssues,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 4),
          }
        );
        results.push(...issues);

        const features = await ctx.runQuery(
          api.agent.searchFeatures,
          {
            query: args.query,
            organizationId: args.organizationId,
            limit: Math.ceil(limit / 4),
          }
        );
        results.push(...features);
      }

      console.log(
        `Total search results: ${results.length} for query: "${args.query}"`
      );
      return results.slice(0, limit);
    } catch (error) {
      console.error("Database search error:", error);
      return [];
    }
  },
});
