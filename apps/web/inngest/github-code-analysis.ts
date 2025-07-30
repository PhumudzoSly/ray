import { inngestClient } from "@/lib/inngest";
import { prisma } from "@workspace/backend";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

// Code analysis function
export const analyzeCode = inngestClient.createFunction(
  { name: "Analyze Code", id: "github-code-analyze" },
  { event: "github/code.analyze" },
  async ({ event, step }) => {
    const {
      repositoryId,
      projectId,
      organizationId,
      commitSha,
      previousCommitSha,
      branch,
      commits,
      repository,
    } = event.data;

    // Get repository details
    const codeRepository = await step.run("get-repository", async () => {
      return await prisma.codeRepository.findUnique({
        where: { id: repositoryId },
        include: { project: true },
      });
    });

    if (!codeRepository) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    // Fetch code from GitHub
    const codeFiles = await step.run("fetch-code", async () => {
      return await fetchRepositoryCode(
        codeRepository.accessToken,
        repository.full_name,
        commitSha
      );
    });

    // Analyze code metrics
    const codeMetrics = await step.run("analyze-metrics", async () => {
      return await analyzeCodeMetrics(codeFiles);
    });

    // Detect code issues
    const codeIssues = await step.run("detect-issues", async () => {
      return await detectCodeIssues(
        codeFiles,
        codeRepository.accessToken,
        repository.full_name
      );
    });

    // Generate AI insights
    const aiInsights = await step.run("generate-ai-insights", async () => {
      return await generateAICodeInsights(codeFiles, codeMetrics, codeIssues);
    });

    // Save analysis results
    const analysis = await step.run("save-analysis", async () => {
      return await prisma.codeAnalysis.create({
        data: {
          repositoryId,
          commitSha,
          branch,
          linesOfCode: codeMetrics.linesOfCode,
          cyclomaticComplexity: codeMetrics.cyclomaticComplexity,
          technicalDebtMinutes: codeMetrics.technicalDebtMinutes,
          maintainabilityIndex: codeMetrics.maintainabilityIndex,
          testCoverage: codeMetrics.testCoverage,
          securityScore: codeMetrics.securityScore,
        },
      });
    });

    // Save code issues
    await step.run("save-issues", async () => {
      const issuePromises = codeIssues.map((issue) =>
        prisma.codeQualityIssue.create({
          data: {
            repositoryId,
            analysisId: analysis.id,
            type: issue.type,
            severity: issue.severity,
            file: issue.file,
            line: issue.line,
            column: issue.column,
            message: issue.message,
            rule: issue.rule,
            effort: issue.effort,
            aiSuggestion: issue.aiSuggestion,
          },
        })
      );
      return await Promise.all(issuePromises);
    });

    // Create project issues for critical problems
    await step.run("create-project-issues", async () => {
      const criticalIssues = codeIssues.filter(
        (issue) => issue.severity === "CRITICAL"
      );

      for (const issue of criticalIssues.slice(0, 5)) {
        // Limit to 5 critical issues
        await prisma.issue.create({
          data: {
            title: `Code Quality: ${issue.message}`,
            description: `**File:** ${issue.file}:${issue.line}\n\n**Rule:** ${issue.rule}\n\n**AI Suggestion:** ${issue.aiSuggestion || "No suggestion available"}`,
            projectId,
            organizationId,
            status: "BACKLOG",
            priority: "HIGH",
            label: issue.type === "VULNERABILITY" ? "SECURITY" : "BUG",
            sourceType: "code_analysis",
          },
        });
      }
    });

    // Update repository last analyzed timestamp
    await step.run("update-repository", async () => {
      return await prisma.codeRepository.update({
        where: { id: repositoryId },
        data: { lastAnalyzed: new Date() },
      });
    });

    return {
      analysisId: analysis.id,
      metrics: codeMetrics,
      issuesFound: codeIssues.length,
      criticalIssues: codeIssues.filter((i) => i.severity === "CRITICAL")
        .length,
    };
  }
);

// AI Code Review function for Pull Requests
export const reviewPullRequest = inngestClient.createFunction(
  { name: "Review Pull Request", id: "github-pr-review" },
  { event: "github/pull-request.review" },
  async ({ event, step }) => {
    const {
      repositoryId,
      projectId,
      organizationId,
      pullRequest,
      repository,
      action,
    } = event.data;

    // Get repository details
    const codeRepository = await step.run("get-repository", async () => {
      return await prisma.codeRepository.findUnique({
        where: { id: repositoryId },
      });
    });

    if (!codeRepository) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    // Fetch PR diff
    const prDiff = await step.run("fetch-pr-diff", async () => {
      return await fetchPullRequestDiff(
        codeRepository.accessToken,
        repository.full_name,
        pullRequest.number
      );
    });

    // Generate AI review
    const aiReview = await step.run("generate-ai-review", async () => {
      return await generateAIReview(prDiff, pullRequest);
    });

    // Save AI review
    const review = await step.run("save-review", async () => {
      return await prisma.aICodeReview.create({
        data: {
          repositoryId,
          pullRequestId: pullRequest.number.toString(),
          commitSha: pullRequest.head.sha,
          overallScore: aiReview.overallScore,
          reviewType: "pull_request",
          suggestions: aiReview.suggestions,
          positiveAspects: aiReview.positiveAspects,
          riskLevel: aiReview.riskLevel,
        },
      });
    });

    // Post review comments to GitHub (optional)
    if (aiReview.suggestions.length > 0) {
      await step.run("post-github-comments", async () => {
        return await postReviewComments(
          codeRepository.accessToken,
          repository.full_name,
          pullRequest.number,
          aiReview.suggestions
        );
      });
    }

    return {
      reviewId: review.id,
      overallScore: aiReview.overallScore,
      suggestionsCount: aiReview.suggestions.length,
      riskLevel: aiReview.riskLevel,
    };
  }
);

// Issue sync function
export const syncIssue = inngestClient.createFunction(
  { name: "Sync GitHub Issue", id: "github-issue-sync" },
  { event: "github/issue.sync" },
  async ({ event, step }) => {
    const {
      repositoryId,
      projectId,
      organizationId,
      action,
      issue,
      repository,
    } = event.data;

    // Check if issue already exists
    const existingIssue = await step.run("check-existing-issue", async () => {
      return await prisma.issue.findFirst({
        where: {
          projectId,
          sourceType: "github",
          sourceFeedbackId: issue.id.toString(),
        },
      });
    });

    if (action === "opened" && !existingIssue) {
      // Create new issue
      await step.run("create-issue", async () => {
        return await prisma.issue.create({
          data: {
            title: issue.title,
            description: issue.body || "",
            projectId,
            organizationId,
            status: issue.state === "open" ? "BACKLOG" : "DONE",
            priority: issue.labels.some((l) => l.name.includes("critical"))
              ? "CRITICAL"
              : "MEDIUM",
            label: determineIssueLabel(issue.labels),
            sourceType: "github",
            sourceFeedbackId: issue.id.toString(),
            isPublic: true,
          },
        });
      });
    } else if (existingIssue) {
      // Update existing issue
      await step.run("update-issue", async () => {
        return await prisma.issue.update({
          where: { id: existingIssue.id },
          data: {
            title: issue.title,
            description: issue.body || "",
            status: issue.state === "open" ? "BACKLOG" : "DONE",
            priority: issue.labels.some((l) => l.name.includes("critical"))
              ? "CRITICAL"
              : "MEDIUM",
            label: determineIssueLabel(issue.labels),
          },
        });
      });
    }

    return { action, issueId: issue.id, synced: true };
  }
);

// Helper functions
async function fetchRepositoryCode(
  accessToken: string,
  repoName: string,
  commitSha: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${repoName}/git/trees/${commitSha}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch repository tree: ${response.status}`);
  }

  const tree = await response.json();
  const codeFiles = tree.tree.filter(
    (file: any) =>
      file.type === "blob" &&
      /\.(ts|js|tsx|jsx|py|java|go|rs|php|rb|cs|cpp|c|h)$/.test(file.path) &&
      !file.path.includes("node_modules") &&
      !file.path.includes("dist") &&
      !file.path.includes("build")
  );

  // Fetch content for each file (limit to first 20 files for performance)
  const fileContents = await Promise.all(
    codeFiles.slice(0, 20).map(async (file: any) => {
      const contentResponse = await fetch(
        `https://api.github.com/repos/${repoName}/git/blobs/${file.sha}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (contentResponse.ok) {
        const content = await contentResponse.json();
        return {
          path: file.path,
          content: Buffer.from(content.content, "base64").toString("utf-8"),
          size: file.size,
        };
      }
      return null;
    })
  );

  return fileContents.filter(Boolean);
}

async function analyzeCodeMetrics(codeFiles: any[]) {
  let totalLines = 0;
  let totalComplexity = 0;
  let duplicatedLines = 0;
  let securityIssues = 0;

  for (const file of codeFiles) {
    const lines = file.content.split("\n").length;
    totalLines += lines;

    // Simple complexity calculation (count of if, for, while, switch)
    const complexityMatches = file.content.match(
      /\b(if|for|while|switch|catch)\b/g
    );
    totalComplexity += complexityMatches ? complexityMatches.length : 0;

    // Security and compliance checks
    const securityPatterns = [
      /eval\(/g,
      /innerHTML\s*=/g,
      /document\.write/g,
      /\.exec\(/g,
      /password.*=.*['"]/gi,
      /api[_-]?key.*=.*['"]/gi,
    ];

    // Compliance patterns (GDPR, SOC2, HIPAA, etc.)
    const compliancePatterns = [
      // GDPR compliance
      {
        pattern: /personal.*data|user.*data|pii/gi,
        type: "GDPR",
        severity: "MAJOR",
      },
      {
        pattern: /cookie.*consent|gdpr.*consent/gi,
        type: "GDPR",
        severity: "CRITICAL",
      },
      {
        pattern: /data.*retention|delete.*user/gi,
        type: "GDPR",
        severity: "MAJOR",
      },

      // SOC2 compliance
      {
        pattern: /audit.*log|security.*log/gi,
        type: "SOC2",
        severity: "MAJOR",
      },
      {
        pattern: /access.*control|authorization/gi,
        type: "SOC2",
        severity: "CRITICAL",
      },
      { pattern: /encryption|encrypt/gi, type: "SOC2", severity: "MAJOR" },

      // HIPAA compliance
      {
        pattern: /health.*data|medical.*record|phi/gi,
        type: "HIPAA",
        severity: "CRITICAL",
      },
      {
        pattern: /patient.*data|healthcare/gi,
        type: "HIPAA",
        severity: "CRITICAL",
      },

      // General security compliance
      {
        pattern: /sql.*injection|xss|csrf/gi,
        type: "SECURITY",
        severity: "CRITICAL",
      },
      {
        pattern: /authentication|session.*management/gi,
        type: "SECURITY",
        severity: "MAJOR",
      },
    ];

    for (const pattern of securityPatterns) {
      if (pattern.test(file.content)) {
        securityIssues++;
      }
    }

    // Check compliance patterns
    for (const { pattern, type, severity } of compliancePatterns) {
      if (pattern.test(file.content)) {
        securityIssues +=
          severity === "CRITICAL" ? 3 : severity === "MAJOR" ? 2 : 1;
      }
    }
  }

  const avgComplexity =
    codeFiles.length > 0 ? totalComplexity / codeFiles.length : 0;
  const maintainabilityIndex = Math.max(
    0,
    100 - avgComplexity * 2 - securityIssues * 5
  );
  const securityScore = Math.max(0, 100 - securityIssues * 10);
  const technicalDebtMinutes = Math.round(
    totalComplexity * 2 + securityIssues * 30
  );

  return {
    linesOfCode: totalLines,
    cyclomaticComplexity: avgComplexity,
    technicalDebtMinutes,
    maintainabilityIndex,
    testCoverage: null, // Would need more sophisticated analysis
    securityScore,
  };
}

async function detectCodeIssues(
  codeFiles: any[],
  accessToken: string,
  repoName: string
) {
  const issues = [];

  for (const file of codeFiles) {
    const lines = file.content.split("\n");

    // Detect various code issues
    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Security vulnerabilities
      if (/eval\(/.test(line)) {
        issues.push({
          type: "VULNERABILITY" as const,
          severity: "CRITICAL" as const,
          file: file.path,
          line: lineNumber,
          column: line.indexOf("eval(") + 1,
          message: "Use of eval() is dangerous and should be avoided",
          rule: "no-eval",
          effort: 30,
          aiSuggestion:
            "Replace eval() with safer alternatives like JSON.parse() or proper function calls",
        });
      }

      // Code smells
      if (line.length > 120) {
        issues.push({
          type: "CODE_SMELL" as const,
          severity: "MINOR" as const,
          file: file.path,
          line: lineNumber,
          column: 121,
          message: "Line too long (>120 characters)",
          rule: "max-line-length",
          effort: 5,
          aiSuggestion:
            "Break long lines into multiple lines for better readability",
        });
      }

      // TODO comments
      if (/\/\/\s*TODO|\/\*\s*TODO|\#\s*TODO/.test(line)) {
        issues.push({
          type: "CODE_SMELL" as const,
          severity: "INFO" as const,
          file: file.path,
          line: lineNumber,
          column: line.search(/TODO/i) + 1,
          message: "TODO comment found",
          rule: "no-todo",
          effort: 15,
          aiSuggestion:
            "Consider creating a proper issue or implementing the TODO item",
        });
      }

      // Hardcoded credentials
      if (
        /password.*=.*['"][^'"]+['"]|api[_-]?key.*=.*['"][^'"]+['"]/gi.test(
          line
        )
      ) {
        issues.push({
          type: "SECURITY_HOTSPOT" as const,
          severity: "CRITICAL" as const,
          file: file.path,
          line: lineNumber,
          column: 1,
          message: "Potential hardcoded credential detected",
          rule: "no-hardcoded-credentials",
          effort: 60,
          aiSuggestion:
            "Move credentials to environment variables or secure configuration",
        });
      }

      // GDPR Compliance checks
      if (/personal.*data|user.*data|pii/gi.test(line)) {
        issues.push({
          type: "VULNERABILITY" as const,
          severity: "MAJOR" as const,
          file: file.path,
          line: lineNumber,
          column: 1,
          message:
            "Potential personal data handling without proper GDPR compliance",
          rule: "gdpr-compliance",
          effort: 120,
          aiSuggestion:
            "Ensure proper consent mechanisms and data protection measures are in place",
        });
      }

      // Security vulnerability patterns
      if (/sql.*injection|xss|csrf/gi.test(line)) {
        issues.push({
          type: "VULNERABILITY" as const,
          severity: "CRITICAL" as const,
          file: file.path,
          line: lineNumber,
          column: 1,
          message: "Potential security vulnerability detected",
          rule: "security-vulnerability",
          effort: 180,
          aiSuggestion: "Implement proper input validation and sanitization",
        });
      }

      // SOC2 Compliance - Access control
      if (/access.*control|authorization|authenticate/gi.test(line)) {
        issues.push({
          type: "VULNERABILITY" as const,
          severity: "MAJOR" as const,
          file: file.path,
          line: lineNumber,
          column: 1,
          message:
            "Access control implementation requires SOC2 compliance review",
          rule: "soc2-access-control",
          effort: 90,
          aiSuggestion:
            "Ensure proper access controls and audit logging are implemented",
        });
      }

      // HIPAA Compliance - Health data
      if (/health.*data|medical.*record|phi|patient.*data/gi.test(line)) {
        issues.push({
          type: "VULNERABILITY" as const,
          severity: "CRITICAL" as const,
          file: file.path,
          line: lineNumber,
          column: 1,
          message: "Health data handling requires HIPAA compliance measures",
          rule: "hipaa-compliance",
          effort: 240,
          aiSuggestion:
            "Implement HIPAA-compliant data handling, encryption, and access controls",
        });
      }
    });
  }

  return issues;
}

async function generateAICodeInsights(
  codeFiles: any[],
  metrics: any,
  issues: any[]
) {
  try {
    const codeContext = codeFiles
      .slice(0, 5)
      .map((f) => `File: ${f.path}\n${f.content.slice(0, 1000)}`)
      .join("\n\n");

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze this code and provide insights:

Code Context:
${codeContext}

Current Metrics:
- Lines of Code: ${metrics.linesOfCode}
- Complexity: ${metrics.cyclomaticComplexity}
- Security Score: ${metrics.securityScore}
- Issues Found: ${issues.length}

Provide actionable insights for improving code quality.`,
      schema: z.object({
        overallAssessment: z.string(),
        keyStrengths: z.array(z.string()),
        improvementAreas: z.array(z.string()),
        recommendations: z.array(
          z.object({
            priority: z.enum(["high", "medium", "low"]),
            description: z.string(),
            estimatedEffort: z.string(),
          })
        ),
      }),
    });

    return result.object;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return {
      overallAssessment: "Unable to generate AI insights",
      keyStrengths: [],
      improvementAreas: [],
      recommendations: [],
    };
  }
}

async function fetchPullRequestDiff(
  accessToken: string,
  repoName: string,
  prNumber: number
) {
  const response = await fetch(
    `https://api.github.com/repos/${repoName}/pulls/${prNumber}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3.diff",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch PR diff: ${response.status}`);
  }

  return await response.text();
}

async function generateAIReview(diff: string, pullRequest: any) {
  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Review this pull request and provide feedback:

Title: ${pullRequest.title}
Description: ${pullRequest.body || "No description"}

Diff:
${diff.slice(0, 5000)} // Limit diff size

Provide a comprehensive code review focusing on:
1. Code quality and best practices
2. Potential bugs or issues
3. Security concerns
4. Performance implications
5. Maintainability

Be constructive and specific in your feedback.`,
      schema: z.object({
        overallScore: z.number().min(0).max(100),
        riskLevel: z.enum(["low", "medium", "high"]),
        suggestions: z.array(
          z.object({
            type: z.enum([
              "improvement",
              "bug_fix",
              "security",
              "performance",
              "style",
            ]),
            priority: z.enum(["high", "medium", "low"]),
            description: z.string(),
            codeExample: z.string().optional(),
            line: z.number().optional(),
          })
        ),
        positiveAspects: z.array(z.string()),
      }),
    });

    return result.object;
  } catch (error) {
    console.error("Error generating AI review:", error);
    return {
      overallScore: 50,
      riskLevel: "medium" as const,
      suggestions: [],
      positiveAspects: [],
    };
  }
}

async function postReviewComments(
  accessToken: string,
  repoName: string,
  prNumber: number,
  suggestions: any[]
) {
  // This would post comments to the GitHub PR
  // For now, we'll just log them
  console.log(
    `Would post ${suggestions.length} review comments to PR #${prNumber} in ${repoName}`
  );

  // Example implementation:
  // for (const suggestion of suggestions.slice(0, 3)) { // Limit comments
  //   await fetch(`https://api.github.com/repos/${repoName}/pulls/${prNumber}/comments`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //       Accept: "application/vnd.github.v3+json",
  //     },
  //     body: JSON.stringify({
  //       body: `**${suggestion.type.toUpperCase()}** (${suggestion.priority}): ${suggestion.description}`,
  //       commit_id: pullRequest.head.sha,
  //       path: "file.js", // Would need to determine from diff
  //       line: suggestion.line || 1,
  //     }),
  //   });
  // }
}

function determineIssueLabel(labels: any[]) {
  const labelMap: Record<string, any> = {
    bug: "BUG",
    feature: "FEATURE",
    enhancement: "IMPROVEMENT",
    documentation: "DOCUMENTATION",
    security: "SECURITY",
    performance: "PERFORMANCE",
  };

  for (const label of labels) {
    const mapped = labelMap[label.name.toLowerCase()];
    if (mapped) return mapped;
  }

  return "TASK";
}
