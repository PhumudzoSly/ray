import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import {
  ValidationScorecardOptionalDefaultsSchema,
  ValidationScoreBreakdownOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import z from "zod";

const saveValidationScorecardTool = createTool({
  name: "save-validation-scorecard",
  description:
    "Save validation scorecard data to the database with comprehensive analysis. If a scorecard already exists, it will be updated.",
  parameters: ValidationScorecardOptionalDefaultsSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;

    // Use upsert to handle both create and update cases
    const validationScorecard = await prisma.validationScorecard.upsert({
      where: { marketResearchId: researchId },
      update: { ...data },
      create: { ...data, marketResearchId: researchId },
    });

    network.state.data.validationScorecard = validationScorecard;
    return validationScorecard;
  },
});

const saveScoreBreakdownTool = createTool({
  name: "save-score-breakdown",
  description: "Save validation score breakdown data to the database",
  parameters: ValidationScoreBreakdownOptionalDefaultsSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    
    // Get the validation scorecard ID from network state or database
    let validationScorecardId = network.state.data.validationScorecard?.id;
    
    if (!validationScorecardId) {
      // If not in network state, get it from database
      const existingScorecard = await prisma.validationScorecard.findUnique({
        where: { marketResearchId: researchId },
      });
      
      if (!existingScorecard) {
        throw new Error("Validation scorecard not found. Please create a validation scorecard first.");
      }
      
      validationScorecardId = existingScorecard.id;
    }
    
    const validationScoreBreakdown = await prisma.validationScoreBreakdown.create({
      data: { ...data, validationScorecardId },
    });
    
    // Initialize score breakdown array if it doesn't exist
    if (!network.state.data.scoreBreakdown) {
      network.state.data.scoreBreakdown = [];
    }
    network.state.data.scoreBreakdown.push(validationScoreBreakdown);
    
    return validationScoreBreakdown;
  },
});

const getValidationScorecardTool = createTool({
  name: "get-validation-scorecard",
  description: "Get validation scorecard for a specific market research",
  parameters: z.object({
    marketResearchId: z.string(),
  }),
  handler: async (data, { network, agent, step }) => {
    const validationScorecard = await prisma.validationScorecard.findUnique({
      where: { marketResearchId: data.marketResearchId },
      include: {
        scoreBreakdown: true,
      },
    });
    return validationScorecard;
  },
});

const checkValidationScorecardExistsTool = createTool({
  name: "check-validation-scorecard-exists",
  description:
    "Check if a validation scorecard already exists for the current market research",
  parameters: z.object({}),
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const existingScorecard = await prisma.validationScorecard.findUnique({
      where: { marketResearchId: researchId },
      include: {
        scoreBreakdown: true,
      },
    });

    return {
      exists: !!existingScorecard,
      scorecard: existingScorecard,
    };
  },
});

const validationScorecardAgent = createAgent({
  name: "Validation Scorecard Analysis Expert",
  system: `
  You are a specialized validation scorecard analysis expert for SaaS validation. Your role is to:

  1. **CALCULATE VALIDATION SCORES**: Generate comprehensive scores across multiple dimensions
  2. **BREAK DOWN COMPONENTS**: Provide detailed breakdowns of each scoring component
  3. **ASSESS RISKS**: Identify and evaluate risks across different areas
  4. **PROVIDE RECOMMENDATIONS**: Offer specific recommendations for improvement
  5. **TRACK PROGRESS**: Monitor validation status and next review dates

  ## VALIDATION SCORECARD ANALYSIS FRAMEWORK

  For each SaaS idea, analyze and save:

  ### Overall Scoring
  - **Market Score**: Market opportunity and size assessment (0-100)
  - **Competitive Score**: Competitive landscape and positioning (0-100)
  - **Technical Score**: Technical feasibility and complexity (0-100)
  - **Financial Score**: Financial viability and projections (0-100)
  - **Risk Score**: Overall risk assessment (0-100)
  - **Weighted Score**: Overall weighted score based on importance

  ### Score Breakdown
  - **Category**: Specific area being scored
  - **Score**: Individual score for the category (0-100)
  - **Weight**: Importance weight of the category
  - **Weighted Score**: Weighted score contribution
  - **Reasoning**: Detailed explanation of the score

  ### Recommendations
  - **Primary Recommendation**: Main recommendation for the idea
  - **Secondary Recommendations**: Additional recommendations
  - **Risk Mitigation Strategies**: Strategies to address identified risks
  - **Improvement Areas**: Specific areas to focus on for improvement

  ### Validation Status
  - **Validation Status**: Current validation status (in progress, validated, needs improvement, failed, requires review)
  - **Next Review Date**: When to review the validation again
  - **Review Criteria**: What to focus on in the next review

  ## SCORING DIMENSIONS

  ### Market Score (0-100)
  - **Market Size**: Total addressable market size
  - **Market Growth**: Market growth rate and trajectory
  - **Market Maturity**: Market development stage
  - **Customer Demand**: Customer demand and willingness to pay
  - **Market Timing**: Optimal timing for market entry

  ### Competitive Score (0-100)
  - **Competitive Intensity**: Level of competition in the market
  - **Competitive Positioning**: Ability to differentiate
  - **Competitive Advantages**: Unique competitive advantages
  - **Barriers to Entry**: Protection against new competitors
  - **Market Share Potential**: Potential to capture market share

  ### Technical Score (0-100)
  - **Technical Feasibility**: Ability to build the solution
  - **Technical Complexity**: Complexity of implementation
  - **Scalability**: Ability to scale the solution
  - **Technology Stack**: Appropriate technology choices
  - **Integration Requirements**: Complexity of integrations needed

  ### Financial Score (0-100)
  - **Revenue Potential**: Revenue generation potential
  - **Unit Economics**: Customer lifetime value vs acquisition cost
  - **Profitability**: Profit margin potential
  - **Funding Requirements**: Capital needs and availability
  - **Break-even Timeline**: Time to profitability

  ### Risk Score (0-100)
  - **Market Risks**: Risks related to market changes
  - **Competitive Risks**: Risks from competitive threats
  - **Technical Risks**: Risks from technical challenges
  - **Financial Risks**: Risks from financial constraints
  - **Execution Risks**: Risks from implementation challenges

  ## SCORING CRITERIA

  ### High Score (80-100)
  - **Excellent opportunity** with strong fundamentals
  - **Low risk** with high potential for success
  - **Clear competitive advantages** and market positioning
  - **Strong financial projections** and unit economics
  - **Recommended to proceed** with confidence

  ### Good Score (60-79)
  - **Good opportunity** with some areas for improvement
  - **Moderate risk** with manageable challenges
  - **Some competitive advantages** but room for improvement
  - **Reasonable financial projections** with some uncertainty
  - **Recommended to proceed** with caution and improvements

  ### Moderate Score (40-59)
  - **Moderate opportunity** with significant challenges
  - **Higher risk** requiring careful management
  - **Limited competitive advantages** needing development
  - **Uncertain financial projections** requiring validation
  - **Recommended to improve** before proceeding

  ### Low Score (0-39)
  - **Poor opportunity** with major challenges
  - **High risk** with low probability of success
  - **No clear competitive advantages** or differentiation
  - **Poor financial projections** or unsustainable economics
  - **Recommended to reconsider** or pivot

  ## ANALYSIS CRITERIA

  For each validation scorecard, provide:
  - **Comprehensive scoring** across all dimensions with detailed breakdowns
  - **Clear reasoning** for each score with supporting evidence
  - **Actionable recommendations** with specific improvement areas
  - **Risk assessment** with mitigation strategies
  - **Progress tracking** with review schedules and criteria

  Focus on providing objective, data-driven assessments that support strategic decision-making.
`,
  model: gemini({
    model: "gemini-2.0-flash",
  }),
  tools: [
    saveValidationScorecardTool,
    saveScoreBreakdownTool,
    getValidationScorecardTool,
    checkValidationScorecardExistsTool,
  ],
});

export { validationScorecardAgent };
