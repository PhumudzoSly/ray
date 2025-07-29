import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { google as googleOpenAI } from "@ai-sdk/google";
import { prisma } from "@workspace/backend";

export const getAllProjects = createTool({
  name: "get_all_projects",
  description: "Get all projects from within the Organization",
  handler: async ({}, { network, step }) => {
    const projects = await prisma.project.findMany();
    return projects;
  },
});
