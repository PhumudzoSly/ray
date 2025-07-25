import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import {
  CompetitiveLandscapeOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import z from "zod";

// Custom schema for Gemini API compatibility (excluding problematic fields)
const CompetitiveLandscapeInputSchema = z.object({
  marketResearchId: z.string().optional(),
  competitiveIntensity: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  marketPositioning: z.string().optional(),
  differentiationOpportunities: z.array(z.string()).optional(),
  competitiveAdvantage: z.string().optional(),
  totalMarketShare: z.number().optional(),
  topCompetitors: z.number().int().optional(),
  marketConcentration: z.number().optional(),
  entryBarriers: z.array(z.string()).optional(),
  exitBarriers: z.array(z.string()).optional(),
  switchingCosts: z.number().optional(),
  emergingThreats: z.array(z.string()).optional(),
  marketDisruptions: z.array(z.string()).optional(),
});

const saveCompetitiveLandscapeTool = createTool({
  name: "save-competitive-landscape",
  description:
    "Save competitive landscape data to the database with comprehensive analysis. If a landscape already exists, it will be updated.",
  parameters: CompetitiveLandscapeInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;

    // Use upsert to handle both create and update cases
    const competitiveLandscape = await prisma.competitiveLandscape.upsert({
      where: { marketResearchId: researchId },
      update: { ...data },
      create: { ...data, marketResearchId: researchId },
    });

    network.state.data.competitiveLandscape = competitiveLandscape;
    network.state.data.competitiveLandscapeId = competitiveLandscape.id;
    return competitiveLandscape;
  },
});

const getCompetitiveLandscapeTool = createTool({
  name: "get-competitive-landscape",
  description: "Get competitive landscape for a specific market research",
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const competitiveLandscape = await prisma.competitiveLandscape.findUnique({
      where: { marketResearchId: researchId },
      include: {
        competitors: true,
        competitiveMoves: true,
      },
    });
    return competitiveLandscape;
  },
});

const checkCompetitiveLandscapeExistsTool = createTool({
  name: "check-competitive-landscape-exists",
  description:
    "Check if a competitive landscape already exists for the current market research",
  parameters: z.object({}),
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const existingLandscape = await prisma.competitiveLandscape.findUnique({
      where: { marketResearchId: researchId },
    });

    return {
      exists: !!existingLandscape,
      landscape: existingLandscape,
    };
  },
});

const competitiveLandscapeAgent = createAgent({
  name: "Competitive Landscape Analysis Expert",
  system: `
  You are a specialized competitive landscape analysis expert for SaaS validation. Your role is to:

  1. **ANALYZE COMPETITIVE INTENSITY**: Assess the level of competition in the market
  2. **EVALUATE MARKET POSITIONING**: Understand how companies position themselves
  3. **IDENTIFY DIFFERENTIATION OPPORTUNITIES**: Find gaps and unique positioning opportunities
  4. **ASSESS MARKET SHARE**: Analyze market concentration and distribution
  5. **EVALUATE BARRIERS**: Understand entry and exit barriers

  ## COMPETITIVE LANDSCAPE ANALYSIS FRAMEWORK

  For each SaaS idea, analyze and save:

  ### Overall Market Analysis
  - **Competitive Intensity**: Level of competition (low, medium, high, very high)
  - **Market Positioning**: How companies position themselves in the market
  - **Differentiation Opportunities**: Areas where unique value can be created
  - **Competitive Advantage**: Potential sources of competitive advantage

  ### Market Share Analysis
  - **Total Market Share**: Percentage of total market controlled by major players
  - **Top Competitors**: Number of major competitors in the market
  - **Market Concentration**: Herfindahl-Hirschman Index or similar concentration measure
  - **Market Distribution**: How market share is distributed among players

  ### Competitive Dynamics
  - **Entry Barriers**: Obstacles preventing new competitors from entering
  - **Exit Barriers**: Factors preventing companies from leaving the market
  - **Switching Costs**: Costs customers face when switching between solutions
  - **Emerging Threats**: New competitive threats on the horizon
  - **Market Disruptions**: Potential disruptive forces in the market

  ## COMPETITIVE LANDSCAPE TYPES

  ### Fragmented Markets
  - **Characteristics**: Many small competitors, no dominant player
  - **Opportunities**: Easy entry, room for differentiation
  - **Challenges**: Hard to achieve scale, price competition

  ### Concentrated Markets
  - **Characteristics**: Few large competitors dominate
  - **Opportunities**: Clear market leaders to learn from
  - **Challenges**: Hard to compete with established players

  ### Emerging Markets
  - **Characteristics**: New market with few established players
  - **Opportunities**: First-mover advantage, rapid growth
  - **Challenges**: Market uncertainty, customer education needed

  ### Mature Markets
  - **Characteristics**: Established players, slow growth
  - **Opportunities**: Proven market, stable customer base
  - **Challenges**: Hard to differentiate, price competition

  ## ANALYSIS CRITERIA

  For competitive landscape analysis, provide:
  - **Comprehensive market overview** with competitive intensity assessment
  - **Market positioning analysis** identifying positioning strategies
  - **Differentiation opportunities** and competitive advantage sources
  - **Market share analysis** with concentration metrics
  - **Barrier assessment** for entry and exit
  - **Threat identification** and disruption potential
  - **Strategic recommendations** for competitive positioning

  Focus on actionable insights that can inform competitive strategy and market entry decisions.
`,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: "AIzaSyAqW8nOjqhZc-fH9PhyYHVwQGCLajm14hg",
  }),
  tools: [
    saveCompetitiveLandscapeTool,
    getCompetitiveLandscapeTool,
    checkCompetitiveLandscapeExistsTool,
  ],
});

export { competitiveLandscapeAgent };
