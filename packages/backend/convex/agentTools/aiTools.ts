import { v } from "convex/values";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Action: Generate AI response
export const generateResponse = action({
  args: {
    conversationId: v.id("agentConversations"),
    userMessage: v.string(),
    userId: v.string(),
    organizationId: v.id("organization"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    usage?: any;
  }> => {
    try {
      // Get conversation details
      const conversation: any = await ctx.runQuery(api.agent.getConversation, {
        conversationId: args.conversationId,
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Get conversation history
      const messages: any[] = await ctx.runQuery(api.agent.getMessages, {
        conversationId: args.conversationId,
      });

      // Add user message
      await ctx.runMutation(api.agent.addMessage, {
        conversationId: args.conversationId,
        role: "user",
        content: args.userMessage,
        userId: args.userId,
      });

      // Search database for relevant context
      const searchResults = await ctx.runAction(internal.rag.search, {
        query: args.userMessage,
        token: conversation.token,
      });

      // Build context from search results
      const context =
        searchResults.results.length > 0
          ? `\n\nRelevant information from your database:\n${searchResults.results
              .map(
                (result) => `- ${JSON.parse(JSON.stringify(result.content))}`
              )
              .join("\n")}`
          : "";

      // Build message history for AI
      const messageHistory: any[] = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add current user message
      messageHistory.push({
        role: "user" as const,
        content: args.userMessage + context,
      });

      // System prompt for database-aware AI
      const systemPrompt =
        conversation.systemPrompt ||
        `You are a helpful AI assistant with access to the user's project database. You can search through their projects, ideas, issues, and features to provide relevant information and insights. 

When answering questions:
1. Use the provided database context when relevant - this is crucial for providing accurate information
2. Be specific and reference actual data when available - mention project names, issue titles, etc.
3. If database context is provided, use it to answer the question directly
4. If no relevant data is found, acknowledge this and ask for more specific information
5. Suggest actionable next steps based on the user's data when appropriate
6. Ask clarifying questions if you need more information

Available data types:
- Projects: User's active projects with descriptions and status
- Ideas: Brainstormed ideas with validation status  
- Issues: Bugs and problems that need resolution
- Features: Planned features with priorities and phases

When database context is provided, format your response to clearly reference the specific items found. For example:
"Based on your database, I found:
- Project: [Project Name] - [Description]
- Issue: [Issue Title] - [Description]

[Your analysis and recommendations]"

Always be helpful, accurate, and reference the specific data provided when relevant.`;

      const aiProvider = google("gemini-2.0-flash");

      // Generate response
      const { text, usage }: any = await generateText({
        model: aiProvider,
        messages: [
          { role: "system", content: systemPrompt },
          ...messageHistory,
        ],
        maxTokens: 1000,
        
      });

      // Add AI response to conversation
      await ctx.runMutation(api.agent.addMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content: text,
        userId: args.userId,
        tokens: usage
          ? {
              input: usage.promptTokens,
              output: usage.completionTokens,
            }
          : undefined,
      });

      return {
        success: true,
        response: text,
        usage,
      };
    } catch (error) {
      console.error("AI generation error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        conversationId: args.conversationId,
      });

      // Add error message
      await ctx.runMutation(api.agent.addMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again.",
        userId: args.userId,
        isError: true,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
