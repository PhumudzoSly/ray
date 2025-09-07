import { serve } from "@upstash/workflow/nextjs";
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

export const { POST } = serve(async (context) => {
  //

  const payload = context.requestPayload as any;

  const validation = await context.run("init-validation", async () => {
    const data = await initValidation(payload?.ideaId as any);
    return data;
  });

  const idea = await context.run("summarize-idea", async () => {
    const summary = await summarizeIdea(validation.id);
    return summary;
  });

  await context.sleep("rest-0", 60);

  await context.run("validate-market", async () => {
    await marketValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-1", 60);

  await context.run("validate-business", async () => {
    await businessValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-2", 60);

  await context.run("validate-customer-journey", async () => {
    await customerJourneyValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-3", 60);

  await context.run("validate-target-audience", async () => {
    await targetAudienceValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-4", 60);

  await context.run("validate-market-trends", async () => {
    await marketTrendAnalysisValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-5", 60);

  await context.run("validate-customer-needs", async () => {
    await customerNeedAnalysisValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-6", 60);

  await context.run("validate-pricing-strategy", async () => {
    await pricingStrategyAnalysisValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-7", 60);

  await context.run("validate-risk-analysis", async () => {
    await riskAnalysisValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-8", 60);

  await context.run("validate-product-market-fit", async () => {
    await productMarketFitAnalysisValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });

  await context.sleep("rest-9", 60);

  await context.run("generate-final-verdict", async () => {
    await finalVerdictValidator({
      id: validation.id,
      ideaPrompt: idea,
    });
  });
});
