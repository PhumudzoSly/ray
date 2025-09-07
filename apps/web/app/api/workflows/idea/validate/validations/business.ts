import { google } from "@ai-sdk/google";
import {
  AcquisitionChannelOptionalDefaultsSchema,
  BusinessInsightOptionalDefaultsSchema,
  BusinessValidationOptionalDefaultsSchema,
  MonthlyProjectionOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const saveBusinessData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash-lite"),
    prompt: `
    As a business analysis expert, analyze and structure the following data into a comprehensive business validation report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly for business viability
    2. Fill any gaps with accurate, business-relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into clear business insights, financial projections, and acquisition channels
    5. Ensure all conclusions are data-driven and logically sound
    6. Focus on unit economics, revenue models, and go-to-market strategies

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      businessData: BusinessValidationOptionalDefaultsSchema.omit({
        createdAt: true,
        id: true,
        updatedAt: true,
      }),
      businessInsights: z.array(
        BusinessInsightOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          businessValidationId: true,
        })
      ),
      monthlyProjections: z.array(
        MonthlyProjectionOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          businessValidationId: true,
        })
      ),
      acquisitionChannels: z.array(
        AcquisitionChannelOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          businessValidationId: true,
        })
      ),
    }),
  });

  const business = await prisma.businessValidation.create({
    data: {
      ...object.businessData,
      validationId,
    },
  });

  await Promise.all([
    prisma.businessInsight.createMany({
      data: object.businessInsights.map((insight) => ({
        ...insight,
        businessValidationId: business.id,
      })),
    }),

    prisma.monthlyProjection.createMany({
      data: object.monthlyProjections.map((projection) => ({
        ...projection,
        businessValidationId: business.id,
      })),
    }),

    prisma.acquisitionChannel.createMany({
      data: object.acquisitionChannels.map((channel) => ({
        ...channel,
        businessValidationId: business.id,
      })),
    }),
  ]);
};