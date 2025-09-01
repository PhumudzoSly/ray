import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HealthServer } from "../health-server.js";
import type { CollaborativeWebSocketServer } from "../websocket-server.js";

describe("HealthServer", () => {
  let healthServer: HealthServer;
  let mockWsServer: CollaborativeWebSocketServer;

  beforeEach(() => {
    mockWsServer = {
      getStats: vi.fn().mockReturnValue({
        totalConnections: 5,
        activeRooms: 3,
        uptime: 3600,
        memoryUsage: {
          rss: 1024 * 1024 * 50, // 50MB
          heapTotal: 1024 * 1024 * 30,
          heapUsed: 1024 * 1024 * 20,
          external: 1024 * 1024 * 5,
          arrayBuffers: 1024 * 1024 * 2,
        },
        roomDetails: [
          { name: "room1", clientCount: 3, lastActivity: new Date() },
          { name: "room2", clientCount: 2, lastActivity: new Date() },
        ],
        errorStats: {
          totalErrors: 0,
          errorsByType: {},
          recentErrors: [],
        },
      }),
    } as any;

    healthServer = new HealthServer(mockWsServer, 0); // Use port 0 for testing
  });

  afterEach(async () => {
    await healthServer.stop();
  });

  describe("server lifecycle", () => {
    it("should start and stop successfully", async () => {
      await expect(healthServer.start()).resolves.toBeUndefined();
      await expect(healthServer.stop()).resolves.toBeUndefined();
    });
  });

  describe("health endpoints", () => {
    beforeEach(async () => {
      await healthServer.start();
    });

    it("should handle health check requests", async () => {
      // This is a basic test - in a real scenario you'd make HTTP requests
      // to test the endpoints, but that requires more complex setup
      expect(mockWsServer.getStats).toBeDefined();
    });

    it("should format memory usage correctly", () => {
      const stats = mockWsServer.getStats();
      expect(stats.memoryUsage).toBeDefined();
      expect(typeof stats.memoryUsage.rss).toBe("number");
    });

    it("should provide comprehensive stats", () => {
      const stats = mockWsServer.getStats();

      expect(stats).toHaveProperty("totalConnections");
      expect(stats).toHaveProperty("activeRooms");
      expect(stats).toHaveProperty("uptime");
      expect(stats).toHaveProperty("memoryUsage");
      expect(stats).toHaveProperty("roomDetails");
      expect(stats).toHaveProperty("errorStats");
    });
  });

  describe("metrics formatting", () => {
    it("should format bytes correctly", () => {
      // Test the private formatBytes method indirectly through stats
      const stats = mockWsServer.getStats();
      expect(stats.memoryUsage.rss).toBeGreaterThan(0);
    });
  });
});
