import {
  CustomerJourneyMappingOptionalDefaultsSchema,
  JourneyStageOptionalDefaultsSchema,
  TouchpointOptionalDefaultsSchema,
  JourneyPainPointOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function saveCustomerJourneyData({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash-lite",
    prompt: `
    As a customer journey mapping expert, analyze and structure the following data into a comprehensive customer journey analysis report.
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, customer experience-relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into clear journey stages, touchpoints, and pain points
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      customerJourneyData: CustomerJourneyMappingOptionalDefaultsSchema.omit({
        createdAt: true,
        id: true,
        updatedAt: true,
      }),
      journeyStages: z.array(
        JourneyStageOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          customerJourneyMappingId: true,
        })
      ),
      touchpoints: z.array(
        TouchpointOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          customerJourneyMappingId: true,
        })
      ),
      journeyPainPoints: z.array(
        JourneyPainPointOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          customerJourneyMappingId: true,
        })
      ),
    }),
  });

  const customerJourneyMapping = await prisma.customerJourneyMapping.create({
    data: {
      ...object.customerJourneyData,
      validationId,
    },
  });

  await Promise.all([
    prisma.journeyStage.createMany({
      data: object.journeyStages.map((stage) => ({
        ...stage,
        customerJourneyMappingId: customerJourneyMapping.id,
      })),
    }),

    prisma.touchpoint.createMany({
      data: object.touchpoints.map((touchpoint) => ({
        ...touchpoint,
        customerJourneyMappingId: customerJourneyMapping.id,
      })),
    }),

    prisma.journeyPainPoint.createMany({
      data: object.journeyPainPoints.map((painPoint) => ({
        ...painPoint,
        customerJourneyMappingId: customerJourneyMapping.id,
      })),
    }),
  ]);

  return customerJourneyMapping;
}
