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

  const research = await context.run("research-competitive-moves", async () => {
    const competitor = await prisma.competitor.findUnique({
      where: { id: payload.competitorId },
      include: {
        idea: true,
        competitiveMoves: true,
      },
    });

    if (!competitor) {
      throw new Error("Competitor not found");
    }

    const prompt = `We are researching competitive moves for this competitor.
      The competitor and context info is as follows: 
      
      Competitor: ${JSON.stringify(competitor)}
      
${
  payload.userInstructions
    ? `
      IMPORTANT: The user has provided these specific instructions for competitive moves research:
      "${payload.userInstructions}"
      
      Please respect these instructions and tailor the competitive moves research accordingly.
      `
    : ""
}
      I need you to research and identify recent competitive moves, strategic initiatives, product launches, 
      and market activities by this competitor.

      IMPORTANT: Please check the existing competitive moves in the competitor data and avoid generating duplicates. 
      Focus on new moves that haven't been identified yet.

      Focus on:
      - Recent product launches and updates
      - Strategic partnerships and acquisitions
      - Market expansion activities
      - Pricing strategy changes
      - New feature announcements
      - Funding rounds or investment news
      - Leadership changes
      - Technology adoptions
      - Marketing campaigns
      - Competitive positioning changes

      Please research thoroughly to find real, recent competitive moves with accurate information and dates.
      `;

    console.log("competitive moves research prompt", prompt);

    const { text, sources } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      tools: {
        webSearch,
      },
      stopWhen: [stepCountIs(25)],
    });

    return { text, sources };
  });

  const movesData = await context.run(
    "generate-competitive-moves",
    async () => {
      const { object } = await generateObject({
        model: google("gemini-2.0-flash"),
        schema: z.object({
          moves: z.array(
            z.object({
              moveType: z.string(),
              title: z.string(),
              description: z.string(),
              impactLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
              targetAudience: z.string().optional(),
              affectedFeatures: z.array(z.string()),
              announcedDate: z.string().optional(),
              launchDate: z.string().optional(),
              completionDate: z.string().optional(),
              userFeedback: z.string().optional(),
              pressCoverage: z.array(z.string()),
              opportunities: z.array(z.string()),
              threats: z.array(z.string()),
              responseRequired: z.boolean(),
              responseStrategy: z.string().optional(),
            })
          ),
        }),
        prompt: `
      Use the research information below to generate a structured list of competitive moves:
     
      THE RESEARCH: ${research.text}
      
      For each competitive move, provide:
      - moveType: Type of move (e.g., "Product Launch", "Acquisition", "Partnership", "Funding", "Market Expansion")
      - title: Brief title describing the move
      - description: Detailed description of the competitive move
      - impactLevel: How significant the impact is (LOW, MEDIUM, HIGH, CRITICAL)
      - targetAudience: Who this move targets (optional)
      - affectedFeatures: List of features or areas affected by this move
      - announcedDate: When it was announced (ISO date string, optional)
      - launchDate: When it launched or will launch (ISO date string, optional)
      - completionDate: When it was completed (ISO date string, optional)
      - userFeedback: Any user feedback or market reaction (optional)
      - pressCoverage: List of URLs or sources covering this move
      - opportunities: List of opportunities this creates for us
      - threats: List of threats this poses to us
      - responseRequired: Whether we need to respond to this move
      - responseStrategy: Suggested response strategy (optional)
      
      Focus on quality over quantity - include only legitimate, recent competitive moves with accurate information.
      Provide realistic dates in ISO format (YYYY-MM-DD) when available.
      `,
      });

      return object;
    }
  );

  await context.run("save-competitive-moves", async () => {
    // Check for existing competitive moves to avoid duplicates
    const existingMoves = await prisma.competitiveMove.findMany({
      where: { competitorId: payload.competitorId },
      select: { title: true, moveType: true },
    });

    const existingTitles = new Set(
      existingMoves.map((move) => move.title.toLowerCase())
    );

    // Filter out potential duplicates (case-insensitive title matching)
    const uniqueMoves = movesData.moves.filter(
      (move) => !existingTitles.has(move.title.toLowerCase())
    );

    if (uniqueMoves.length === 0) {
      console.log("No new unique competitive moves to create");
      return;
    }

    const movesDataForDb = uniqueMoves.map((move) => {
      return {
        ...move,
        competitorId: payload.competitorId,
        announcedDate: move.announcedDate ? new Date(move.announcedDate) : null,
        launchDate: move.launchDate ? new Date(move.launchDate) : null,
        completionDate: move.completionDate
          ? new Date(move.completionDate)
          : null,
      };
    });

    await prisma.competitiveMove.createMany({
      data: movesDataForDb,
    });

    console.log(`Created ${uniqueMoves.length} new competitive moves`);
  });
});
