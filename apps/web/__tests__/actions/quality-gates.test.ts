import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  evaluateQualityGates,
  checkDeploymentGate,
} from "@/actions/quality-gates";

// Mock Prisma
vi.mock("@workspace/backend", () => ({
  prisma: {
    codeRepository: {
      findMany: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/actions/account/user", () => ({
  getSession: vi.fn(() => ({ org: "test-org", userId: "test-user" })),
}));

describe("Quality Gates Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("evaluateQualityGates", () => {
    it("should pass quality gates for healthy repositories", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "healthy-repo",
          analyses: [
            {
              maintainabilityIndex: 85,
              securityScore: 90,
              technicalDebtMinutes: 240, // 4 hours
            },
          ],
          issues: [], // No critical issues
        },
      ]);

      const result = await evaluateQualityGates("project-1");

      expect(result.passed).toBe(true);
      expect(result.blockers).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it("should fail quality gates for unhealthy repositories", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "unhealthy-repo",
          analyses: [
            {
              maintainabilityIndex: 50, // Below threshold (70)
              securityScore: 60, // Below threshold (80)
              technicalDebtMinutes: 600, // 10 hours
            },
          ],
          issues: [
            { severity: "CRITICAL" }, // Has critical issues
          ],
        },
      ]);

      const result = await evaluateQualityGates("project-1");

      expect(result.passed).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(0);
      expect(result.blockers.some((b) => b.includes("maintainability"))).toBe(
        true
      );
      expect(result.blockers.some((b) => b.includes("security"))).toBe(true);
      expect(result.blockers.some((b) => b.includes("critical issues"))).toBe(
        true
      );
    });

    it("should handle repositories with no analysis data", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "no-analysis-repo",
          analyses: [], // No analysis data
          issues: [],
        },
      ]);

      const result = await evaluateQualityGates("project-1");

      expect(result.passed).toBe(true);
      expect(result.warnings.some((w) => w.includes("no analysis data"))).toBe(
        true
      );
    });
  });

  describe("checkDeploymentGate", () => {
    it("should allow deployment when quality gates pass", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "healthy-repo",
          analyses: [
            {
              maintainabilityIndex: 85,
              securityScore: 90,
              technicalDebtMinutes: 240,
            },
          ],
          issues: [],
        },
      ]);

      const result = await checkDeploymentGate("project-1");

      expect(result.canDeploy).toBe(true);
      expect(result.reason).toBeUndefined();
      expect(result.qualityGateResult.passed).toBe(true);
    });

    it("should block deployment when quality gates fail", async () => {
      const { prisma } = await import("@workspace/backend");

      prisma.codeRepository.findMany.mockResolvedValue([
        {
          id: "repo-1",
          repositoryName: "unhealthy-repo",
          analyses: [
            {
              maintainabilityIndex: 50,
              securityScore: 60,
              technicalDebtMinutes: 600,
            },
          ],
          issues: [{ severity: "CRITICAL" }],
        },
      ]);

      const result = await checkDeploymentGate("project-1");

      expect(result.canDeploy).toBe(false);
      expect(result.reason).toContain("Quality gates failed");
      expect(result.qualityGateResult.passed).toBe(false);
    });
  });
});
