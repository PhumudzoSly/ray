import { z } from "zod";

// GitHub Repository Schema
export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  description: z.string().nullable(),
  html_url: z.string().url(),
  clone_url: z.string().url(),
  default_branch: z.string(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  updated_at: z.string(),
});

export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;

// GitHub Integration Configuration Schema
export const GitHubIntegrationConfigSchema = z.object({
  accessToken: z.string(),
  githubUserId: z.number(),
  githubUsername: z.string(),
  repositories: z.array(z.string()).default([]),
  webhookUrl: z.string().optional(),
  webhookId: z.number().optional(),
  // Additional fields for code analysis
  enableCodeAnalysis: z.boolean().default(true),
  enableIssueSync: z.boolean().default(true),
  enablePRReview: z.boolean().default(true),
  analysisSettings: z
    .object({
      languages: z
        .array(z.string())
        .default(["typescript", "javascript", "python", "java", "go"]),
      excludePatterns: z
        .array(z.string())
        .default(["node_modules/**", "dist/**", "build/**"]),
      includeTests: z.boolean().default(false),
      securityScanEnabled: z.boolean().default(true),
      complexityThreshold: z.number().min(1).max(100).default(10),
    })
    .optional(),
});

export type GitHubIntegrationConfig = z.infer<
  typeof GitHubIntegrationConfigSchema
>;

// GitHub Webhook Event Schemas
export const GitHubIssueEventSchema = z.object({
  action: z.enum([
    "opened",
    "closed",
    "reopened",
    "edited",
    "assigned",
    "unassigned",
  ]),
  issue: z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.enum(["open", "closed"]),
    locked: z.boolean(),
    assignees: z.array(
      z.object({
        login: z.string(),
        id: z.number(),
        avatar_url: z.string().url(),
      })
    ),
    labels: z.array(
      z.object({
        name: z.string(),
        color: z.string(),
      })
    ),
    created_at: z.string(),
    updated_at: z.string(),
    closed_at: z.string().nullable(),
    html_url: z.string().url(),
  }),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    html_url: z.string().url(),
    clone_url: z.string().url(),
    default_branch: z.string(),
  }),
});

export const GitHubPullRequestEventSchema = z.object({
  action: z.enum([
    "opened",
    "closed",
    "reopened",
    "edited",
    "synchronize",
    "ready_for_review",
  ]),
  pull_request: z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.enum(["open", "closed"]),
    merged: z.boolean(),
    draft: z.boolean(),
    head: z.object({
      sha: z.string(),
      ref: z.string(),
    }),
    base: z.object({
      sha: z.string(),
      ref: z.string(),
    }),
    created_at: z.string(),
    updated_at: z.string(),
    closed_at: z.string().nullable(),
    merged_at: z.string().nullable(),
    html_url: z.string().url(),
  }),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    html_url: z.string().url(),
    clone_url: z.string().url(),
    default_branch: z.string(),
  }),
});

export const GitHubPushEventSchema = z.object({
  ref: z.string(),
  before: z.string(),
  after: z.string(),
  commits: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      author: z.object({
        name: z.string(),
        email: z.string(),
        username: z.string().optional(),
      }),
      added: z.array(z.string()),
      removed: z.array(z.string()),
      modified: z.array(z.string()),
    })
  ),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    html_url: z.string().url(),
    clone_url: z.string().url(),
    default_branch: z.string(),
  }),
});

export type GitHubIssueEvent = z.infer<typeof GitHubIssueEventSchema>;
export type GitHubPullRequestEvent = z.infer<
  typeof GitHubPullRequestEventSchema
>;
export type GitHubPushEvent = z.infer<typeof GitHubPushEventSchema>;

// GitHub API Response Types
export const GitHubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  avatar_url: z.string().url(),
  html_url: z.string().url(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  bio: z.string().nullable(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;

// Code Analysis Types
export const CodeAnalysisRequestSchema = z.object({
  repositoryId: z.string().uuid(),
  commitSha: z.string(),
  branch: z.string().default("main"),
  analysisType: z
    .enum(["full", "incremental", "pull_request"])
    .default("incremental"),
  files: z.array(z.string()).optional(), // Specific files to analyze
});

export type CodeAnalysisRequest = z.infer<typeof CodeAnalysisRequestSchema>;

export const CodeMetricsSchema = z.object({
  linesOfCode: z.number().min(0),
  cyclomaticComplexity: z.number().min(0),
  cognitiveComplexity: z.number().min(0),
  technicalDebtRatio: z.number().min(0).max(100),
  maintainabilityIndex: z.number().min(0).max(100),
  duplicatedLines: z.number().min(0),
  testCoverage: z.number().min(0).max(100).optional(),
  securityScore: z.number().min(0).max(100),
});

export type CodeMetrics = z.infer<typeof CodeMetricsSchema>;

export const CodeIssueSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "BUG",
    "VULNERABILITY",
    "CODE_SMELL",
    "SECURITY_HOTSPOT",
    "PERFORMANCE",
    "MAINTAINABILITY",
  ]),
  severity: z.enum(["CRITICAL", "MAJOR", "MINOR", "INFO"]),
  file: z.string(),
  line: z.number().min(1),
  column: z.number().min(1).optional(),
  message: z.string(),
  rule: z.string(),
  effort: z.number().min(0), // minutes to fix
  aiSuggestion: z.string().optional(),
});

export type CodeIssue = z.infer<typeof CodeIssueSchema>;
