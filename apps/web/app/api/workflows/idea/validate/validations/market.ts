import { google } from "@ai-sdk/google";
import {
  MarketInsightOptionalDefaultsSchema,
  MarketRegionScoreOptionalDefaultsSchema,
  MarketValidationOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const saveMarketData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash-lite"),
    prompt: `
    As a market analysis expert, analyze and structure the following data into a comprehensive market validation report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, market-relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into clear market insights and regional scores
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      marketData: MarketValidationOptionalDefaultsSchema.omit({
        createdAt: true,
        id: true,
        updatedAt: true,
      }),
      marketInsight: z.array(
        MarketInsightOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          marketValidationId: true,
        })
      ),
      marketRegionScore: z.array(
        MarketRegionScoreOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          marketValidationId: true,
        })
      ),
    }),
  });

  const market = await prisma.marketValidation.create({
    data: {
      ...object.marketData,
      validationId,
    },
  });

  await Promise.all([
    prisma.marketInsight.createMany({
      data: object.marketInsight.map((insight) => ({
        ...insight,
        marketValidationId: market.id,
      })),
    }),

    prisma.marketRegionScore.createMany({
      data: object.marketRegionScore.map((regionScore) => ({
        ...regionScore,
        marketValidationId: market.id,
      })),
    }),
  ]);
};
