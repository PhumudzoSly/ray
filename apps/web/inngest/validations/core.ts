import { exa } from "@/lib/exa";
import { google } from "@ai-sdk/google";
import { IdeaValidationOptionalDefaults, prisma } from "@workspace/backend";
import { generateText } from "ai";

export const initValidation = async (ideaId: string) => {
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
    I need you to summarize the entire SaaS in less than 500 characters, be concise and don't leave out anything important.
    The SaaS idea is 

    ${JSON.stringify(validation.idea)}
    `,
    model: google("gemini-2.0-flash-lite"),
  });

  return text;
};

export const runResearch = async (prompt: string) => {
  //
  const task = await exa.research.createTask({
    model: "exa-research-pro",
    instructions: prompt,
  });

  let data = await exa.research.getTask(task.id);

  while (data.status !== "completed" && data.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 30 seconds before checking again
    data = await exa.research.getTask(task.id);
  }

  if (data.status === "failed") {
    throw new Error("Research task failed");
  }

  return data.data;
};
