import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `Analyze the sentiment of this feedback text and return ONLY one of these three values: "positive", "negative", or "neutral".

Text: "${content}"

Consider:
- Positive: Expresses satisfaction, excitement, approval, or enthusiasm
- Negative: Expresses dissatisfaction, frustration, disappointment, or criticism
- Neutral: Expresses neither positive nor negative sentiment, or is factual/descriptive

Return only the sentiment value, nothing else.`,
    });

    const sentiment = result.text.trim().toLowerCase();

    // Validate the response
    if (!["positive", "negative", "neutral"].includes(sentiment)) {
      // Fallback to neutral if AI response is unexpected
      return NextResponse.json({ sentiment: "neutral" });
    }

    return NextResponse.json({ sentiment });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
