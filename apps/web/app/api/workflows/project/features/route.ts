import { google } from "@ai-sdk/google";
import { serve } from "@upstash/workflow/nextjs";
import { prisma } from "@workspace/backend";
import { generateObject } from "ai";
import { z } from "zod";

interface WorkflowPayload {
  projectId: string;
  userInstructions?: string;
}

// Schema for generated features
const GeneratedFeatureSchema = z.object({
  name: z.string().describe("The name of the feature"),
  description: z.string().describe("A detailed description of the feature"),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .describe("The priority of the feature"),
  estimatedEffort: z
    .number()
    .int()
    .positive()
    .describe("Estimated effort in hours"),
  businessValue: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Business value from 1-10"),
});

const GeneratedFeaturesSchema = z.object({
  features: z
    .array(GeneratedFeatureSchema)
    .describe("List of generated features"),
});

export const { POST } = serve(async (context) => {
  const payload = context.requestPayload as WorkflowPayload;

  // Step 1: Get project context
  const projectContext = await context.run("get-project-context", async () => {
    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
      include: {
        features: true,
        idea: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  });

  // Step 2: Generate features using AI
  const generatedFeatures = await context.run("generate-features", async () => {
    const prompt = `You are an expert product manager helping to generate features for a software project.
    
    Project Information:
    Name: ${projectContext.name}
    Description: ${projectContext.description || "No description provided"}
    
    Existing Features in this project:
    ${projectContext.features.map((f: any) => `- ${f.name}: ${f.description || "No description"}`).join("\n") || "No existing features"}
    
    ${
      projectContext.idea
        ? `Original Idea Context:
    ${projectContext.idea.description || "No idea context provided"}`
        : ""
    }
    
    ${
      payload.userInstructions
        ? `USER INSTRUCTIONS: "${payload.userInstructions}"`
        : "Please generate 3-5 relevant features for this project based on the context."
    }
    
    Generate a list of features that would be valuable for this project. Each feature should have a clear name, detailed description, priority, estimated effort, and business value.`;

    const { object } = await generateObject({
      model: google("models/gemini-1.5-pro-latest"),
      schema: GeneratedFeaturesSchema,
      prompt,
    });

    return object.features;
  });

  // Step 3: Save generated features to database
  await context.run("save-features", async () => {
    const createdFeatures = [];

    for (const feature of generatedFeatures) {
      const createdFeature = await prisma.feature.create({
        data: {
          name: feature.name,
          description: feature.description,
          priority: feature.priority,
          estimatedEffort: feature.estimatedEffort,
          businessValue: feature.businessValue,
          projectId: payload.projectId,
          organizationId: projectContext.organizationId,
          phase: "DISCOVERY", // Default phase for new features
        },
      });

      createdFeatures.push(createdFeature);
    }

    return createdFeatures;
  });

  return {
    success: true,
    message: `Generated and saved ${generatedFeatures.length} features`,
  };
});
