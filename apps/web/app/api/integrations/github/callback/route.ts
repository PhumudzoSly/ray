import { NextRequest, NextResponse } from "next/server";
import { handleGitHubOAuthCallback } from "@/actions/integration/github";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle GitHub OAuth errors
    if (error) {
      const errorMessage = errorDescription
        ? `${error}: ${errorDescription}`
        : error;

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=${encodeURIComponent(
          `GitHub authorization failed: ${errorMessage}`
        )}`
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=${encodeURIComponent(
          "Missing authorization code from GitHub"
        )}`
      );
    }

    if (!state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=${encodeURIComponent(
          "Missing state parameter - possible security issue"
        )}`
      );
    }

    // Validate state format
    if (!state.startsWith("org:")) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=${encodeURIComponent(
          "Invalid state parameter"
        )}`
      );
    }

    // Handle the OAuth callback
    const result = await handleGitHubOAuthCallback(code, state);

    if (result.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?success=${encodeURIComponent(
          "GitHub integration connected successfully! You can now select repositories to sync."
        )}`
      );
    } else {
      throw new Error("OAuth callback failed");
    }
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to connect GitHub integration";

    if (error instanceof Error) {
      if (error.message.includes("Missing required environment variables")) {
        errorMessage =
          "GitHub integration is not properly configured. Please contact support.";
      } else if (error.message.includes("GitHub OAuth error")) {
        errorMessage = "GitHub authorization failed. Please try again.";
      } else if (error.message.includes("token exchange failed")) {
        errorMessage = "Failed to authenticate with GitHub. Please try again.";
      } else if (error.message.includes("Invalid GitHub user data")) {
        errorMessage = "Received invalid data from GitHub. Please try again.";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
}
