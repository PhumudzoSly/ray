import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google("gemini-2.0-flash"),
      messages: messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("Error processing chat request", { status: 500 });
  }
}
