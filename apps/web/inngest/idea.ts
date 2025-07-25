import { inngestClient } from "@/lib/inngest";
import { createState } from "@inngest/agent-kit";
import { prisma } from "@workspace/backend/prisma/prisma";
import { ideaValidator } from "./validation/agent";

export const validateIdea = inngestClient.createFunction(
  { name: "Validate Idea", id: "validate-idea" },
  { event: "idea/validate" },
  async ({ event, step }: { event: any; step: any }) => {
    const { ideaId, additionalContext, org } = event.data;

    // Remove any existing market research for this idea/org
    await prisma.marketResearch.deleteMany({
      where: { ideaId, organizationId: org },
    });

    // Create new market research entry
    const research = await prisma.marketResearch.create({
      data: {
        ideaId,
        confidenceLevel: "LOW",
        marketMaturity: "MATURE",
        organizationId: org,
      },
      include: {
        idea: true,
      },
    });

    // Prepare state for the validation network
    const state = createState({
      ideaId,
      researchId: research.id,
      idea: research.idea,
    });

    // Build the prompt with additional context if provided
    let prompt = `
    You are a SaaS idea validation expert.
    Your task is to critically assess the clarity and conciseness of the following SaaS idea.
    Please review the provided details and identify any ambiguities, missing information, or areas that could be improved for better understanding.

    Respond with:
    - A brief summary of the idea in your own words.
    - An assessment of whether the idea is clear and concise.
    - Specific suggestions for improving clarity or completeness, if needed.

    SaaS Idea Details:
    ${JSON.stringify(research.idea, null, 2)}
  `;

    // Add additional context if provided
    if (additionalContext) {
      if (additionalContext.preValidationAnswers) {
        prompt += `\n\nAdditional Information from User:\n`;
        additionalContext.preValidationAnswers.forEach((qa: any) => {
          prompt += `Question: ${qa.question}\nAnswer: ${qa.answer}\n\n`;
        });
      }

      if (additionalContext.source) {
        prompt += `\nContext Source: ${additionalContext.source}\n`;
      }
    }

    // Run the validation network
    await ideaValidator.run(prompt, { state });

    return {
      success: true,
      ideaId,
    };
  }
);
