import { prisma } from "@workspace/backend";
import { tool } from "ai";
import { getSession } from "@/actions/account/user";
import { z } from "zod";

export const getIdeas = tool({
  description: "Get all SaaS ideas that belongs to the current organization.",
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }: { query: string }) => {
    const { org } = await getSession();
    const ideas = await prisma.idea.findMany({
      where: {
        organizationId: org,
      },
    });
    return ideas;
  },
});

export const createIdea = tool({
  description: "Create a new SaaS idea for the current organization.",
  inputSchema: z.object({
    name: z.string().min(1).max(100).describe("The name of the idea"),
    description: z
      .string()
      .min(1)
      .max(1000)
      .describe("The description of the idea"),
    industry: z.string().min(1).max(100).describe("The industry of the idea"),
    internal: z.boolean().describe("Is the idea internal?"),
    openSource: z.boolean().describe("Is the idea open source?"),
    problemSolved: z
      .string()
      .min(1)
      .max(1000)
      .describe("The problem solved by the idea"),
    solutionOffered: z
      .string()
      .min(1)
      .max(1000)
      .describe("The solution offered by the idea"),
  }),
  execute: async ({
    name,
    description,
    industry,
    internal,
    openSource,
    problemSolved,
    solutionOffered,
  }: {
    name: string;
    description: string;
    industry: string;
    internal: boolean;
    openSource: boolean;
    problemSolved: string;
    solutionOffered: string;
  }) => {
    const { org, userId } = await getSession();
    const idea = await prisma.idea.create({
      data: {
        name,
        description,
        organizationId: org,
        industry,
        internal,
        openSource,
        status: "INVALIDATED",
        problemSolved,
        solutionOffered,
      },
    });
    return idea;
  },
});
