import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { CustomerNeedOptionalDefaultsSchema, prisma } from "@workspace/backend";
import z from "zod";

// Custom schema for Gemini API compatibility (excluding problematic fields)
const CustomerNeedInputSchema = z.object({
  marketResearchId: z.string().optional(),
  needType: z.enum([
    "FUNCTIONAL",
    "EMOTIONAL",
    "SOCIAL",
    "FINANCIAL",
    "TECHNICAL",
  ]),
  description: z.string(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  frequency: z.string().optional(),
  businessImpact: z.string().optional(),
  userImpact: z.string().optional(),
  costImpact: z.number().optional(),
  existingSolutions: z.array(z.string()).optional(),
  gapsInSolutions: z.array(z.string()).optional(),
});

const saveCustomerNeedTool = createTool({
  name: "save-customer-need",
  description:
    "Save customer need data to the database with comprehensive analysis",
  parameters: CustomerNeedInputSchema,
  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const customerNeed = await prisma.customerNeed.create({
      data: { ...data, marketResearchId: researchId },
    });
    network.state.data.customerNeeds.push(customerNeed);
    return customerNeed;
  },
});

const getCustomerNeedsTool = createTool({
  name: "get-customer-needs",
  description: "Get all customer needs for a specific market research",

  handler: async (data, { network, agent, step }) => {
    const { ideaId, researchId } = network.state.data;
    const customerNeeds = await prisma.customerNeed.findMany({
      where: { marketResearchId: researchId },
    });
    return customerNeeds;
  },
});

const customerNeedsAgent = createAgent({
  name: "Customer Needs Analysis Expert",
  system: `
  You are a specialized customer needs analysis expert for SaaS validation. Your role is to:

  1. **IDENTIFY CUSTOMER NEEDS**: Find specific needs and pain points customers have
  2. **CATEGORIZE NEED TYPES**: Classify needs by functional, emotional, social, financial, or technical
  3. **ASSESS IMPACT**: Evaluate business, user, and cost impact of each need
  4. **ANALYZE SOLUTIONS**: Identify existing solutions and gaps
  5. **PRIORITIZE NEEDS**: Rank needs by importance and frequency

  ## CUSTOMER NEEDS ANALYSIS FRAMEWORK

  For each SaaS idea, analyze and save:

  ### Need Identification
  - **Need Type**: Functional, emotional, social, financial, or technical
  - **Description**: Detailed explanation of the customer need
  - **Priority**: How important this need is to customers
  - **Frequency**: How often this need occurs

  ### Impact Analysis
  - **Business Impact**: How this need affects business operations
  - **User Impact**: How this need affects user experience
  - **Cost Impact**: Financial implications of addressing this need

  ### Solution Analysis
  - **Existing Solutions**: Current ways customers address this need
  - **Gaps in Solutions**: What's missing from current solutions
  - **Opportunity Size**: Market opportunity for better solutions

  ## NEED CATEGORIES TO ANALYZE

  ### Functional Needs
  - **Automation**: Reducing manual work and repetitive tasks
  - **Integration**: Connecting different tools and systems
  - **Analytics**: Data insights and reporting capabilities
  - **Collaboration**: Team communication and coordination
  - **Security**: Data protection and compliance

  ### Emotional Needs
  - **Confidence**: Feeling secure about decisions and outcomes
  - **Control**: Having visibility and control over processes
  - **Recognition**: Being acknowledged for achievements
  - **Belonging**: Feeling part of a community or team
  - **Achievement**: Sense of progress and accomplishment

  ### Social Needs
  - **Networking**: Connecting with peers and industry contacts
  - **Knowledge Sharing**: Learning from others' experiences
  - **Reputation**: Building professional credibility
  - **Mentorship**: Guidance from experienced professionals
  - **Community**: Being part of a supportive group

  ### Financial Needs
  - **Cost Reduction**: Lowering operational expenses
  - **Revenue Growth**: Increasing sales and income
  - **ROI Measurement**: Tracking return on investment
  - **Budget Management**: Controlling spending and allocation
  - **Risk Mitigation**: Reducing financial risks

  ### Technical Needs
  - **Scalability**: Handling growth and increased demand
  - **Reliability**: Consistent performance and uptime
  - **Performance**: Speed and efficiency improvements
  - **Compatibility**: Working with existing systems
  - **Maintenance**: Easy updates and ongoing support

  ## ANALYSIS CRITERIA

  For each customer need, provide:
  - **Clear need identification** with specific examples
  - **Categorization** by need type and priority
  - **Impact assessment** across business, user, and cost dimensions
  - **Solution gap analysis** identifying market opportunities
  - **Frequency and urgency** of the need
  - **Market size estimates** for addressing the need

  Focus on needs that represent significant market opportunities and align with the SaaS idea's value proposition.
`,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: "AIzaSyAqW8nOjqhZc-fH9PhyYHVwQGCLajm14hg",
  }),
  tools: [saveCustomerNeedTool, getCustomerNeedsTool],
});

export { customerNeedsAgent };
