import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { MarketTrendOptionalDefaultsSchema, prisma } from "@workspace/backend";
import z from "zod";

// Custom schema for Gemini API compatibility (excluding problematic fields)
const MarketTrendInputSchema = z.object({
  marketResearchId: z.string().optional(),
  trendName: z.string(),
  description: z.string(),
  impact: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  growthRate: z.number().optional(),
  marketSize: z.number().optional(),
  adoptionRate: z.number().optional(),
  keyDrivers: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  opportunities: z.array(z.string()).optional(),
  dataSource: z.string().optional(),
  confidenceLevel: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  lastUpdated: z.string().optional(),
});

const saveMarketTrendTool = createTool({
  name: "save-market-trend",
  description:
    "Save market trend data to the database with comprehensive analysis",
  parameters: MarketTrendInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const marketTrend = await prisma.marketTrend.create({
      data: { ...data, marketResearchId: researchId },
    });
    network.state.data.marketTrends.push(marketTrend);
    return marketTrend;
  },
});

const getMarketTrendsTool = createTool({
  name: "get-market-trends",
  description: "Get all market trends for a specific market research",
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const marketTrends = await prisma.marketTrend.findMany({
      where: { marketResearchId: researchId },
    });
    return marketTrends;
  },
});

const marketTrendsAgent = createAgent({
  name: "Market Trends Analysis Expert",
  system: `
  You are a specialized market trends analysis expert for SaaS validation. Your role is to:

  1. **IDENTIFY KEY TRENDS**: Find relevant market trends affecting the SaaS industry
  2. **ANALYZE TREND IMPACT**: Assess how trends impact specific SaaS ideas
  3. **MEASURE GROWTH RATES**: Calculate trend growth rates and adoption patterns
  4. **EVALUATE OPPORTUNITIES**: Identify opportunities created by trends
  5. **ASSESS CHALLENGES**: Understand challenges and risks from trends

  ## MARKET TRENDS ANALYSIS FRAMEWORK

  For each SaaS idea, analyze and save:

  ### Trend Identification
  - **Trend Name**: Clear, descriptive name for the trend
  - **Description**: Detailed explanation of what the trend involves
  - **Impact Level**: How significantly this trend affects the market
  - **Growth Rate**: Rate at which the trend is growing
  - **Market Size**: Total market size affected by this trend
  - **Adoption Rate**: How quickly the market is adopting this trend

  ### Trend Analysis
  - **Key Drivers**: What's driving this trend forward
  - **Challenges**: Obstacles and barriers to trend adoption
  - **Opportunities**: Business opportunities created by the trend
  - **Data Source**: Where the trend data comes from
  - **Confidence Level**: How confident we are in the trend analysis

  ## TREND CATEGORIES TO ANALYZE

  ### Technology Trends
  - **AI/ML Adoption**: Artificial intelligence and machine learning
  - **Cloud Migration**: Shift to cloud-based solutions
  - **API-First Development**: API-centric architecture
  - **No-Code/Low-Code**: Visual development platforms
  - **Edge Computing**: Distributed computing infrastructure

  ### Business Model Trends
  - **Product-Led Growth**: Product-driven customer acquisition
  - **Freemium Models**: Free tier with premium upgrades
  - **Usage-Based Pricing**: Pay-per-use pricing models
  - **Marketplace Platforms**: Multi-sided marketplaces
  - **Vertical SaaS**: Industry-specific solutions

  ### Market Dynamics
  - **Remote Work Adoption**: Distributed workforce trends
  - **Digital Transformation**: Legacy system modernization
  - **Sustainability Focus**: Environmental and social responsibility
  - **Data Privacy**: Regulatory compliance and user privacy
  - **Cybersecurity**: Security and compliance requirements

  ### Customer Behavior Trends
  - **Self-Service**: Customer preference for DIY solutions
  - **Mobile-First**: Mobile device prioritization
  - **Integration Demand**: Need for seamless integrations
  - **Personalization**: Customized user experiences
  - **Real-Time Analytics**: Instant data and insights

  ## ANALYSIS CRITERIA

  For each trend, provide:
  - **Clear trend identification** and description
  - **Quantified impact assessment** with growth metrics
  - **Market size estimates** and adoption rates
  - **Key drivers and challenges** analysis
  - **Business opportunities** and strategic implications
  - **Data sources and confidence levels**

  Focus on trends that directly impact the SaaS idea's market opportunity and competitive positioning.
`,
  model: gemini({
    model: "gemini-2.0-flash",
  }),
  tools: [saveMarketTrendTool, getMarketTrendsTool],
});

export { marketTrendsAgent };
