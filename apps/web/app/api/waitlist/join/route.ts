import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@workspace/backend";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { hashApiKey } from "@/lib/crypto-node";

const joinWaitlistSchema = z.object({
  waitlistId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  referredBy: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// Helper function to verify API key
async function verifyApiKey(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer " prefix
  const keyHash = hashApiKey(apiKey);

  try {
    const apiKeyData = await fetchQuery(api.apiKeys.verifyApiKey, {
      keyHash,
    });

    if (!apiKeyData) {
      return null;
    }

    // Update last used timestamp
    await fetchMutation(api.apiKeys.updateLastUsed, {
      keyId: apiKeyData._id,
    });

    return apiKeyData;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key authentication
    const authHeader = request.headers.get("authorization");
    const apiKeyData = await verifyApiKey(authHeader);

    if (!apiKeyData) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Check if API key has the required permissions
    if (
      !apiKeyData.permissions.includes("write") &&
      !apiKeyData.permissions.includes("admin")
    ) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. 'write' or 'admin' permission required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = joinWaitlistSchema.parse(body);

    // Verify that the waitlist belongs to the same organization as the API key
    const waitlist = await fetchQuery(api.waitlists.getWaitlistByIdWithOrg, {
      waitlistId: validatedData.waitlistId as any,
      organizationId: apiKeyData.organizationId,
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found or access denied" },
        { status: 404 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    // Join waitlist
    const entryId = await fetchMutation(api.waitlists.joinWaitlist, {
      waitlistId: validatedData.waitlistId as any,
      email: validatedData.email,
      name: validatedData.name,
      referredBy: validatedData.referredBy,
      ipAddress,
      userAgent,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
    });

    return NextResponse.json({
      success: true,
      entryId,
      message:
        "Successfully joined waitlist! Please check your email to verify your address.",
    });
  } catch (error) {
    console.error("Error joining waitlist:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verify email endpoint
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    await fetchMutation(api.waitlists.verifyEmail, {
      verificationToken: token,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Error verifying email:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
