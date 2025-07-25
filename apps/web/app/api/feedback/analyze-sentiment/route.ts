import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/backend";
import { z } from "zod";

// Schema for comprehensive feedback analysis
const FeedbackAnalysisSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  category: z.enum([
    "bug_report",
    "feature_request",
    "improvement_suggestion",
    "general_feedback",
    "complaint",
    "praise",
    "question",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  actionable: z.boolean(),
  issueGeneration: z.object({
    shouldGenerate: z.boolean(),
    issueType: z.enum(["bug", "feature", "improvement", "none"]).optional(),
    suggestedTitle: z.string().optional(),
    suggestedDescription: z.string().optional(),
    suggestedPriority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    suggestedLabel: z
      .enum([
        "UI",
        "BUG",
        "FEATURE",
        "IMPROVEMENT",
        "TASK",
        "DOCUMENTATION",
        "REFACTOR",
        "PERFORMANCE",
        "DESIGN",
        "SECURITY",
        "ACCESSIBILITY",
        "TESTING",
        "INTERNATIONALIZATION",
      ])
      .optional(),
  }),
  extractedInfo: z.object({
    painPoints: z.array(z.string()),
    suggestions: z.array(z.string()),
    userExperience: z.string().optional(),
    technicalDetails: z.string().optional(),
  }),
  confidence: z.number().min(0).max(1),
});

export async function POST(req: NextRequest) {
  try {
    const { feedbackId } = await req.json();

    if (!feedbackId || typeof feedbackId !== "string") {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // Fetch the feedback from the database with roadmap item context
    const feedback = await prisma.roadmapFeedback.findUnique({
      where: { id: feedbackId },
      select: {
        id: true,
        content: true,
        sentiment: true,
        roadmapItem: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            roadmap: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                    organizationId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // If sentiment is already set, skip analysis
    if (feedback.sentiment && feedback.sentiment !== "neutral") {
      return NextResponse.json({
        success: true,
        message: "Sentiment already analyzed",
      });
    }

    // Analyze feedback comprehensively using AI
    const analysis = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: FeedbackAnalysisSchema,
      prompt: `Analyze this user feedback comprehensively for a roadmap item. Extract actionable insights and determine if an issue should be generated.

Feedback: "${feedback.content}"
Roadmap Item: "${feedback.roadmapItem.title}"
Item Description: "${feedback.roadmapItem.description || "No description"}"
Item Category: "${feedback.roadmapItem.category}"
Item Status: "${feedback.roadmapItem.status}"

Provide a comprehensive analysis including:
1. Sentiment (positive/negative/neutral)
2. Category (bug_report, feature_request, improvement_suggestion, etc.)
3. Priority level based on impact and urgency
4. Whether this feedback is actionable
5. Whether an issue should be generated and what type
6. Extracted pain points and suggestions
7. Confidence in the analysis (0-1)

Focus on extracting actionable insights that could help improve the product.`,
    });

    // Type the analysis result
    const analysisResult = analysis.object as z.infer<
      typeof FeedbackAnalysisSchema
    >;

    // Update the feedback with the analyzed sentiment
    await prisma.roadmapFeedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: analysisResult.sentiment,
        // Store additional analysis data as JSON in a custom field if needed
      },
    });

    // If the analysis suggests generating an issue, create it
    if (
      analysisResult.issueGeneration.shouldGenerate &&
      analysisResult.issueGeneration.issueType !== "none"
    ) {
      try {
        const issue = await prisma.issue.create({
          data: {
            title:
              analysisResult.issueGeneration.suggestedTitle ||
              `Issue from feedback: ${feedback.roadmapItem.title}`,
            description:
              analysisResult.issueGeneration.suggestedDescription ||
              feedback.content,
            organizationId:
              feedback.roadmapItem.roadmap.project.organizationId!,
            projectId: feedback.roadmapItem.roadmap.project.id,
            status: "BACKLOG",
            priority:
              analysisResult.issueGeneration.suggestedPriority || "MEDIUM",
            label: analysisResult.issueGeneration.suggestedLabel || "FEATURE",
            sourceType: "feedback",
            sourceFeedbackId: feedbackId,
            isPublic: false,
          },
        });

        // Link the feedback to the created issue
        await prisma.roadmapFeedback.update({
          where: { id: feedbackId },
          data: {
            convertedToIssueId: issue.id,
            convertedAt: new Date(),
            conversionNotes: `Auto-generated from feedback analysis. Category: ${analysisResult.category}, Priority: ${analysisResult.priority}`,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Feedback analyzed and issue generated`,
          data: {
            sentiment: analysisResult.sentiment,
            issueGenerated: true,
            issueId: issue.id,
            analysis: {
              category: analysisResult.category,
              priority: analysisResult.priority,
              actionable: analysisResult.actionable,
              confidence: analysisResult.confidence,
            },
          },
        });
      } catch (issueError) {
        console.error("Failed to generate issue:", issueError);
        // Continue without issue generation
      }
    }

    return NextResponse.json({
      success: true,
      message: `Feedback analyzed successfully`,
      data: {
        sentiment: analysisResult.sentiment,
        issueGenerated: false,
        analysis: {
          category: analysisResult.category,
          priority: analysisResult.priority,
          actionable: analysisResult.actionable,
          confidence: analysisResult.confidence,
        },
      },
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);

    // Try to update with neutral sentiment as fallback
    try {
      const { feedbackId } = await req.json();
      if (feedbackId) {
        await prisma.roadmapFeedback.update({
          where: { id: feedbackId },
          data: { sentiment: "neutral" },
        });
      }
    } catch (fallbackError) {
      console.error("Fallback update failed:", fallbackError);
    }

    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
