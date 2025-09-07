import { webSearch } from "@/lib/exa";
import { google } from "@ai-sdk/google";
import { serve } from "@upstash/workflow/nextjs";
import { prisma } from "@workspace/backend";
import { generateObject, generateText, stepCountIs } from "ai";
import { z } from "zod";

interface WorkflowPayload {
  ideaId: string;
  userInstructions?: string;
}

export const { POST } = serve(async (context) => {
  //
  const payload = context.requestPayload as WorkflowPayload;

  const competitors = await context.run("research-competitors", async () => {
    const idea = await prisma.idea.findUnique({
      where: { id: payload.ideaId },
      include: {
        Competitor: true,
      },
    });

    const prompt = `We are researching competitors for this business idea.
      The business idea and more info is as follows: 
      
      ${JSON.stringify(idea)}
      
${
  payload.userInstructions
    ? `
      IMPORTANT: The user has provided these specific instructions for competitor research:
      "${payload.userInstructions}"
      
      Please respect these instructions and tailor the competitor research accordingly.
      `
    : ""
}
      I need you to research and identify key competitors in this market space.
      Focus on both direct and indirect competitors that could impact this business idea.

      IMPORTANT: Please check the existing competitors in the idea data and avoid generating duplicates. Focus on new competitors that haven't been identified yet.

      Consider:
      - Direct competitors with similar products/services
      - Indirect competitors solving the same problem differently
      - Emerging startups in the space
      - Established companies that might enter this market
      - Alternative solutions customers might choose instead

      Please research thoroughly to find real competitors with accurate information.
      `;

    console.log("competitor research prompt", prompt);

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

  const competitorData = await context.run("generate-competitors", async () => {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        competitors: z.array(
          z.object({
            name: z.string(),
            website: z.string().optional(),
            description: z.string(),
            threatLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            marketShare: z.number().optional(),
            employeeCount: z.string().optional(),
            foundedYear: z.number().optional(),
            headquarters: z.string().optional(),
            targetAudience: z.string().optional(),
          })
        ),
      }),
      prompt: `
      Use the research information below to generate a structured list of competitors:
     
      THE RESEARCH: ${competitors.text}
      
      For each competitor, provide:
      - name: Company/product name
      - website: Official website URL (if found)
      - description: Brief description of what they do and how they compete
      - threatLevel: How significant a threat they are (LOW, MEDIUM, HIGH, CRITICAL)
      - marketShare: Estimated market share percentage (if available)
      - employeeCount: Number of employees (if available, as string like "1-10", "50-100", "500+")
      - foundedYear: Year the company was founded (if available)
      - headquarters: Location of headquarters (if available)
      - targetAudience: Description of their target market (if available)
      
      Focus on quality over quantity - include only legitimate, real competitors with accurate information.
      `,
    });

    return object;
  });

  await context.run("save-competitors", async () => {
    // Check for existing competitors to avoid duplicates
    const existingCompetitors = await prisma.competitor.findMany({
      where: { ideaId: payload.ideaId },
      select: { name: true, website: true },
    });

    const existingNames = new Set(
      existingCompetitors.map((competitor) => competitor.name.toLowerCase())
    );
    const existingWebsites = new Set(
      existingCompetitors
        .map((competitor) => competitor.website?.toLowerCase())
        .filter(Boolean)
    );

    // Filter out potential duplicates (case-insensitive name and website matching)
    const uniqueCompetitors = competitorData.competitors.filter(
      (competitor) => {
        const nameExists = existingNames.has(competitor.name.toLowerCase());
        const websiteExists =
          competitor.website &&
          existingWebsites.has(competitor.website.toLowerCase());
        return !nameExists && !websiteExists;
      }
    );

    if (uniqueCompetitors.length === 0) {
      console.log("No new unique competitors to create");
      return;
    }

    const competitorsData = uniqueCompetitors.map((competitor) => {
      return {
        ...competitor,
        ideaId: payload.ideaId,
      };
    });

    await prisma.competitor.createMany({
      data: competitorsData,
    });

    console.log(`Created ${uniqueCompetitors.length} new competitors`);
  });
});
