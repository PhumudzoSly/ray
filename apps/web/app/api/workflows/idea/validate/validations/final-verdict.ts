import {
  IdeaValidationOptionalDefaultsSchema,
  prisma,
  ValidationMetricsOptionalDefaultsSchema,
} from "@workspace/backend";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

export async function saveFinalVerdictData(
  researchData: any,
  validationId: string
) {
  try {
    const { object: validationMetrics } = await generateObject({
      model: google("gemini-2.0-flash-lite"),
      schema: ValidationMetricsOptionalDefaultsSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        validationId: true,
      }),
      prompt: researchData,
    });

    const { object: ideaValidation } = await generateObject({
      model: google("gemini-2.0-flash-lite"),
      schema: IdeaValidationOptionalDefaultsSchema.omit({
        id: true,
        completedAt: true,
        lastUpdatedAt: true,
        startedAt: true,
        dataSourcesUpdated: true,
        version: true,
        parentValidationId: true,
        ideaId: true,
      }),
      prompt: researchData,
    });

    if (!validationMetrics || !ideaValidation) {
      throw new Error("Failed to generate final verdict data.");
    }

    const createdMetrics = await prisma.validationMetrics.create({
      data: {
        ...validationMetrics,
        validationId: validationId,
      },
    });

    const updatedValidation = await prisma.ideaValidation.update({
      where: { id: validationId },
      data: {
        overallScore: ideaValidation.overallScore,
        confidenceLevel: ideaValidation.confidenceLevel,
        overallStatus: ideaValidation.overallStatus,
        completedAt: new Date(),
        validationProgress: 100,
      },
    });

    return { createdMetrics, updatedValidation };
  } catch (error) {
    console.error("Error saving final verdict data:", error);
    throw error;
  }
}
