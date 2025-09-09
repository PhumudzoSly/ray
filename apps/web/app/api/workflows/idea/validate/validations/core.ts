import { exa, webSearch } from "@/lib/exa";
import { google } from "@ai-sdk/google";
import { IdeaValidationOptionalDefaults, prisma } from "@workspace/backend";
import { generateText, stepCountIs } from "ai";

export const initValidation = async (ideaId: string) => {
  // Check if validation already exists for this idea
  const existingValidation = await prisma.ideaValidation.findFirst({
    where: { ideaId },
  });

  // If it exists, delete it first
  if (existingValidation) {
    await prisma.ideaValidation.delete({
      where: { id: existingValidation.id },
    });
  }

  // Create new validation
  const validation = await prisma.ideaValidation.create({
    data: {
      ideaId,
    },
  });

  return validation;
};

export const getValidation = async (id: string) => {
  const validation = await prisma.ideaValidation.findUnique({
    where: { id },
    include: {
      idea: true,
      validationMetrics: true,
    },
  });
  if (!validation) throw new Error("Validation does not exist");

  return validation;
};

export const updateValidation = async ({
  id,
  data,
}: {
  id: string;
  data: IdeaValidationOptionalDefaults;
}) => {
  return await prisma.ideaValidation.update({
    where: { id },
    data,
  });
};

export const summarizeIdea = async (id: string) => {
  const validation = await getValidation(id);

  const { text } = await generateText({
    prompt: `Given the following SaaS idea, 
    I need you to summarize the entire SaaS in less than 2500 characters, be concise and don't leave out anything important.
    I want the SaaS idea, the core problems, what it solves, how and so on... all real info based on the main idea.
    The SaaS idea is 

    ${JSON.stringify(validation.idea)}
    `,
    model: "google/gemini-2.5-flash-lite",
  });

  return text;
};

export const runResearch = async (prompt: string) => {
  //
  const { text } = await generateText({
    prompt,
    model: "google/gemini-2.5-flash-lite",
    tools: {
      webSearch,
    },
    stopWhen: [stepCountIs(25)],
  });

  return text;
};
