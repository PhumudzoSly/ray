import { google } from "@ai-sdk/google";
import {
  CustomerNeedAnalysisOptionalDefaultsSchema,
  CustomerNeedOptionalDefaultsSchema,
  PainPointOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const saveCustomerNeedAnalysisData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash-lite",
    prompt: `
    As a customer need analysis expert, analyze and structure the following data into a comprehensive report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into a clear customer need analysis, individual needs, and pain points
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      customerNeedAnalysis: CustomerNeedAnalysisOptionalDefaultsSchema.omit({
        createdAt: true,
        id: true,
        updatedAt: true,
      }),
      customerNeeds: z.array(
        CustomerNeedOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          customerNeedAnalysisId: true,
        })
      ),
      painPoints: z.array(
        PainPointOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          customerNeedAnalysisId: true,
        })
      ),
    }),
  });

  const customerNeedAnalysis = await prisma.customerNeedAnalysis.create({
    data: {
      ...object.customerNeedAnalysis,
      validationId,
    },
  });

  await Promise.all([
    prisma.customerNeed.createMany({
      data: object.customerNeeds.map((need) => ({
        ...need,
        customerNeedAnalysisId: customerNeedAnalysis.id,
      })),
    }),
    prisma.painPoint.createMany({
      data: object.painPoints.map((painPoint) => ({
        ...painPoint,
        customerNeedAnalysisId: customerNeedAnalysis.id,
      })),
    }),
  ]);
};
