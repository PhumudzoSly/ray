import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// AI SDK client configuration
export const aiClient = {
  // Generate text using Gemini
  generateText: async (
    prompt: string,
    options?: {
      temperature?: number;
      system?: string;
    }
  ) => {
    return generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: options?.temperature || 0.7,
      system: options?.system,
    });
  },

  // Generate structured object using Gemini
  generateObject: async (
    schema: z.ZodType,
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ) => {
    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      schema,
      prompt,
      temperature: options?.temperature || 0.7,
      system: options?.system,
    });
    return result.object;
  },

  // Generate text with retry logic
  generateTextWithRetry: async (
    prompt: string,
    maxRetries: number = 3,
    options?: {
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ) => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await aiClient.generateText(prompt, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`AI SDK attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw new Error(
            `AI SDK failed after ${maxRetries} attempts: ${lastError.message}`
          );
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  },

  // Generate object with retry logic
  generateObjectWithRetry: async (
    schema: z.ZodType,
    prompt: string,
    maxRetries: number = 3,
    options?: {
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ) => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await aiClient.generateObject(schema, prompt, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `AI SDK object generation attempt ${attempt} failed:`,
          error
        );

        if (attempt === maxRetries) {
          throw new Error(
            `AI SDK object generation failed after ${maxRetries} attempts: ${lastError.message}`
          );
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  },
};
