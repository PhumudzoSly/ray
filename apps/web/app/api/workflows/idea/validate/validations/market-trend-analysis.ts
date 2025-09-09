import { google } from "@ai-sdk/google";
import {
  MarketTrendAnalysisOptionalDefaultsSchema,
  MarketTrendOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const saveMarketTrendAnalysisData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash-lite",
    prompt: `
    As a market analysis expert, analyze and structure the following data into a comprehensive market trend analysis report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, market-relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into a clear market trend analysis and individual trends
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      marketTrendAnalysis: MarketTrendAnalysisOptionalDefaultsSchema.omit({
        createdAt: true,
        id: true,
        updatedAt: true,
      }),
      marketTrends: z.array(
        MarketTrendOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          marketTrendAnalysisId: true,
        })
      ),
    }),
  });

  const marketTrendAnalysis = await prisma.marketTrendAnalysis.create({
    data: {
      ...object.marketTrendAnalysis,
      validationId,
    },
  });

  await prisma.marketTrend.createMany({
    data: object.marketTrends.map((trend) => ({
      ...trend,
      marketTrendAnalysisId: marketTrendAnalysis.id,
    })),
  });
};
