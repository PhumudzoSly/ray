import { google } from "@ai-sdk/google";
import {
  RiskAnalysisOptionalDefaultsSchema,
  RiskItemOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

export const saveRiskAnalysisData = async ({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) => {
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash-lite",
    prompt: `
    As a risk analysis expert, analyze and structure the following data into a comprehensive report. 
    
    Instructions:
    1. Evaluate the provided data thoroughly
    2. Fill any gaps with accurate, relevant information
    3. Maintain consistency with the original data points
    4. Structure findings into a clear risk analysis and individual risk items
    5. Ensure all conclusions are data-driven and logically sound

    Source data for analysis:
    ${JSON.stringify(data, null, 2)}

    Please provide a well-structured response following the schema requirements.
    `,
    schema: z.object({
      riskAnalysis: RiskAnalysisOptionalDefaultsSchema.omit({
        createdAt: true,
        id: true,
        updatedAt: true,
        validationId: true,
      }),
      riskItems: z.array(
        RiskItemOptionalDefaultsSchema.omit({
          createdAt: true,
          id: true,
          riskAnalysisId: true,
        })
      ),
    }),
  });

  const riskAnalysis = await prisma.riskAnalysis.create({
    data: {
      ...object.riskAnalysis,
      validationId: validationId,
      riskItems: {
        create: object.riskItems.map((item) => item),
      },
    },
  });

  return riskAnalysis;
};
