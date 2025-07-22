"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";
import { redirect } from "next/navigation";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  locked: boolean;
  assignees: Array<{
    login: string;
    id: number;
    avatar_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

interface GitHubIntegrationConfig {
  accessToken: string;
  githubUserId: number;
  githubUsername: string;
  repositories: string[];
  webhookUrl: string;
  webhookId?: number;
  [key: string]: any;
}

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  const required = [
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

/**
 * Generate GitHub OAuth URL for integration setup
 */
export const generateGitHubOAuthUrl = async () => {
  validateEnvironment();

  const { org } = await getSession();
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;
  const state = `org:${org}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo read:org read:user",
    state: state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

/**
 * Handle GitHub OAuth callback
 */
export const handleGitHubOAuthCallback = async (
  code: string,
  state: string
) => {
  try {
    validateEnvironment();

    const { org, userId } = await getSession();

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`GitHub token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(
        `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`
      );
    }

    if (!tokenData.access_token) {
      throw new Error("No access token received from GitHub");
    }

    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch GitHub user: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Validate user data
    if (!userData.login || !userData.id) {
      throw new Error("Invalid GitHub user data received");
    }

    // Check if integration already exists for this user
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        organizationId: org,
        type: "GITHUB",
        config: {
          path: ["githubUserId"],
          equals: userData.id,
        },
      },
    });

    if (existingIntegration) {
      // Type assertion for config since we know it's a GitHub integration
      const existingConfig =
        existingIntegration.config as unknown as GitHubIntegrationConfig;

      // Update existing integration
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          config: {
            accessToken,
            githubUserId: userData.id,
            githubUsername: userData.login,
            repositories: existingConfig.repositories || [],
            webhookUrl: existingConfig.webhookUrl || "",
            webhookId: existingConfig.webhookId,
          } as GitHubIntegrationConfig,
        },
      });

      return { success: true, integrationId: existingIntegration.id };
    } else {
      // Create new integration
      const integration = await prisma.integration.create({
        data: {
          name: `GitHub - ${userData.login}`,
          type: "GITHUB",
          config: {
            accessToken,
            githubUserId: userData.id,
            githubUsername: userData.login,
            repositories: [],
            webhookUrl: "",
          } as GitHubIntegrationConfig,
          organizationId: org,
          createdById: userId,
          isActive: true,
        },
      });

      return { success: true, integrationId: integration.id };
    }
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    throw error;
  }
};

/**
 * Get user's GitHub repositories
 */
export const getGitHubRepositories = async (integrationId: string) => {
  try {
    const { org } = await getSession();

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId: org, type: "GITHUB" },
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    if (!integration.config) {
      throw new Error("GitHub integration config is missing");
    }

    const config = integration.config as unknown as GitHubIntegrationConfig;

    if (!config.accessToken) {
      throw new Error("GitHub integration is not properly connected");
    }

    const accessToken = config.accessToken;

    const response = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "GitHub access token is invalid or expired. Please reconnect your GitHub account."
        );
      } else if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Please try again later."
        );
      } else {
        throw new Error(
          `Failed to fetch GitHub repositories: ${response.status} ${response.statusText}`
        );
      }
    }

    const repositories: GitHubRepository[] = await response.json();

    if (!Array.isArray(repositories)) {
      throw new Error("Invalid response from GitHub API");
    }

    return repositories;
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    throw error;
  }
};

/**
 * Update integration with selected repositories
 */
export const updateGitHubRepositories = async (
  integrationId: string,
  repositoryNames: string[]
) => {
  try {
    const { org } = await getSession();

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId: org, type: "GITHUB" },
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    if (!integration.config) {
      throw new Error("GitHub integration config is missing");
    }

    const config = integration.config as unknown as GitHubIntegrationConfig;

    if (!config.accessToken) {
      throw new Error("GitHub integration is not properly connected");
    }

    // Validate repository names
    if (!Array.isArray(repositoryNames)) {
      throw new Error("Invalid repository names provided");
    }

    // Update the integration with selected repositories
    await prisma.integration.update({
      where: { id: integrationId, organizationId: org },
      data: {
        config: {
          ...config,
          repositories: repositoryNames,
        } as GitHubIntegrationConfig,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating GitHub repositories:", error);
    throw error;
  }
};

/**
 * Sync repository data (issues, code analysis, etc.)
 */
export const syncGitHubRepository = async (
  integrationId: string,
  repositoryName: string
) => {
  try {
    const { org } = await getSession();

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId: org, type: "GITHUB" },
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    if (!integration.config) {
      throw new Error("GitHub integration config is missing");
    }

    const config = integration.config as unknown as GitHubIntegrationConfig;

    if (!config.accessToken) {
      throw new Error("GitHub integration is not properly connected");
    }

    const accessToken = config.accessToken;

    // Get repository issues
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${repositoryName}/issues?state=all&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!issuesResponse.ok) {
      if (issuesResponse.status === 401) {
        throw new Error(
          "GitHub access token is invalid or expired. Please reconnect your GitHub account."
        );
      } else if (issuesResponse.status === 404) {
        throw new Error("Repository not found or you don't have access to it.");
      } else {
        throw new Error(
          `Failed to fetch repository issues: ${issuesResponse.status} ${issuesResponse.statusText}`
        );
      }
    }

    const issues: GitHubIssue[] = await issuesResponse.json();

    if (!Array.isArray(issues)) {
      throw new Error("Invalid response from GitHub API for issues");
    }

    // Get repository content for code analysis
    const contentResponse = await fetch(
      `https://api.github.com/repos/${repositoryName}/contents`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!contentResponse.ok) {
      if (contentResponse.status === 401) {
        throw new Error(
          "GitHub access token is invalid or expired. Please reconnect your GitHub account."
        );
      } else if (contentResponse.status === 404) {
        throw new Error("Repository not found or you don't have access to it.");
      } else {
        throw new Error(
          `Failed to fetch repository content: ${contentResponse.status} ${contentResponse.statusText}`
        );
      }
    }

    const content = await contentResponse.json();

    if (!Array.isArray(content)) {
      throw new Error("Invalid response from GitHub API for content");
    }

    // Here you would implement the actual sync logic:
    // 1. Create/update issues in your database
    // 2. Analyze code for progress, bugs, etc.
    // 3. Set up webhooks for real-time updates

    return {
      success: true,
      issuesCount: issues.length,
      contentFiles: content.length,
    };
  } catch (error) {
    console.error("Error syncing GitHub repository:", error);
    throw error;
  }
};

/**
 * Set up GitHub webhook for real-time updates
 */
export const setupGitHubWebhook = async (
  integrationId: string,
  repositoryName: string
) => {
  try {
    validateEnvironment();

    const { org } = await getSession();

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId: org, type: "GITHUB" },
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    if (!integration.config) {
      throw new Error("GitHub integration config is missing");
    }

    const config = integration.config as unknown as GitHubIntegrationConfig;

    if (!config.accessToken) {
      throw new Error("GitHub integration is not properly connected");
    }

    const accessToken = config.accessToken;
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/webhook`;

    // Create webhook
    const response = await fetch(
      `https://api.github.com/repos/${repositoryName}/hooks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: ["issues", "pull_request", "push"],
          config: {
            url: webhookUrl,
            content_type: "json",
            secret: process.env.GITHUB_WEBHOOK_SECRET,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}`;

      if (response.status === 401) {
        throw new Error(
          "GitHub access token is invalid or expired. Please reconnect your GitHub account."
        );
      } else if (response.status === 403) {
        throw new Error(
          "You don't have permission to create webhooks for this repository."
        );
      } else if (response.status === 422) {
        throw new Error("Webhook already exists for this repository.");
      } else {
        throw new Error(`Failed to create webhook: ${errorMessage}`);
      }
    }

    const webhook = await response.json();

    // Update integration with webhook info
    await prisma.integration.update({
      where: { id: integrationId, organizationId: org },
      data: {
        config: {
          ...config,
          webhookUrl: webhookUrl,
          webhookId: webhook.id,
        } as GitHubIntegrationConfig,
      },
    });

    return { success: true, webhookId: webhook.id };
  } catch (error) {
    console.error("Error setting up GitHub webhook:", error);
    throw error;
  }
};

/**
 * Get GitHub integration details
 */
export const getGitHubIntegration = async (integrationId: string) => {
  try {
    const { org } = await getSession();

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, organizationId: org, type: "GITHUB" },
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    return { success: true, data: integration };
  } catch (error) {
    console.error("Error fetching GitHub integration:", error);
    throw error;
  }
};
