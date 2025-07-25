import { createAgent, gemini } from "@inngest/agent-kit";
import { allTools } from "./tools";
import { SAAS_VALIDATION_PROMPT } from "./prompt";

const ideaResearcher = createAgent({
  name: "Data Researcher",
  description:
    "You are an expert Data Researcher specializing in comprehensive SaaS idea validation through extensive internet research and data analysis. Find the required data and return it in a structured format.",
  system: SAAS_VALIDATION_PROMPT,
  model: gemini({
    model: "gemini-2.0-flash",
  }),
  tools: [
    allTools.search,
    allTools.scrapeUrl,
    allTools.scrapeMultipleUrls,
    allTools.competitorResearch,
    allTools.trendResearch,
    allTools.sentimentAnalysis,
    allTools.multiQueryResearch,
    allTools.research,
  ],
});

export { ideaResearcher };
