"use server";
import { google } from "@ai-sdk/google";
import { generateText, generateObject, streamText } from "ai";
import { z } from "zod";
import env from "./env";

export interface NodeContext {
  type: string;
  label: string;
  description?: string;
  techStack: {
    auth: string;
    orm: string;
    database: string;
    ai: string;
  };
  connectedNodes: Array<{
    type: string;
    label: string;
  }>;
  platform: string;
}

export async function generatePRD(context: NodeContext): Promise<string> {
  const prompt = `
You are an expert product manager creating a detailed PRD (Product Requirements Document) for a ${context.type} feature.

Project Context:
- Platform: ${context.platform}
- Tech Stack: ${context.techStack.auth} (auth), ${context.techStack.orm} (ORM), ${context.techStack.database} (database), ${context.techStack.ai} (AI)

Feature Details:
- Type: ${context.type}
- Name: ${context.label}
- Description: ${context.description || "No description provided"}

Connected Features:
${context.connectedNodes.map((node) => `- ${node.type}: ${node.label}`).join("\n")}

Generate a comprehensive PRD in **MARKDOWN FORMAT** that includes:

# ${context.label} - Product Requirements Document

## 🎯 Purpose
Clear explanation of why this feature exists and its value proposition.

## ⭐ Key Features
List 3-5 specific, actionable features with detailed descriptions:

- **Feature 1**: Description
- **Feature 2**: Description
- **Feature 3**: Description

## 🔧 Technical Implementation
Specific implementation guidance using the selected tech stack:

### Authentication Integration
- How to integrate with ${context.techStack.auth} for authentication

### Database Schema
- Database schema considerations with ${context.techStack.orm} and ${context.techStack.database}
- Required tables and relationships

### AI Integration
- Any AI integration opportunities with ${context.techStack.ai}

## 🔗 Dependencies
Based on the connected nodes, explain how this feature depends on or integrates with other parts of the system:

${context.connectedNodes.map((node) => `- **${node.label}** (${node.type}): Integration details`).join("\n")}

## 📋 Implementation Priority
Recommend implementation approach (MVP vs full-featured) and justify the priority level.

## 📊 Success Metrics
Define 2-3 measurable success criteria for this feature:

1. **Metric 1**: Description and target
2. **Metric 2**: Description and target
3. **Metric 3**: Description and target

## 📝 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Make the PRD specific to the tech stack and realistic for the project scope. Use proper markdown formatting with headers, lists, code blocks, and emphasis.
`;

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    });

    return text;
  } catch (error) {
    console.error("Error generating PRD:", error);
    return `# Error Generating PRD

**Error**: Unable to generate PRD. Please check your Google AI configuration.

## Troubleshooting
- Verify your Google AI API key is configured correctly
- Check your internet connection
- Try again in a few moments`;
  }
}

export async function generateImplementationPrompt(
  context: NodeContext,
  prd: string
): Promise<string> {
  const prompt = `
Based on this PRD for a ${context.type} feature:

${prd}

Generate a detailed implementation prompt in **MARKDOWN FORMAT** that a developer could use with AI coding assistants to build this feature.

# Implementation Prompt for ${context.label}

## 🎯 Objective
Build the ${context.label} feature based on the PRD specifications.

## 🛠️ Tech Stack Requirements
- **Authentication**: ${context.techStack.auth}
- **ORM**: ${context.techStack.orm}
- **Database**: ${context.techStack.database}
- **AI Provider**: ${context.techStack.ai}

## 📁 File Structure
Provide specific file structure and component organization:

\`\`\`
src/
├── components/
│   └── ${context.type}/
├── pages/
├── lib/
└── types/
\`\`\`

## 🔗 Integration Points
Integration with connected features:
${context.connectedNodes.map((node) => `- **${node.label}** (${node.type})`).join("\n")}

## ✅ Acceptance Criteria
Clear acceptance criteria for the implementation.

## 🔒 Security Considerations
Security and best practice considerations specific to this feature.

## 📋 Implementation Steps
1. Step 1
2. Step 2
3. Step 3

Make it a ready-to-use prompt for tools like Claude, GPT-4, or GitHub Copilot with specific technical details.
`;

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 1500,
    });

    return text;
  } catch (error) {
    console.error("Error generating implementation prompt:", error);
    return `# Error Generating Implementation Prompt

**Error**: Unable to generate implementation prompt. Please check your Google AI configuration.

## Troubleshooting
- Verify your Google AI API key is configured correctly
- Check your internet connection
- Try again in a few moments`;
  }
}

// Add streaming chat endpoint for use with Vercel AI SDK
export async function streamingChat(messages: any[]) {
  try {
    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages: messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in streaming chat:", error);
    return new Response("Error processing chat request", { status: 500 });
  }
}
