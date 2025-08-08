import { inngestClient } from "@/lib/inngest";
import { initValidation, summarizeIdea } from "./validations/core";
import {
  marketValidator,
  businessValidator,
  customerJourneyValidator,
  targetAudienceValidator,
  marketTrendAnalysisValidator,
  customerNeedAnalysisValidator,
  pricingStrategyAnalysisValidator,
  riskAnalysisValidator,
  productMarketFitAnalysisValidator,
  finalVerdictValidator,
} from "./validations/agent";

// Main deep research function
export const deepResearchAgent = inngestClient.createFunction(
  {
    id: "deep-research-agent",
    name: "Deep Research SaaS Validation Agent",
    concurrency: {
      limit: 10, // Allow up to 10 concurrent research sessions
    },
  },
  { event: "deep-research/start" },
  async ({ step, event }) => {
    const { ideaId } = event.data as {
      ideaId: string;
    };

    const validation = await step.run("init-validation", async () => {
      const data = await initValidation(ideaId);
      return data;
    });

    await step.sleep("prep-idea", "2 mins");

    const idea = await step.run("summarize-idea", async () => {
      const summary = await summarizeIdea(validation.id);
      return summary;
    });

    await step.sleep("rest", "2 mins");

    await step.run("validate-market", async () => {
      await marketValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-1", "2 mins");

    await step.run("validate-business", async () => {
      await businessValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-2", "2 mins");

    await step.run("validate-customer-journey", async () => {
      await customerJourneyValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-3", "2 mins");

    await step.run("validate-target-audience", async () => {
      await targetAudienceValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-4", "2 mins");

    await step.run("validate-market-trends", async () => {
      await marketTrendAnalysisValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-5", "2 mins");

    await step.run("validate-customer-needs", async () => {
      await customerNeedAnalysisValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-6", "2 mins");

    await step.run("validate-pricing-strategy", async () => {
      await pricingStrategyAnalysisValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-7", "2 mins");

    await step.run("validate-risk-analysis", async () => {
      await riskAnalysisValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-8", "2 mins");

    await step.run("validate-product-market-fit", async () => {
      await productMarketFitAnalysisValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });

    await step.sleep("rest-9", "2 mins");

    await step.run("generate-final-verdict", async () => {
      await finalVerdictValidator({
        id: validation.id,
        ideaPrompt: idea,
      });
    });
  }
);
