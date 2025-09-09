import { google } from "@ai-sdk/google";
import { generateObject, tool } from "ai";
import Exa from "exa-js";
import { z } from "zod/v4";

export const exa = new Exa(process.env.EXA_API_KEY);

export const webSearch = tool({
  description: "Search the web for up-to-date information",
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }: { query: string }) => {
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
  description: "Perform deep research using Exa's research API",
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe("The research topic or query"),
  }),
  execute: async ({ query }: { query: string }) => {
    const task = await exa.research.createTask({
      model: "exa-research",
      instructions: `
        You are a deep researcher AI agent. Research the following topic comprehensively: ${query}
        
        Provide detailed findings including:
        - Market overview and trends
        - Key players and competitors
        - Recent developments and news
        - Statistical data and metrics
        - Expert opinions and analysis
      `,
      output: {
        schema: {
          type: "object",
          required: ["research", "findings"],
          properties: {
            research: {
              type: "object",
              required: ["description", "methodology"],
              properties: {
                description: { type: "string" },
                methodology: { type: "string" },
              },
            },
            findings: {
              type: "object",
              required: ["overview", "keyFindings", "sources"],
              properties: {
                overview: { type: "string" },
                keyFindings: { type: "array", items: { type: "string" } },
                sources: { type: "array", items: { type: "string" } },
              },
            },
          },
          additionalProperties: false,
        },
      },
    });

    let data = await exa.research.getTask(task.id);

    while (data.status !== "completed" && data.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds before checking again
      data = await exa.research.getTask(task.id);
    }

    if (data.status === "failed") {
      throw new Error("Research task failed");
    }

    return data.data;
  },
});

export const generateQuestions = tool({
  description: "Generate 5 research questions for a given SaaS idea",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(100)
      .describe("The query or topic to generate questions for the research"),
  }),
  //@ts-ignore
  execute: async ({ query }: { query: string }) => {
    const { object } = await generateObject({
      model: "google/gemini-2.5-flash-lite",
      schema: z.object({
        questions: z.array(z.string().min(1).max(100)),
      }),
      prompt: `Generate specific, actionable research questions for a deep analysis of: ${query}
      
      Focus on questions that would help understand:
      - Market size and opportunity
      - Competitive landscape
      - Customer needs and pain points
      - Business model viability
      - Technical feasibility
      - Financial projections
      - Risk factors
      
      Generate 8-12 focused questions.`,
    });
    return object;
  },
});
