import { v } from "convex/values";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { ConvexSession } from "../betterAuth";
import { Id } from "../_generated/dataModel";

// Platform-specific checklist templates
const PLATFORM_CHECKLISTS = {
  web: [
    {
      category: "technical",
      title: "SSL Certificate Configured",
      description: "Ensure HTTPS is properly configured",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Domain Setup Complete",
      description: "Custom domain is configured and working",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Performance Optimization",
      description: "Page load times under 3 seconds",
      priority: "medium",
      isRequired: false,
    },
    {
      category: "technical",
      title: "Mobile Responsiveness",
      description: "Website works on all device sizes",
      priority: "high",
      isRequired: true,
    },
    {
      category: "analytics",
      title: "Google Analytics Setup",
      description: "Analytics tracking is configured",
      priority: "medium",
      isRequired: false,
    },
    {
      category: "legal",
      title: "Privacy Policy",
      description: "Privacy policy is published and compliant",
      priority: "high",
      isRequired: true,
    },
    {
      category: "legal",
      title: "Terms of Service",
      description: "Terms of service are clear and legally sound",
      priority: "high",
      isRequired: true,
    },
  ],
  mobile: [
    {
      category: "technical",
      title: "App Store Guidelines Compliance",
      description: "App meets platform guidelines",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Device Testing",
      description: "Tested on multiple devices and OS versions",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "App Icon and Screenshots",
      description: "Store assets are finalized",
      priority: "medium",
      isRequired: true,
    },
    {
      category: "marketing",
      title: "App Store Description",
      description: "Compelling app store description written",
      priority: "medium",
      isRequired: true,
    },
    {
      category: "legal",
      title: "App Store Legal Requirements",
      description: "Age rating, privacy policy, etc.",
      priority: "high",
      isRequired: true,
    },
  ],
  api: [
    {
      category: "technical",
      title: "API Documentation",
      description: "Complete API documentation published",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Rate Limiting",
      description: "Rate limiting is properly configured",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Authentication",
      description: "Secure authentication system in place",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Error Handling",
      description: "Proper error responses for all endpoints",
      priority: "medium",
      isRequired: true,
    },
    {
      category: "support",
      title: "Developer Support",
      description: "Support channels for developers established",
      priority: "medium",
      isRequired: false,
    },
  ],
  plugin: [
    {
      category: "technical",
      title: "Plugin Store Compliance",
      description: "Meets plugin marketplace requirements",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Compatibility Testing",
      description: "Tested with target platform versions",
      priority: "high",
      isRequired: true,
    },
    {
      category: "content",
      title: "Installation Instructions",
      description: "Clear installation and setup guide",
      priority: "medium",
      isRequired: true,
    },
    {
      category: "support",
      title: "User Documentation",
      description: "Complete user guide and examples",
      priority: "medium",
      isRequired: true,
    },
  ],
  desktop: [
    {
      category: "technical",
      title: "Cross-Platform Testing",
      description: "Tested on Windows, Mac, Linux",
      priority: "high",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Installer Creation",
      description: "Installation packages for all platforms",
      priority: "medium",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Code Signing",
      description: "Application is properly signed",
      priority: "high",
      isRequired: true,
    },
    {
      category: "legal",
      title: "Software License",
      description: "Appropriate software license chosen",
      priority: "medium",
      isRequired: true,
    },
  ],
  cli: [
    {
      category: "technical",
      title: "Package Manager Setup",
      description: "Published to npm, pip, cargo, etc.",
      priority: "medium",
      isRequired: false,
    },
    {
      category: "content",
      title: "Help Documentation",
      description: "Built-in help and man pages",
      priority: "medium",
      isRequired: true,
    },
    {
      category: "technical",
      title: "Cross-Platform Support",
      description: "Works on major operating systems",
      priority: "high",
      isRequired: true,
    },
    {
      category: "content",
      title: "Installation Instructions",
      description: "Clear installation methods documented",
      priority: "medium",
      isRequired: true,
    },
  ],
};

// AI Schema for structured generation
const launchPlanGenerationSchema = z.object({
  checklistItems: z.array(
    z.object({
      category: z.enum([
        "technical",
        "content",
        "legal",
        "marketing",
        "analytics",
        "support",
      ]),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      isRequired: z.boolean(),
      order: z.number(),
    })
  ),
  copyVariations: z.object({
    "product-hunt": z.object({
      title: z.string(),
      tagline: z.string(),
      description: z.string(),
      callToAction: z.string(),
      hashtags: z.array(z.string()),
    }),
    twitter: z.object({
      title: z.string(),
      description: z.string(),
      callToAction: z.string(),
      hashtags: z.array(z.string()),
      mentions: z.array(z.string()),
    }),
    readme: z.object({
      title: z.string(),
      tagline: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      installation: z.string(),
      usage: z.string(),
    }),
  }),
  strategyPhases: z.array(
    z.object({
      phase: z.enum([
        "pre-launch",
        "soft-launch",
        "public-launch",
        "post-launch",
      ]),
      name: z.string(),
      description: z.string(),
      duration: z.string(),
      platforms: z.array(z.string()),
      targetAudience: z.array(z.string()),
      keyMetrics: z.array(
        z.object({
          name: z.string(),
          target: z.string(),
        })
      ),
      order: z.number(),
    })
  ),
});

// Generate comprehensive launch plan using AI
export const generate = action({
  args: {
    projectId: v.id("projects"),
    token: v.string(),
    targetLaunchDate: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; launchPlanId: Id<"launchPlans"> }> => {
    const session: ConvexSession = await ctx.runQuery(
      internal.betterAuth.getSession,
      { sessionToken: args.token }
    );

    if (!session) {
      throw Error("Unauthorized");
    }

    try {
      // Get project data
      const project = await ctx.runQuery(api.projects.get, {
        id: args.projectId,
        token: args.token,
      });

      if (!project) {
        throw new Error(`Project not found: ${args.projectId}`);
      }

      // Get related data
      const [issues, roadmaps] = await Promise.all([
        ctx.runQuery(api.issue.index.getIssuesByProject, {
          projectId: args.projectId,
          token: args.token,
        }),
        ctx.runQuery(api.roadmap.getRoadmapsByProject, {
          projectId: args.projectId,
          token: args.token,
        }),
      ]);

      // Get platform-specific checklist baseline
      const baseChecklist =
        PLATFORM_CHECKLISTS[
          project.platform as keyof typeof PLATFORM_CHECKLISTS
        ] || PLATFORM_CHECKLISTS.web;

      // Generate AI-enhanced launch plan
      const prompt = `
You are an expert product launch strategist. Generate a comprehensive, structured launch plan for this project:

PROJECT DETAILS:
- Name: ${project.name}
- Platform: ${project.platform}
- Description: ${project.description || "No description provided"}
- Tech Stack: ${JSON.stringify(project.techStack)}

PROJECT STATUS:
- Total Issues: ${issues?.length || 0}
- Completed Issues: ${issues?.filter((i: any) => i.status === "completed").length || 0}
- Has Public Roadmap: ${roadmaps?.length > 0 ? "Yes" : "No"}
- Flow Nodes: ${project.flowData?.nodes?.length || 0}

BASE CHECKLIST ITEMS: ${JSON.stringify(baseChecklist)}

TARGET LAUNCH DATE: ${args.targetLaunchDate || "Not specified"}

Generate:

1. ENHANCED CHECKLIST: 
   - Include the base checklist items
   - Add 5-10 project-specific items based on the project details
   - Ensure proper categorization and prioritization
   - Set appropriate order (1-N)

2. PLATFORM COPY:
   - Product Hunt: Engaging launch copy optimized for PH
   - Twitter: Thread-worthy social copy  
   - README: Professional documentation copy

3. LAUNCH STRATEGY:
   - 4 phases: pre-launch, soft-launch, public-launch, post-launch
   - Each phase should have specific platforms, audiences, and metrics
   - Realistic timelines based on project complexity

Focus on actionable, realistic recommendations that consider the project's current state and platform type.
`;

      const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        prompt,
        schema: launchPlanGenerationSchema,
        maxTokens: 4000,
      });

      // Create or update launch plan
      let launchPlanId: Id<"launchPlans">;

      const existingLaunchPlan = await ctx.runQuery(
        api.launch.index.getByProject,
        {
          projectId: args.projectId,
          token: args.token,
        }
      );

      if (!existingLaunchPlan) {
        launchPlanId = await ctx.runMutation(api.launch.index.create, {
          token: args.token,
          projectId: args.projectId,
          targetLaunchDate: args.targetLaunchDate,
        });
      } else {
        launchPlanId = existingLaunchPlan._id;
        // Clear existing data and create new structured data
        await ctx.runMutation(api.launch.index.remove, {
          token: args.token,
          launchPlanId: launchPlanId,
        });
      }

      // If we don't have a launch plan yet, create one
      if (!existingLaunchPlan) {
        // launchPlanId is already set above
      } else {
        // Recreate launch plan
        launchPlanId = await ctx.runMutation(api.launch.index.create, {
          token: args.token,
          projectId: args.projectId,
          targetLaunchDate: args.targetLaunchDate,
        });
      }

      // Create checklist items
      for (const item of object.checklistItems) {
        await ctx.runMutation(api.launch.checklist.addItem, {
          token: args.token,
          launchPlanId: launchPlanId,
          item,
        });
      }

      // Create copy for each platform
      for (const [platform, copy] of Object.entries(object.copyVariations)) {
        await ctx.runMutation(api.launch.copy.upsertCopy, {
          token: args.token,
          launchPlanId: launchPlanId,
          platform: platform as any,
          copy,
        });
      }

      // Create strategy phases
      for (const phase of object.strategyPhases) {
        await ctx.runMutation(api.launch.strategy.addPhase, {
          token: args.token,
          launchPlanId: launchPlanId,
          phase,
        });
      }

      return { success: true, launchPlanId: launchPlanId };
    } catch (error) {
      console.error(`[Launch Generator] Error:`, error);
      throw new Error(
        `Launch plan generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
