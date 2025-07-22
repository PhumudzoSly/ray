import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/backend";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Verify webhook signature
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex")}`;

      if (signature !== expectedSignature) {
        return new NextResponse("Invalid signature", { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const event = request.headers.get("x-github-event");

    // Handle different GitHub events
    switch (event) {
      case "issues":
        await handleIssuesEvent(payload);
        break;
      case "pull_request":
        await handlePullRequestEvent(payload);
        break;
      case "push":
        await handlePushEvent(payload);
        break;
      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function handleIssuesEvent(payload: any) {
  const { action, issue, repository } = payload;

  // Find GitHub integration for this repository
  const integration = await prisma.integration.findFirst({
    where: {
      type: "GITHUB",
      config: {
        path: ["repositories"],
        array_contains: [repository.full_name],
      },
    },
  });

  if (!integration) {
    console.log(
      `No GitHub integration found for repository: ${repository.full_name}`
    );
    return;
  }

  // Here you would sync the issue to your database
  // This is where you'd implement the actual issue sync logic
  console.log(`Issue ${action}: ${issue.title} in ${repository.full_name}`);

  // Example: Create or update issue in your database
  // await syncIssueToDatabase(integration, issue, repository);
}

async function handlePullRequestEvent(payload: any) {
  const { action, pull_request, repository } = payload;

  // Find GitHub integration for this repository
  const integration = await prisma.integration.findFirst({
    where: {
      type: "GITHUB",
      config: {
        path: ["repositories"],
        array_contains: [repository.full_name],
      },
    },
  });

  if (!integration) {
    console.log(
      `No GitHub integration found for repository: ${repository.full_name}`
    );
    return;
  }

  // Here you would sync the pull request to your database
  console.log(
    `Pull Request ${action}: ${pull_request.title} in ${repository.full_name}`
  );

  // Example: Create or update pull request in your database
  // await syncPullRequestToDatabase(integration, pull_request, repository);
}

async function handlePushEvent(payload: any) {
  const { ref, commits, repository } = payload;

  // Find GitHub integration for this repository
  const integration = await prisma.integration.findFirst({
    where: {
      type: "GITHUB",
      config: {
        path: ["repositories"],
        array_contains: [repository.full_name],
      },
    },
  });

  if (!integration) {
    console.log(
      `No GitHub integration found for repository: ${repository.full_name}`
    );
    return;
  }

  // Here you would analyze the code changes
  console.log(
    `Push to ${ref}: ${commits.length} commits in ${repository.full_name}`
  );

  // Example: Analyze code changes for progress, bugs, etc.
  // await analyzeCodeChanges(integration, commits, repository);
}
