import {
  BusinessValidation,
  MarketValidation,
  CustomerJourneyMapping,
  TargetAudienceSegmentation,
  MarketTrendAnalysis,
  CustomerNeedAnalysis,
  PricingStrategyAnalysis,
} from "../prompts/validation";
import { runResearch } from "./core";
import { saveBusinessData } from "./business";
import { saveMarketData } from "./market";
import { saveCustomerJourneyData } from "./customer-journey";
import { saveTargetAudienceData } from "./target-audience";
import { saveMarketTrendAnalysisData } from "./market-trend-analysis";
import { saveCustomerNeedAnalysisData } from "./customer-need-analysis";
import { savePricingStrategyAnalysisData } from "./pricing-strategy-analysis";
import { saveFinalVerdictData } from "./final-verdict";
import {
  FinalVerdict,
  RiskAnalysis,
  ProductMarketFitAnalysis,
} from "../prompts/validation";
import { saveRiskAnalysisData } from "./risk-analysis";
import { saveProductMarketFitAnalysisData } from "./product-market-fit-analysis";
import { prisma } from "@workspace/backend";

export const marketValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${MarketValidation}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveMarketData({
    data: researchData,
    validationId: id,
  });
};

export const finalVerdictValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const validationData = await prisma.ideaValidation.findUnique({
    where: { id },
    include: {
      marketValidation: true,
      businessValidation: true,
      CustomerJourneyMapping: true,
      TargetAudienceSegmentation: true,
      MarketTrendAnalysis: true,
      CustomerNeedAnalysis: true,
      PricingStrategyAnalysis: true,
      riskAnalysis: {
        include: {
          riskItems: true,
        },
      },
      productMarketFitAnalysis: true,
    },
  });

  if (!validationData) {
    throw new Error("Validation data not found");
  }

  const finalPrompt = `I need you to act as a principal investor and provide a final verdict on a SaaS idea.
  You will be given the original idea and the complete research data from various validation modules.
  Your task is to synthesize all this information to generate final metrics and a conclusive recommendation.

  The SaaS Idea: ${ideaPrompt}

  Here is the research data:

   Validation DATA: ${JSON.stringify(validationData)}

  ${FinalVerdict}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveFinalVerdictData(researchData, id);
};

export const businessValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${BusinessValidation}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveBusinessData({
    data: researchData,
    validationId: id,
  });
};

export const customerJourneyValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${CustomerJourneyMapping}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveCustomerJourneyData({
    data: researchData,
    validationId: id,
  });
};

export const targetAudienceValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${TargetAudienceSegmentation}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveTargetAudienceData({
    data: researchData,
    validationId: id,
  });
};

export const marketTrendAnalysisValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${MarketTrendAnalysis}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveMarketTrendAnalysisData({
    data: researchData,
    validationId: id,
  });
};

export const customerNeedAnalysisValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${CustomerNeedAnalysis}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveCustomerNeedAnalysisData({
    data: researchData,
    validationId: id,
  });
};

export const pricingStrategyAnalysisValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${PricingStrategyAnalysis}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await savePricingStrategyAnalysisData({
    data: researchData,
    validationId: id,
  });
};

export const riskAnalysisValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${RiskAnalysis}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveRiskAnalysisData({
    data: researchData,
    validationId: id,
  });
};

export const productMarketFitAnalysisValidator = async ({
  id,
  ideaPrompt,
}: {
  id: string;
  ideaPrompt: string;
}) => {
  const finalPrompt = `I need you to do a thorough very deep research.
  The aim is to validate a SaaS. Look in all places, Reddit, blogs, review websites, social media, etc.
  
  The SaaS Idea: ${ideaPrompt}
    
  ${ProductMarketFitAnalysis}
  `;

  const researchData = await runResearch(finalPrompt);
  if (!researchData) {
    throw new Error("Research task failed");
  }

  await saveProductMarketFitAnalysisData({
    data: researchData,
    validationId: id,
  });
};
