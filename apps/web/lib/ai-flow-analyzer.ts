"use server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { Project } from "./types";

// Define schemas for structured output
const MissingFlowSchema = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  reasoning: z.string(),
});

const FlowRecommendationSchema = z.object({
  type: z.enum(["add_node", "connect_nodes", "modify_node", "restructure"]),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  impact: z.string(),
  implementation: z.string(),
});

const FlowAnalysisSchema = z.object({
  missingFlows: z.array(MissingFlowSchema),
  recommendations: z.array(FlowRecommendationSchema),
  analysis: z.string(),
});

const ChatResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()),
});

export interface MissingFlow {
  type: string;
  label: string;
  description: string;
  priority: "low" | "medium" | "high";
  reasoning: string;
}

export interface FlowRecommendation {
  type: "add_node" | "connect_nodes" | "modify_node" | "restructure";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  impact: string;
  implementation: string;
}

export async function analyzeProjectFlows(project: Project): Promise<{
  missingFlows: MissingFlow[];
  recommendations: FlowRecommendation[];
  analysis: string;
}> {
  const prompt = `
You are an expert product manager and software architect analyzing an app flow design.

Project Details:
- Name: ${project.name}
- Platform: ${project.platform}
- Tech Stack: ${JSON.stringify(project.techStack)}
- Description: ${project.description || "No description provided"}

Current Flow Nodes:
${
  project.flowData?.nodes
    ?.map(
      (node) => `
- Type: ${node.data.type}
- Label: ${node.data.label}
- Description: ${node.data.description || "No description"}
- Priority: ${node.data.priority}
`
    )
    .join("\n") || "No nodes created yet"
}

Current Connections:
${
  project.flowData?.edges
    ?.map(
      (edge) => `
- From: ${edge.source} to ${edge.target}
`
    )
    .join("\n") || "No connections yet"
}

Available Node Types: auth, onboarding, feature, feedback, error, settings, permissions, custom

Analyze this project and provide:

1. MISSING FLOWS: Identify 3-5 critical flows that are missing for a complete ${project.platform} application
2. RECOMMENDATIONS: Provide 3-5 specific recommendations to improve the current flow structure
3. ANALYSIS: Overall assessment of the current flow design

For each missing flow, consider:
- Essential user journeys for this type of app
- Security and compliance requirements
- User experience best practices
- Technical architecture needs

For recommendations, focus on:
- Flow optimization opportunities
- Missing connections between existing nodes
- Priority adjustments
- Structural improvements
`;

  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: FlowAnalysisSchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error("Error analyzing project flows:", error);
    return {
      missingFlows: [],
      recommendations: [],
      analysis:
        "Error analyzing project flows. Please check your AI configuration.",
    };
  }
}

export async function generateFlowSuggestions(
  project: Project,
  userMessage: string
): Promise<{
  response: string;
  suggestions: string[];
}> {
  const prompt = `
You are an AI assistant helping with app flow design for the project "${project.name}".

Project Context:
- Platform: ${project.platform}
- Current Nodes: ${project.flowData?.nodes?.length || 0}

User Message: ${userMessage}

Provide a helpful response and 3-5 actionable suggestions related to their question.
`;

  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: ChatResponseSchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error("Error generating flow suggestions:", error);
    return {
      response:
        "I apologize, but I encountered an error while processing your request. Please try again.",
      suggestions: [],
    };
  }
}
