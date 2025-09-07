import { webSearch } from "@/lib/exa";
import { google } from "@ai-sdk/google";
import { serve } from "@upstash/workflow/nextjs";
import { prisma } from "@workspace/backend";
import { generateObject, generateText, stepCountIs } from "ai";
import { z } from "zod";

interface WorkflowPayload {
  competitorId: string;
  userInstructions?: string;
}

export const { POST } = serve(async (context) => {
  const payload = context.requestPayload as WorkflowPayload;

  const research = await context.run("research-competitor-swot", async () => {
    const competitor = await prisma.competitor.findUnique({
      where: { id: payload.competitorId },
      include: {
        idea: true,
        CompetitorSwot: true,
        competitiveMoves: true,
      },
    });

    if (!competitor) {
      throw new Error("Competitor not found");
    }

    const prompt = `We are conducting a comprehensive SWOT analysis for this competitor.
      The competitor and context info is as follows: 
      
      Competitor: ${JSON.stringify(competitor)}
      
${
  payload.userInstructions
    ? `
      IMPORTANT: The user has provided these specific instructions for SWOT analysis:
      "${payload.userInstructions}"
      
      Please respect these instructions and tailor the SWOT analysis accordingly.
      `
    : ""
}
      I need you to conduct a thorough SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) 
      for this competitor in the context of their market and our business idea.

      IMPORTANT: Please check the existing SWOT entries in the competitor data and avoid generating duplicates. 
      Focus on new insights that haven't been identified yet.

      For STRENGTHS, analyze:
      - Market position and brand recognition
      - Financial resources and funding
      - Technology and innovation capabilities
      - Team expertise and leadership
      - Product portfolio and features
      - Customer base and loyalty
      - Operational efficiency
      - Strategic partnerships

      For WEAKNESSES, analyze:
      - Product limitations or gaps
      - Market positioning issues
      - Financial constraints
      - Technology debt or limitations
      - Team or leadership challenges
      - Customer satisfaction issues
      - Operational inefficiencies
      - Limited market reach

      For OPPORTUNITIES, analyze:
      - Market expansion possibilities
      - Technology adoption opportunities
      - Partnership potential
      - Product development areas
      - Customer segment growth
      - Geographic expansion
      - Industry trend advantages
      - Competitive gaps they could fill

      For THREATS, analyze:
      - Competitive pressure from others
      - Market changes and disruption
      - Technology obsolescence risks
      - Regulatory challenges
      - Economic factors
      - Customer behavior shifts
      - Supply chain vulnerabilities
      - Security or privacy concerns

      Please research thoroughly to provide accurate, insightful SWOT analysis.
      `;

    console.log("SWOT analysis research prompt", prompt);

    const { text, sources } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      tools: {
        webSearch,
      },
      stopWhen: [stepCountIs(30)],
    });

    return { text, sources };
  });

  const swotData = await context.run("generate-swot-analysis", async () => {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        swotEntries: z.array(
          z.object({
            type: z.enum(["Strength", "Weakness", "Opportunity", "Threat"]),
            swotAnalysis: z.string(),
            impact: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
          })
        ),
      }),
      prompt: `
      Use the research information below to generate a structured SWOT analysis:
     
      THE RESEARCH: ${research.text}
      
      Create multiple entries for each SWOT category (Strengths, Weaknesses, Opportunities, Threats).
      
      For each SWOT entry, provide:
      - type: The SWOT category ("Strength", "Weakness", "Opportunity", or "Threat")
      - swotAnalysis: Detailed analysis of this specific point (2-3 sentences)
      - impact: How significant this factor is (LOW, MEDIUM, HIGH, CRITICAL)
      
      Aim for 3-5 entries per category (Strengths, Weaknesses, Opportunities, Threats) for a comprehensive analysis.
      Focus on specific, actionable insights rather than generic statements.
      Consider the competitive landscape and market context in your analysis.
      `,
    });

    return object;
  });

  await context.run("save-swot-analysis", async () => {
    // Check for existing SWOT entries to avoid duplicates
    const existingSwotEntries = await prisma.competitorSwot.findMany({
      where: { competitorId: payload.competitorId },
      select: { swotAnalysis: true, type: true },
    });

    const existingAnalyses = new Set(
      existingSwotEntries.map(
        (entry) =>
          `${entry.type.toLowerCase()}_${entry.swotAnalysis.toLowerCase().substring(0, 50)}`
      )
    );

    // Filter out potential duplicates (based on type and first 50 chars of analysis)
    const uniqueSwotEntries = swotData.swotEntries.filter((entry) => {
      const key = `${entry.type.toLowerCase()}_${entry.swotAnalysis.toLowerCase().substring(0, 50)}`;
      return !existingAnalyses.has(key);
    });

    if (uniqueSwotEntries.length === 0) {
      console.log("No new unique SWOT entries to create");
      return;
    }

    const swotEntriesForDb = uniqueSwotEntries.map((entry) => {
      return {
        ...entry,
        competitorId: payload.competitorId,
      };
    });

    await prisma.competitorSwot.createMany({
      data: swotEntriesForDb,
    });

    console.log(`Created ${uniqueSwotEntries.length} new SWOT entries`);
  });
});
