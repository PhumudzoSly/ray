import {
  createNetwork,
  gemini,
  getDefaultRoutingAgent,
} from "@inngest/agent-kit";
import { ideaAnalysisAgent } from "./analysis";
import { ideaResearcher } from "./researcher";
import { competitorsAgent } from "./competitors";
import { dataValidatorAgent } from "./data-validator";
import { targetAudienceAgent } from "./target-audience";
import { marketTrendsAgent } from "./market-trends";
import { customerNeedsAgent } from "./customer-needs";
import { competitiveLandscapeAgent } from "./competitive-landscape";
import { validationInsightsAgent } from "./validation-insights";
import { marketSignalsAgent } from "./market-signals";
import { validationScorecardAgent } from "./validation-scorecard";
import { financialProjectionAgent } from "./financial-projection";
import { technologyAssessmentAgent } from "./technology-assessment";
import { regulatoryComplianceAgent } from "./regulatory-compliance";

export const ideaValidator = createNetwork({
  agents: [
    competitorsAgent,
    dataValidatorAgent,
    targetAudienceAgent,
    marketTrendsAgent,
    customerNeedsAgent,
    competitiveLandscapeAgent,
    validationInsightsAgent,
    marketSignalsAgent,
    validationScorecardAgent,
    financialProjectionAgent,
    technologyAssessmentAgent,
    regulatoryComplianceAgent,
  ],
  name: "SaaS Idea Validation Network",
  description:
    "This network is used to validate SaaS ideas. It includes comprehensive data validation, market research, competitor analysis, and idea analysis capabilities.",
  defaultModel: gemini({
    model: "gemini-2.0-flash",
  }),
  maxIter: 400,
});
