import { inngestClient } from "@/lib/inngest";
import { google } from "@ai-sdk/google";
import {
  FeaturePhaseSchema,
  ImportanceSchema,
  prisma,
} from "@workspace/backend";
import { generateObject } from "ai";
import z from "zod";

export const generateFeature = inngestClient.createFunction(
  { name: "Generate Feature", id: "generate-feature" },
  { event: "project/generate-feature" },
  async ({ event, step }) => {
    const { projectId } = event.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        idea: true,
        features: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: z.object({
        features: z.array(
          z.object({
            name: z.string().describe("The name of the feature"),
            description: z
              .string()
              .describe("A detailed description of the feature"),
            phase: z.enum([
              "DISCOVERY",
              "PLANNING",
              "DEVELOPMENT",
              "TESTING",
              "DEPLOYMENT",
              "COMPLETED",
              "RELEASE",
              "LIVE",
              "DEPRECATED",
            ]),
            businessValue: z
              .number()
              .optional()
              .describe(
                "The business value of the feature, a number between 1 and 10"
              ),
            estimatedEffort: z
              .number()
              .optional()
              .describe("How many hours will this feature take to build?"),
            priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
          })
        ),
      }),
      prompt: `
        # Feature Generation for Project: ${project?.name || "Untitled Project"}

        ## Your Role
        You are an experienced Senior Product Manager tasked with generating comprehensive feature specifications for a software project. Your goal is to create realistic, well-scoped features that align with the project's vision and current development stage.

        ## Project Context
        **Project & SaaS Idea:** ${JSON.stringify(project)}

        ## Existing Features Analysis
        **Total Existing Features:** ${project?.features.length}
        ${
          project?.features.length > 0
            ? `
        **Existing Features:**
        ${project?.features
          .map(
            (feature, index) => `
        ${index + 1}. **${feature.name}** (${feature.phase})
        - Priority: ${feature.priority}
        - Description: ${feature.description}
        - Effort: ${feature.estimatedEffort ? `${feature.estimatedEffort}h` : "Not estimated"}
        - Timeline: ${feature.startDate ? new Date(feature.startDate).toISOString().split("T")[0] : "Not set"} - ${feature.endDate ? new Date(feature.endDate).toISOString().split("T")[0] : "Not set"}
        `
          )
          .join("\n")}`
            : "No existing features found."
        }

          #### IMPORTANT ####
        When suggesting a feature, consider the fact that this is a project type of ${project.platform === "both" ? "both web and mobile" : project.platform}
        
        ## Feature Generation Guidelines

        ### 1. **Avoid Duplication**
        - Carefully review existing features to avoid creating duplicates
        - If a similar feature exists, consider it as a sub-feature or enhancement instead

        ### 2. **Phase Selection Logic**
        Choose the most appropriate phase based on the project status:
        - **DISCOVERY**: Research, user interviews, market analysis, requirement gathering
        - **PLANNING**: Technical specifications, architecture design, resource planning
        - **DEVELOPMENT**: Active coding, implementation, feature building
        - **TESTING**: QA, user testing, bug fixes, performance optimization
        - **DEPLOYMENT**: Release preparation, deployment configuration
        - **RELEASE**: Public launch, marketing coordination
        - **LIVE**: Production monitoring, maintenance
        - **COMPLETED**: Feature fully delivered and stable
        - **DEPRECATED**: Features being phased out

          #### IMPORTANT ####
        When suggesting a feature, consider the fact that this is a project type of ${project.platform === "both" ? "both web and mobile" : project.platform}

        ### 3. **Priority Assignment**
        - **CRITICAL**: Core functionality, security, legal compliance, revenue-critical
        - **HIGH**: Major user-facing features, significant business value
        - **MEDIUM**: Nice-to-have features, improvements, optimizations
        - **LOW**: Minor enhancements, nice-to-have features

        ### 4. **Effort Estimation**
        - Base estimates on typical development complexity
        - Consider the project's platform and technology stack
        - Account for testing, documentation, and deployment time
        - Be realistic about scope and complexity

        ### 5. **Timeline Planning**
        - Start dates should be in the future (after current date: ${new Date().toISOString().split("T")[0]})
        - Consider dependencies between features
        - Account for team capacity and realistic development cycles
        - End dates should be after start dates with reasonable duration

          #### IMPORTANT ####
        When suggesting a feature, consider the fact that this is a project type of ${project.platform === "both" ? "both web and mobile" : project.platform}

        ### 6. **Business Value**
        - Assign values based on potential impact on user satisfaction, revenue, or efficiency
        - Consider the project's current validation stage
        - Higher values for features that directly address core user needs

        ## Generation Requirements

        Generate 3-5 new features that:
        1. **Complement** existing features without duplication
        2. **Align** with the project's current status and platform
        3. **Provide** clear business value and user benefit
        4. **Follow** a logical development progression
        5. **Consider** realistic timelines and effort estimates

          #### IMPORTANT ####
        When suggesting a feature, consider the fact that this is a project type of ${project.platform === "both" ? "both web and mobile" : project.platform}

        ## Output Format
        Each feature should include:
        - **Name**: Clear, concise feature name
        - **Description**: Detailed explanation of functionality and user benefit
        - **Phase**: Appropriate development phase
        - **Priority**: Strategic importance level
        - **Business Value**: Impact score (1-10)
        - **Estimated Effort**: Realistic hours estimate
        - **Start Date**: Future date considering existing features
        - **End Date**: Realistic completion timeline

        Focus on creating features that will genuinely advance the project toward its goals while maintaining realistic scope and timelines.

        #### IMPORTANT ####
        When suggesting a feature, consider the fact that this is a project type of ${project.platform === "both" ? "both web and mobile" : project.platform}
            `,
    });

    const features = object.features;

    await prisma.feature.createMany({
      data: features.map((feature) => ({
        ...feature,
        projectId: projectId,
        organizationId: project.organizationId!,
        phase: feature.phase,
        priority: feature.priority,
      })),
    });
  }
);
