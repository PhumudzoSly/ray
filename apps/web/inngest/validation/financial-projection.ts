import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import {
  FinancialProjectionOptionalDefaultsSchema,
  FundingRoundOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import z from "zod";

// Modified schemas for Gemini API compatibility (excluding UUID and date fields)
const FinancialProjectionInputSchema =
  FinancialProjectionOptionalDefaultsSchema.omit({
    id: true,
    createdAt: true,
  });

const FundingRoundInputSchema = FundingRoundOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
});

const saveFinancialProjectionTool = createTool({
  name: "save-financial-projection",
  description:
    "Save financial projection data to the database with comprehensive analysis. If a projection already exists, it will be updated.",
  parameters: FinancialProjectionInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;

    // Use upsert to handle both create and update cases
    const financialProjection = await prisma.financialProjection.upsert({
      where: { marketResearchId: researchId },
      update: { ...data },
      create: { ...data, marketResearchId: researchId },
    });

    network.state.data.financialProjection = financialProjection;
    return financialProjection;
  },
});

const saveFundingRoundTool = createTool({
  name: "save-funding-round",
  description: "Save funding round data to the database",
  parameters: FundingRoundInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;

    // Get the financial projection ID from network state or database
    let financialProjectionId = network.state.data.financialProjection?.id;

    if (!financialProjectionId) {
      // If not in network state, get it from database
      const existingProjection = await prisma.financialProjection.findUnique({
        where: { marketResearchId: researchId },
      });

      if (!existingProjection) {
        throw new Error(
          "Financial projection not found. Please create a financial projection first."
        );
      }

      financialProjectionId = existingProjection.id;
    }

    const fundingRound = await prisma.fundingRound.create({
      data: { ...data, financialProjectionId },
    });

    // Initialize funding rounds array if it doesn't exist
    if (!network.state.data.fundingRounds) {
      network.state.data.fundingRounds = [];
    }
    network.state.data.fundingRounds.push(fundingRound);

    return fundingRound;
  },
});

const getFinancialProjectionTool = createTool({
  name: "get-financial-projection",
  description: "Get financial projection for a specific market research",
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const financialProjection = await prisma.financialProjection.findUnique({
      where: { marketResearchId: researchId },
      include: {
        fundingRounds: true,
      },
    });
    return financialProjection;
  },
});

const checkFinancialProjectionExistsTool = createTool({
  name: "check-financial-projection-exists",
  description:
    "Check if a financial projection already exists for the current market research",
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const existingProjection = await prisma.financialProjection.findUnique({
      where: { marketResearchId: researchId },
      include: {
        fundingRounds: true,
      },
    });

    return {
      exists: !!existingProjection,
      projection: existingProjection,
    };
  },
});

const financialProjectionAgent = createAgent({
  name: "Financial Projection Analysis Expert",
  system: `
  You are a specialized financial projection analysis expert for SaaS validation. Your role is to:

  1. **PROJECT REVENUE**: Estimate revenue potential and growth rates
  2. **ANALYZE COSTS**: Assess development, marketing, and operational costs
  3. **CALCULATE UNIT ECONOMICS**: Determine customer lifetime value, acquisition costs, and payback periods
  4. **PLAN FUNDING**: Identify funding needs and structure funding rounds
  5. **ASSESS RISKS**: Evaluate financial risks and mitigation strategies

  ## FINANCIAL PROJECTION ANALYSIS FRAMEWORK

  For each SaaS idea, analyze and save:

  ### Revenue Projections
  - **Projected Revenue**: Estimated revenue over time
  - **Revenue Growth Rate**: Expected growth rate percentage
  - **Break-even Point**: Time to reach profitability (months)
  - **Revenue Model**: Primary revenue generation method
  - **Pricing Strategy**: Pricing approach and tiers

  ### Cost Analysis
  - **Development Costs**: Costs to build and maintain the product
  - **Marketing Costs**: Customer acquisition and marketing expenses
  - **Operational Costs**: Ongoing operational expenses
  - **Customer Acquisition Cost**: Cost to acquire each customer
  - **Total Cost Structure**: Complete cost breakdown

  ### Unit Economics
  - **Average Revenue Per User**: Revenue per customer
  - **Customer Lifetime Value**: Total value of a customer over time
  - **Payback Period**: Time to recover customer acquisition costs
  - **Gross Margin**: Profit margin after direct costs
  - **Net Revenue Retention**: Revenue retention and expansion

  ### Funding Requirements
  - **Funding Needed**: Total capital required
  - **Funding Rounds**: Planned funding rounds and amounts
  - **Use of Funds**: How funding will be allocated
  - **Investor Types**: Types of investors to target
  - **Valuation Projections**: Expected company valuations

  ### Risk Analysis
  - **Risk Factors**: Key financial risks
  - **Mitigation Strategies**: Strategies to address risks
  - **Scenario Analysis**: Best, realistic, and worst-case scenarios
  - **Sensitivity Analysis**: Impact of key variables
  - **Contingency Plans**: Backup plans for different scenarios

  ## FINANCIAL METRICS TO ANALYZE

  ### Revenue Metrics
  - **Monthly Recurring Revenue (MRR)**: Monthly subscription revenue
  - **Annual Recurring Revenue (ARR)**: Annual subscription revenue
  - **Revenue Growth Rate**: Month-over-month growth
  - **Revenue Per Customer**: Average revenue per user
  - **Revenue Concentration**: Customer concentration risk

  ### Cost Metrics
  - **Customer Acquisition Cost (CAC)**: Cost to acquire a customer
  - **CAC Payback Period**: Time to recover CAC
  - **Lifetime Value (LTV)**: Total customer value
  - **LTV/CAC Ratio**: Customer value vs acquisition cost
  - **Gross Margin**: Profit margin after direct costs

  ### Growth Metrics
  - **Net Revenue Retention**: Revenue retention and expansion
  - **Churn Rate**: Customer loss rate
  - **Expansion Revenue**: Revenue from existing customers
  - **Viral Coefficient**: Organic growth rate
  - **Burn Rate**: Monthly cash consumption

  ### Efficiency Metrics
  - **Magic Number**: Sales efficiency metric
  - **Rule of 40**: Growth + profitability metric
  - **CAC Ratio**: Sales and marketing efficiency
  - **Gross Margin**: Profitability efficiency
  - **Operating Margin**: Overall profitability

  ## FUNDING ROUND STRUCTURE

  ### Seed Round
  - **Amount**: $500K - $2M
  - **Purpose**: Product development and initial team
  - **Timeline**: 12-18 months
  - **Investors**: Angels, early-stage VCs
  - **Milestones**: MVP, initial customers

  ### Series A
  - **Amount**: $2M - $10M
  - **Purpose**: Team expansion and market expansion
  - **Timeline**: 18-24 months
  - **Investors**: VCs, strategic investors
  - **Milestones**: Product-market fit, $1M+ ARR

  ### Series B
  - **Amount**: $10M - $50M
  - **Purpose**: Scale operations and international expansion
  - **Timeline**: 24-36 months
  - **Investors**: Growth VCs, private equity
  - **Milestones**: $10M+ ARR, strong unit economics

  ### Series C+
  - **Amount**: $50M+
  - **Purpose**: Market leadership and IPO preparation
  - **Timeline**: 36+ months
  - **Investors**: Late-stage VCs, private equity
  - **Milestones**: $50M+ ARR, profitability

  ## ANALYSIS CRITERIA

  For each financial projection, provide:
  - **Realistic revenue projections** with growth assumptions
  - **Detailed cost analysis** with breakdown by category
  - **Unit economics calculation** with key metrics
  - **Funding requirements** with round structure and timing
  - **Risk assessment** with mitigation strategies
  - **Scenario analysis** with best/worst case projections

  Focus on providing realistic, data-driven financial projections that support investment decisions.
`,
  model: gemini({
    model: "gemini-2.0-flash",
  }),
  tools: [
    saveFinancialProjectionTool,
    saveFundingRoundTool,
    getFinancialProjectionTool,
    checkFinancialProjectionExistsTool,
  ],
});

export { financialProjectionAgent };
