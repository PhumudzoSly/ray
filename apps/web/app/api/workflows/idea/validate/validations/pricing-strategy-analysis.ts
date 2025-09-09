import { google } from "@ai-sdk/google";
import {
  PricingStrategyAnalysisOptionalDefaultsSchema,
  PricingTierOptionalDefaultsSchema,
  CompetitorPricingOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const savePricingStrategyAnalysisData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash-lite",
    prompt: `
    As a pricing strategy expert, analyze and structure the following data into a comprehensive report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into a clear pricing strategy analysis, pricing tiers, and competitor pricing
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      pricingStrategyAnalysis:
        PricingStrategyAnalysisOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          updatedAt: true,
        }),
      pricingTiers: z.array(
        PricingTierOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          pricingStrategyAnalysisId: true,
        })
      ),
      competitorPricings: z.array(
        CompetitorPricingOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          pricingStrategyAnalysisId: true,
        })
      ),
    }),
  });

  const pricingStrategyAnalysis = await prisma.pricingStrategyAnalysis.create({
    data: {
      ...object.pricingStrategyAnalysis,
      validationId,
    },
  });

  await Promise.all([
    prisma.pricingTier.createMany({
      data: object.pricingTiers.map((tier) => ({
        ...tier,
        pricingStrategyAnalysisId: pricingStrategyAnalysis.id,
      })),
    }),
    prisma.competitorPricing.createMany({
      data: object.competitorPricings.map((pricing) => ({
        ...pricing,
        pricingStrategyAnalysisId: pricingStrategyAnalysis.id,
      })),
    }),
  ]);
};
