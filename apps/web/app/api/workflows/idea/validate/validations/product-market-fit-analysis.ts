import { google } from "@ai-sdk/google";
import {
  PMFFeedbackOptionalDefaultsSchema,
  PMFMetricOptionalDefaultsSchema,
  ProductMarketFitAnalysisOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const saveProductMarketFitAnalysisData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash-lite",
    prompt: `
    As a product-market fit analysis expert, analyze and structure the following data into a comprehensive report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into clear PMF metrics and feedback
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      productMarketFitData: ProductMarketFitAnalysisOptionalDefaultsSchema.omit(
        {
          createdAt: true,
          id: true,
          updatedAt: true,
        }
      ),
      pmfMetrics: z.array(
        PMFMetricOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          productMarketFitAnalysisId: true,
        })
      ),
      pmfFeedback: z.array(
        PMFFeedbackOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          productMarketFitAnalysisId: true,
        })
      ),
    }),
  });

  const productMarketFitAnalysis = await prisma.productMarketFitAnalysis.create(
    {
      data: {
        ...object.productMarketFitData,
        validationId,
      },
    }
  );

  await Promise.all([
    prisma.pMFMetric.createMany({
      data: object.pmfMetrics.map((metric) => ({
        ...metric,
        productMarketFitAnalysisId: productMarketFitAnalysis.id,
      })),
    }),

    prisma.pMFFeedback.createMany({
      data: object.pmfFeedback.map((feedback) => ({
        ...feedback,
        productMarketFitAnalysisId: productMarketFitAnalysis.id,
      })),
    }),
  ]);

  return productMarketFitAnalysis;
};
