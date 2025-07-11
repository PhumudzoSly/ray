import { NextRequest, NextResponse } from "next/server";
import { validateIdea } from "@/lib/idea-validator";
import { z } from "zod";
import { getSession } from "@/actions/account/user";

const requestSchema = z.object({
  ideaId: z.string(),
  idea: z.object({
    name: z.string(),
    description: z.string(),
    industry: z.string(),
    problemSolved: z.string().optional(),
    solutionOffered: z.string().optional(),
    internal: z.boolean().optional(),
    openSource: z.boolean().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Call the validation function
    const validationResults = await validateIdea(validatedData.idea);

    // Return the validation results
    return NextResponse.json({
      success: true,
      results: validationResults,
      ideaId: validatedData.ideaId,
    });
  } catch (error) {
    console.error("Error in idea validation API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
