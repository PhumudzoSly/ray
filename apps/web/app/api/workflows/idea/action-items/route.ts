import { webSearch } from "@/lib/exa";
import { google } from "@ai-sdk/google";
import { serve } from "@upstash/workflow/nextjs";
import {
  ActionItemStatusSchema,
  ImportanceSchema,
  prisma,
} from "@workspace/backend";
import { generateObject, generateText, stepCountIs } from "ai";
import { z } from "zod";

interface WorkflowPayload {
  ideaId: string;
  userInstructions?: string;
}

export const { POST } = serve(async (context) => {
  const payload = context.requestPayload as WorkflowPayload;

  const actions = await context.run("research-action-items", async () => {
    const idea = await prisma.idea.findUnique({
      where: { id: payload.ideaId },
      include: {
        actionItems: true,
        projects: {
          include: {
            issues: {
              where: {
                status: {
                  not: "DONE",
                },
              },
            },
          },
        },
      },
    });

    const prompt = `We are in the process of continuous building and growing the idea.
      The business idea and more info is as follows: 
      
      ${JSON.stringify(idea)}
      
${
  payload.userInstructions
    ? `
      IMPORTANT: The user has provided these specific instructions for the action items:
      "${payload.userInstructions}"
      
      Please respect these instructions and tailor the action items accordingly.
      `
    : ""
}
      I need you to generate a list of actions we must take in order to validate the current status of the idea, building it, and growing it all together.
      The actions must be important and necessary for the validation, growth and development of the idea/product.

      IMPORTANT: Please check the existing action items in the idea data and avoid generating duplicates. Focus on complementary or new actions that haven't been covered yet.

      It might be important for you to do research as well and come up with good solutions.
      `;

    console.log("prompt", prompt);

    const { text, sources } = await generateText({
      model: "google/gemini-2.5-flash-lite",
      prompt,
      tools: {
        webSearch,
      },
      stopWhen: [stepCountIs(10)],
    });

    return { text, sources };
  });

  const items = await context.run("generate-action-items", async () => {
    const { object } = await generateObject({
      model: "google/gemini-2.5-flash-lite",
      schema: z.object({
        items: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            status: ActionItemStatusSchema,
            priority: ImportanceSchema,
          })
        ),
      }),
      prompt: `
      Use the information below to generate a list of action items for the user to complete.:
     
     
    THE INFO: ${actions.text}`,
    });

    return object;
  });

  await context.run("save-action-items", async () => {
    // Check for existing action items to avoid duplicates
    const existingActionItems = await prisma.actionItem.findMany({
      where: { ideaId: payload.ideaId },
      select: { name: true },
    });

    const existingNames = new Set(
      existingActionItems.map((item) => item.name.toLowerCase())
    );

    // Filter out potential duplicates (case-insensitive)
    const uniqueItems = items.items.filter(
      (item) => !existingNames.has(item.name.toLowerCase())
    );

    if (uniqueItems.length === 0) {
      console.log("No new unique action items to create");
      return;
    }

    const actionItemsData = uniqueItems.map((i) => {
      return {
        ...i,
        ideaId: payload.ideaId,
      };
    });

    await prisma.actionItem.createMany({
      data: actionItemsData,
    });

    console.log(`Created ${uniqueItems.length} new action items`);
  });
});
