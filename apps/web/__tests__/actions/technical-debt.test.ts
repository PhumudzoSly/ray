import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProjectTechnicalDebt,
  createTechnicalDebtIssues,
} from "@/actions/technical-debt";

// Mock Prisma
vi.mock("@workspace/backend", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    codeRepository: {
      findMany: vi.fn(),
    },
    issue: {
      create: vi.fn(),
    },
    codeQualityIssue: {
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/actions/account/user", () => ({
  getSession: vi.fn(() => ({ org: "test-org", userId: "test-user" })),
}));

describe("Technical Debt Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProjectTechnicalDebt", () => {
    it("should return zero debt for project with no repositories", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.project.findFirst.mockResolvedValue({
        id: "project-1",
        organizationId: "test-org",
      });
      prisma.codeRepository.findMany.mockResolvedValue([]);

      const result = await getProjectTechnicalDebt("project-1");

      expect(result.success).toBe(true);
      expect(result.data.totalDebtMinutes).toBe(0);
      expect(result.data.debtRatio).toBe(0);
      expect(result.data.repositories).toEqual([]);
    });

    it("should calculate technical debt correctly", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.project.findFirst.mockResolvedValue({
        id: "project-1",
        organizationId: "test-org",
      });
      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "test-repo",
          analyses: [
            {
              id: "analysis-1",
              technicalDebtMinutes: 120,
              linesOfCode: 1000,
              analyzedAt: new Date(),
            },
          ],
          issues: [
            { id: "issue-1", severity: "CRITICAL" },
            { id: "issue-2", severity: "MAJOR" },
          ],
        },
      ]);

      const result = await getProjectTechnicalDebt("project-1");

      expect(result.success).toBe(true);
      expect(result.data.totalDebtMinutes).toBe(120);
      expect(result.data.repositories).toHaveLength(1);
      expect(result.data.repositories[0].debtMinutes).toBe(120);
    });

    it("should handle project not found", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.project.findFirst.mockResolvedValue(null);

      await expect(getProjectTechnicalDebt("invalid-project")).rejects.toThrow(
        "Project not found"
      );
    });
  });

  describe("createTechnicalDebtIssues", () => {
    it("should create issues for high technical debt", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "test-repo",
          analyses: [
            {
              id: "analysis-1",
              technicalDebtMinutes: 300, // 5 hours, above threshold
            },
          ],
          issues: [
            {
              id: "issue-1",
              type: "VULNERABILITY",
              severity: "CRITICAL",
              effort: 120,
            },
          ],
        },
      ]);

      prisma.issue.create.mockResolvedValue({ id: "new-issue-1" });
      prisma.codeQualityIssue.update.mockResolvedValue({});

      const result = await createTechnicalDebtIssues("project-1", 120);

      expect(result.success).toBe(true);
      expect(result.data.createdIssues).toBeGreaterThan(0);
      expect(prisma.issue.create).toHaveBeenCalled();
    });

    it("should skip repositories with low technical debt", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "test-repo",
          analyses: [
            {
              id: "analysis-1",
              technicalDebtMinutes: 60, // Below threshold
            },
          ],
          issues: [],
        },
      ]);

      const result = await createTechnicalDebtIssues("project-1", 120);

      expect(result.success).toBe(true);
      expect(result.data.createdIssues).toBe(0);
      expect(prisma.issue.create).not.toHaveBeenCalled();
    });
  });
});
