import { google } from "@ai-sdk/google";
import { generateObject, tool } from "ai";
import Exa from "exa-js";
import { z } from "zod";

export const exa = new Exa(process.env.EXA_API_KEY);

export const webSearch = tool({
  description: "Search the web for up-to-date information",
  paremeters: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  //   @ts-ignore
  execute: async ({ query }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: "always",
      numResults: 5,
    });
    return results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.text.slice(0, 1000), // take just the first 1000 characters
      publishedDate: result.publishedDate,
    }));
  },
});

export const deepSearch = tool({
  description: "Search the web for up-to-date information",
  paremeters: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  //   @ts-ignore
  execute: async ({ query }) => {
    const task = await exa.research.createTask({
      model: "exa-research",
      instructions: `
              You are a deep researcher AI agent, you are required to find some information about the following topic: ${prompt}
            `,
      output: {
        schema: {
          type: "object",
          required: ["research", "findings"],
          properties: {
            research: {
              type: "object",
              required: ["description"],
              properties: {
                description: { type: "string" },
              },
            },
            findings: {
              type: "object",
              required: ["overview", "keyFindings"],
              properties: {
                overview: { type: "string" },
                keyFindings: { type: "array", items: { type: "string" } },
              },
            },
          },
          additionalProperties: false,
        },
      },
    });

    let data = await exa.research.getTask(task.id);

    while (data.status !== "completed" && data.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 90000)); // Wait 3 minutes before checking again
      data = await exa.research.getTask(task.id);
    }

    if (data.status === "failed") {
      throw new Error("Research task failed");
    }

    return data.data;
  },
});

export const generateQuestions = tool({
  description:
    "Generate questions for a deep research on the given query or topic",
  paremeters: z.object({
    query: z
      .string()
      .min(1)
      .max(100)
      .describe("The query or topic to generate questions for the research"),
  }),
  //   @ts-ignore
  execute: async ({ query }) => {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        questions: z.array(z.string().min(1).max(100)),
      }),
      prompt: `Generate questions for a deep research on the given query or topic: ${query}`,
    });
    return object;
  },
});
