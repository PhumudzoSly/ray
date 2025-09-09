import { generateObject } from "ai";
import { z } from "zod";
import {
  TargetAudienceSegmentationOptionalDefaultsSchema,
  AudienceSegmentOptionalDefaultsSchema,
  prisma,
} from "@workspace/backend";
import { google } from "@ai-sdk/google";

const TargetAudienceSegmentationSchema = z.object({
  targetAudienceSegmentation: TargetAudienceSegmentationOptionalDefaultsSchema,
  audienceSegments: z.array(AudienceSegmentOptionalDefaultsSchema),
});

export async function saveTargetAudienceData({
  validationId,
  data,
}: {
  validationId: string;
  data: any;
}) {
  const model = "google/gemini-2.5-flash-lite";

  const { object } = await generateObject({
    model,
    schema: TargetAudienceSegmentationSchema,
    prompt: `Based on the following research data, generate structured target audience segmentation data:

${data}

Please provide:
1. Target audience segmentation overview with primary segment, total segments, market size, and scoring metrics
2. Individual audience segments with detailed characteristics, needs, and profitability scores

Ensure all numeric scores are between 0-100 and segment sizes are realistic market numbers.`,
  });

  const { targetAudienceSegmentation, audienceSegments } = object;

  // Save target audience segmentation first, then segments
  const savedTargetAudienceSegmentation =
    await prisma.targetAudienceSegmentation.create({
      data: {
        ...targetAudienceSegmentation,
        validationId,
      },
    });

  // Create audience segments with correct foreign key reference
  await prisma.audienceSegment.createMany({
    data: audienceSegments.map((segment) => ({
      ...segment,
      targetAudienceSegmentationId: savedTargetAudienceSegmentation.id,
    })),
  });

  return savedTargetAudienceSegmentation;
}
