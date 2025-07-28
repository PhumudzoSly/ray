import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import {
  CompetitorOptionalDefaultsSchema,
  prisma,
  CompetitorPricingOptionalDefaultsSchema,
  CompetitiveMoveOptionalDefaultsSchema,
  FeatureComparisonOptionalDefaultsSchema,
} from "@workspace/backend";
import z from "zod";

// Modified schemas for Gemini API compatibility (excluding UUID and date fields)
const CompetitorInputSchema = CompetitorOptionalDefaultsSchema.omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

const CompetitorPricingInputSchema =
  CompetitorPricingOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

const CompetitiveMoveInputSchema = CompetitiveMoveOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

const FeatureComparisonInputSchema =
  FeatureComparisonOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

const saveDataTool = createTool({
  name: "save-competitor",
  description:
    "Save the competitor data to the database with comprehensive market analysis",
  parameters: CompetitorInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId, competitiveLandscapeId } = network.state.data;

    if (!competitiveLandscapeId) {
      throw new Error(
        "Competitive landscape ID not found. Please create a competitive landscape first."
      );
    }

    const competitor = await prisma.competitor.create({
      data: { ...data, competitiveLandscapeId },
    });

    // Initialize competitors array if it doesn't exist
    if (!network.state.data.competitors) {
      network.state.data.competitors = [];
    }
    network.state.data.competitors.push(competitor);

    return competitor;
  },
});

const savePricingTool = createTool({
  name: "save-pricing",
  description: "Save the competitor pricing data to the database",
  parameters: CompetitorPricingInputSchema,
  handler: async (data, { network, agent, step }) => {
    // Get the competitor ID from network state
    const { competitors } = network.state.data;
    if (!competitors || competitors.length === 0) {
      throw new Error(
        "No competitors found. Please create a competitor first."
      );
    }

    // Use the most recently created competitor
    const competitorId = competitors[competitors.length - 1].id;

    await prisma.competitorPricing.create({
      data: { ...data, competitorId },
    });
  },
});

const saveCompetitiveMoveTool = createTool({
  name: "save-competitive-move",
  description:
    "Save competitive moves and strategic actions taken by competitors",
  parameters: CompetitiveMoveInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { competitiveLandscapeId } = network.state.data;

    if (!competitiveLandscapeId) {
      throw new Error(
        "Competitive landscape ID not found. Please create a competitive landscape first."
      );
    }

    await prisma.competitiveMove.create({
      data: { ...data, competitiveLandscapeId },
    });
  },
});

const saveFeatureComparisonTool = createTool({
  name: "save-feature-comparison",
  description: "Save detailed feature comparisons between competitors",
  parameters: FeatureComparisonInputSchema,
  handler: async (data, { network, agent, step }) => {
    // Get the competitor ID from network state
    const { competitors } = network.state.data;
    if (!competitors || competitors.length === 0) {
      throw new Error(
        "No competitors found. Please create a competitor first."
      );
    }

    // Use the most recently created competitor
    const competitorId = competitors[competitors.length - 1].id;

    await prisma.featureComparison.create({
      data: { ...data, competitorId },
    });
  },
});

const getCompetitorTool = createTool({
  name: "get-competitor",
  description: "Get the competitor data from the database",
  // @ts-ignore
  parameters: z.object({
    id: z.string().describe("The id of the competitor to get"),
  }),
  handler: async (data, { network, agent, step }) => {
    const competitor = await prisma.competitor.findUnique({
      where: { id: data.id },
      include: {
        pricingPlans: true,
        competitiveMoves: true,
        featureComparisons: true,
      },
    });
    return competitor;
  },
});

const getCompetitorsByLandscapeTool = createTool({
  name: "get-competitors-by-landscape",
  description: "Get all competitors for a specific competitive landscape",
  // @ts-ignore
  parameters: z.object({
    competitiveLandscapeId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    const competitors = await prisma.competitor.findMany({
      where: { competitiveLandscapeId: data.competitiveLandscapeId },
      include: {
        pricingPlans: true,
        competitiveMoves: true,
        featureComparisons: true,
      },
    });
    return competitors;
  },
});

const getCompetitiveLandscapeIdTool = createTool({
  name: "get-competitive-landscape-id",
  description:
    "Get the competitive landscape ID from the current network state",
  handler: async (data, { network, agent, step }) => {
    const { competitiveLandscapeId } = network.state.data;

    if (!competitiveLandscapeId) {
      throw new Error(
        "Competitive landscape ID not found. Please create a competitive landscape first."
      );
    }

    return { competitiveLandscapeId };
  },
});

const getCurrentCompetitiveLandscapeTool = createTool({
  name: "get-current-competitive-landscape",
  description:
    "Get the current competitive landscape data from the network state or database",
  handler: async (data, { network, agent, step }) => {
    const { competitiveLandscape, competitiveLandscapeId, researchId } =
      network.state.data;

    // If we have the landscape data in network state, return it
    if (competitiveLandscape && competitiveLandscapeId) {
      return {
        competitiveLandscape,
        competitiveLandscapeId,
      };
    }

    // If we don't have it in network state but have researchId, try to get it from database
    if (researchId) {
      const landscapeFromDb = await prisma.competitiveLandscape.findUnique({
        where: { marketResearchId: researchId },
        include: {
          competitors: true,
          competitiveMoves: true,
        },
      });

      if (landscapeFromDb) {
        // Update network state with the found landscape
        network.state.data.competitiveLandscape = landscapeFromDb;
        network.state.data.competitiveLandscapeId = landscapeFromDb.id;

        return {
          competitiveLandscape: landscapeFromDb,
          competitiveLandscapeId: landscapeFromDb.id,
        };
      }
    }

    throw new Error(
      "Competitive landscape data not found. Please create a competitive landscape first."
    );
  },
});

const competitorsAgent = createAgent({
  name: "Competitor Researcher",
  system: `
  Your aim is to find and analyze competitors for a given SaaS idea with comprehensive market intelligence.
  
  IMPORTANT: Before you can save competitors, a competitive landscape must be created first. Use the get-current-competitive-landscape tool to check if a landscape exists.
  
  You will be given a SaaS idea and you need to:
  1. Find direct and indirect competitors
  2. Analyze their market position, strengths, weaknesses, and competitive advantages
  3. Research their pricing strategies and feature sets
  4. Track their recent competitive moves and strategic actions
  5. Compare features and capabilities in detail
  
  For each competitor, collect and save:
  
  **Basic Information:**
  - Name, website, description, logo URL
  
  **Market Position:**
  - Market share, annual revenue, funding raised
  - Employee count, founded year, headquarters
  - User growth rate, churn rate, customer satisfaction
  - Market cap (if public company)
  
  **Product Analysis:**
  - Product features, pricing model, target audience
  - Tech stack, integrations
  - Strengths, weaknesses, opportunities, threats
  
  **Competitive Analysis:**
  - Competitive advantage and differentiation factors
  - Threat level and competitive position
  
  **Pricing Information:**
  - Pricing plans with features and limitations
  - Value per dollar analysis
  - Price change history and reasons
  
  **Competitive Moves:**
  - Recent product launches, feature updates, pricing changes
  - Partnerships, acquisitions, marketing campaigns
  - Impact analysis and market response
  
  **Feature Comparisons:**
  - Detailed feature-by-feature comparison
  - Quality ratings and implementation notes
  - User ratings, market share, adoption rates
  
  Use the tools provided to save all this data in a structured format.
  Focus on actionable insights that can inform competitive strategy.
`,
  model: gemini({
    model: "gemini-2.0-flash",
  }),
  tools: [
    saveDataTool,
    savePricingTool,
    saveCompetitiveMoveTool,
    saveFeatureComparisonTool,
    getCompetitorTool,
    getCompetitorsByLandscapeTool,
    getCompetitiveLandscapeIdTool,
    getCurrentCompetitiveLandscapeTool,
  ],
});

export { competitorsAgent };
