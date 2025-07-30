import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/backend";
import crypto from "crypto";
import { inngestClient } from "@/lib/inngest";
import {
  GitHubIssueEventSchema,
  GitHubPullRequestEventSchema,
  GitHubPushEventSchema,
} from "@/types/github-integration";

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
  try {
    const validatedPayload = GitHubIssueEventSchema.parse(payload);
    const { action, issue, repository } = validatedPayload;

    // Find connected repositories for this GitHub repository
    const codeRepositories = await prisma.codeRepository.findMany({
      where: {
        repositoryName: repository.full_name,
        isActive: true,
      },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (codeRepositories.length === 0) {
      console.log(
        `No connected repositories found for: ${repository.full_name}`
      );
      return;
    }

    // Trigger issue sync for each connected repository
    for (const codeRepo of codeRepositories) {
      await inngestClient.send({
        name: "github/issue.sync",
        data: {
          repositoryId: codeRepo.id,
          projectId: codeRepo.projectId,
          organizationId: codeRepo.project.organizationId,
          action,
          issue,
          repository,
        },
      });
    }

    console.log(
      `Issue ${action}: ${issue.title} in ${repository.full_name} - triggered sync for ${codeRepositories.length} repositories`
    );
  } catch (error) {
    console.error("Error handling GitHub issue event:", error);
  }
}

async function handlePullRequestEvent(payload: any) {
  try {
    const validatedPayload = GitHubPullRequestEventSchema.parse(payload);
    const { action, pull_request, repository } = validatedPayload;

    // Find connected repositories for this GitHub repository
    const codeRepositories = await prisma.codeRepository.findMany({
      where: {
        repositoryName: repository.full_name,
        isActive: true,
      },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (codeRepositories.length === 0) {
      console.log(
        `No connected repositories found for: ${repository.full_name}`
      );
      return;
    }

    // Trigger AI code review for pull requests
    if (action === "opened" || action === "synchronize") {
      for (const codeRepo of codeRepositories) {
        await inngestClient.send({
          name: "github/pull-request.review",
          data: {
            repositoryId: codeRepo.id,
            projectId: codeRepo.projectId,
            organizationId: codeRepo.project.organizationId,
            pullRequest: pull_request,
            repository,
            action,
          },
        });
      }
    }

    console.log(
      `Pull Request ${action}: ${pull_request.title} in ${repository.full_name} - triggered review for ${codeRepositories.length} repositories`
    );
  } catch (error) {
    console.error("Error handling GitHub pull request event:", error);
  }
}

async function handlePushEvent(payload: any) {
  try {
    const validatedPayload = GitHubPushEventSchema.parse(payload);
    const { ref, commits, repository, before, after } = validatedPayload;

    // Only process pushes to main/master branches
    if (!ref.includes("main") && !ref.includes("master")) {
      console.log(`Ignoring push to non-main branch: ${ref}`);
      return;
    }

    // Find connected repositories for this GitHub repository
    const codeRepositories = await prisma.codeRepository.findMany({
      where: {
        repositoryName: repository.full_name,
        isActive: true,
      },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (codeRepositories.length === 0) {
      console.log(
        `No connected repositories found for: ${repository.full_name}`
      );
      return;
    }

    // Trigger code analysis for each connected repository
    for (const codeRepo of codeRepositories) {
      await inngestClient.send({
        name: "github/code.analyze",
        data: {
          repositoryId: codeRepo.id,
          projectId: codeRepo.projectId,
          organizationId: codeRepo.project.organizationId,
          commitSha: after,
          previousCommitSha: before,
          branch: ref.replace("refs/heads/", ""),
          commits,
          repository,
        },
      });
    }

    console.log(
      `Push to ${ref}: ${commits.length} commits in ${repository.full_name} - triggered analysis for ${codeRepositories.length} repositories`
    );
  } catch (error) {
    console.error("Error handling GitHub push event:", error);
  }
}
