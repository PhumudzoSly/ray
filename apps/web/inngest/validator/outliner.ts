import { exa } from "@/lib/exa";
import { prisma } from "@workspace/backend";
import Exa from "exa-js";

async function outlineIdea(ideaId: string) {
  //

  const idea = await prisma.idea.findUnique({
    where: {
      id: ideaId,
    },
  });

  if (!idea) {
    throw new Error("Idea not found");
  }

  const task = await exa.research.createTask({
    model: "exa-research",
    instructions: `
    You are a product strategist. Your task is to create a clear outline for a SaaS idea that explains the core concept.

    IDEA DETAILS:
    ${JSON.stringify(idea)}

    TASK:
    Create a focused outline that clearly explains:
    1. What problem this SaaS idea solves
    2. What solution it offers
    3. Who the target audience is

    Keep it concise and focused on these three key areas only.
    `,
    output: {
      schema: {
        type: "object",
        required: ["problem", "solution", "targetAudience"],
        properties: {
          problem: {
            type: "object",
            required: ["description", "painPoints", "currentSolutions"],
            properties: {
              description: { type: "string" },
              painPoints: { type: "array", items: { type: "string" } },
              currentSolutions: { type: "array", items: { type: "string" } },
            },
          },
          solution: {
            type: "object",
            required: ["overview", "keyFeatures", "valueProposition"],
            properties: {
              overview: { type: "string" },
              keyFeatures: { type: "array", items: { type: "string" } },
              valueProposition: { type: "string" },
            },
          },
          targetAudience: {
            type: "object",
            required: ["primaryUsers", "demographics", "useCases"],
            properties: {
              primaryUsers: { type: "array", items: { type: "string" } },
              demographics: { type: "string" },
              useCases: { type: "array", items: { type: "string" } },
            },
          },
        },
        additionalProperties: false,
      },
    },
  });

  let data = await exa.research.getTask(task.id);

  while (data.status !== "completed" && data.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 180000)); // Wait 3 minutes before checking again
    data = await exa.research.getTask(task.id);
  }

  if (data.status === "failed") {
    throw new Error("Research task failed");
  }

  return data.data;
}
