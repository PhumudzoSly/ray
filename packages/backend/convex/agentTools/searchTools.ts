import { v } from "convex/values";
import { query } from "../_generated/server";

// Query: Search projects
export const searchProjects = query({
  args: {
    query: v.string(),
    organizationId: v.id("organization"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const queryLower = args.query.toLowerCase();
    const queryWords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const relevantProjects = projects
      .map((project) => {
        const nameLower = project.name.toLowerCase();
        const descLower = (project.description || "").toLowerCase();
        const statusLower = (project.status || "").toLowerCase();

        // Calculate relevance score
        let score = 0;

        // Exact matches get highest score
        if (nameLower.includes(queryLower)) score += 10;
        if (descLower.includes(queryLower)) score += 8;

        // Word-based matching
        queryWords.forEach((word) => {
          if (nameLower.includes(word)) score += 5;
          if (descLower.includes(word)) score += 3;
          if (statusLower.includes(word)) score += 2;
        });

        // Special handling for common queries
        if (queryLower.includes("project") || queryLower.includes("projects"))
          score += 3;
        if (
          queryLower.includes("all") ||
          queryLower.includes("show") ||
          queryLower.includes("list")
        )
          score += 2;

        return { project, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit)
      .map((item) => item.project);

    return relevantProjects.map((project) => ({
      type: "project",
      id: project._id,
      title: project.name,
      content: project.description || "",
      metadata: { status: project.status },
    }));
  },
});

// Query: Search ideas
export const searchIdeas = query({
  args: {
    query: v.string(),
    organizationId: v.id("organization"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("idea")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const queryLower = args.query.toLowerCase();
    const queryWords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const relevantIdeas = ideas
      .map((idea) => {
        const nameLower = idea.name.toLowerCase();
        const descLower = idea.description.toLowerCase();
        const statusLower = idea.status.toLowerCase();
        const industryLower = idea.industry.toLowerCase();

        // Calculate relevance score
        let score = 0;

        // Exact matches get highest score
        if (nameLower.includes(queryLower)) score += 10;
        if (descLower.includes(queryLower)) score += 8;

        // Word-based matching
        queryWords.forEach((word) => {
          if (nameLower.includes(word)) score += 5;
          if (descLower.includes(word)) score += 3;
          if (statusLower.includes(word)) score += 2;
          if (industryLower.includes(word)) score += 2;
        });

        // Special handling for common queries
        if (queryLower.includes("idea") || queryLower.includes("ideas"))
          score += 3;
        if (
          queryLower.includes("all") ||
          queryLower.includes("show") ||
          queryLower.includes("list")
        )
          score += 2;

        return { idea, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit)
      .map((item) => item.idea);

    return relevantIdeas.map((idea) => ({
      type: "idea",
      id: idea._id,
      title: idea.name,
      content: idea.description || "",
      metadata: { status: idea.status },
    }));
  },
});

// Query: Search issues
export const searchIssues = query({
  args: {
    query: v.string(),
    organizationId: v.id("organization"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const queryLower = args.query.toLowerCase();
    const queryWords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const relevantIssues = issues
      .map((issue) => {
        const titleLower = issue.title.toLowerCase();
        const descLower = (issue.description || "").toLowerCase();
        const statusLower = issue.status.toLowerCase();
        const priorityLower = issue.priority.toLowerCase();

        // Calculate relevance score
        let score = 0;

        // Exact matches get highest score
        if (titleLower.includes(queryLower)) score += 10;
        if (descLower.includes(queryLower)) score += 8;

        // Word-based matching
        queryWords.forEach((word) => {
          if (titleLower.includes(word)) score += 5;
          if (descLower.includes(word)) score += 3;
          if (statusLower.includes(word)) score += 2;
          if (priorityLower.includes(word)) score += 2;
        });

        // Special handling for common queries
        if (
          queryLower.includes("issue") ||
          queryLower.includes("issues") ||
          queryLower.includes("bug") ||
          queryLower.includes("problem")
        )
          score += 3;
        if (
          queryLower.includes("all") ||
          queryLower.includes("show") ||
          queryLower.includes("list")
        )
          score += 2;

        return { issue, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit)
      .map((item) => item.issue);

    return relevantIssues.map((issue) => ({
      type: "issue",
      id: issue._id,
      title: issue.title,
      content: issue.description || "",
      metadata: { status: issue.status, priority: issue.priority },
    }));
  },
});

// Query: Search features
export const searchFeatures = query({
  args: {
    query: v.string(),
    organizationId: v.id("organization"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const features = await ctx.db
      .query("feature")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const queryLower = args.query.toLowerCase();
    const queryWords = queryLower
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const relevantFeatures = features
      .map((feature) => {
        const nameLower = feature.name.toLowerCase();
        const descLower = (feature.description || "").toLowerCase();
        const phaseLower = feature.phase.toLowerCase();
        const priorityLower = feature.priority.toLowerCase();

        // Calculate relevance score
        let score = 0;

        // Exact matches get highest score
        if (nameLower.includes(queryLower)) score += 10;
        if (descLower.includes(queryLower)) score += 8;

        // Word-based matching
        queryWords.forEach((word) => {
          if (nameLower.includes(word)) score += 5;
          if (descLower.includes(word)) score += 3;
          if (phaseLower.includes(word)) score += 2;
          if (priorityLower.includes(word)) score += 2;
        });

        // Special handling for common queries
        if (queryLower.includes("feature") || queryLower.includes("features"))
          score += 3;
        if (
          queryLower.includes("all") ||
          queryLower.includes("show") ||
          queryLower.includes("list")
        )
          score += 2;

        return { feature, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit)
      .map((item) => item.feature);

    return relevantFeatures.map((feature) => ({
      type: "feature",
      id: feature._id,
      title: feature.name,
      content: feature.description || "",
      metadata: { phase: feature.phase, priority: feature.priority },
    }));
  },
});

// Query: Debug - Get all data counts for organization
export const getDataCounts = query({
  args: {
    organizationId: v.id("organization"),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const ideas = await ctx.db
      .query("idea")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const issues = await ctx.db
      .query("issues")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const features = await ctx.db
      .query("feature")
      .withIndex("byOrg", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return {
      projects: projects.length,
      ideas: ideas.length,
      issues: issues.length,
      features: features.length,
      sampleProjects: projects
        .slice(0, 3)
        .map((p) => ({ name: p.name, description: p.description })),
      sampleIdeas: ideas
        .slice(0, 3)
        .map((i) => ({ name: i.name, description: i.description })),
      sampleIssues: issues
        .slice(0, 3)
        .map((i) => ({ title: i.title, description: i.description })),
      sampleFeatures: features
        .slice(0, 3)
        .map((f) => ({ name: f.name, description: f.description })),
    };
  },
});
