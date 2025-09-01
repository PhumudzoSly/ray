import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CollaborativeWebSocketServer } from "../websocket-server.js";
import type { ServerConfig } from "../types.js";
import { WebSocket } from "ws";

// Mock Y.js
vi.mock("yjs", () => ({
  Doc: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

// Mock y-websocket
vi.mock("y-websocket/bin/utils", () => ({
  setupWSConnection: vi.fn().mockReturnValue(() => {}),
}));

describe("CollaborativeWebSocketServer", () => {
  let server: CollaborativeWebSocketServer;
  let config: ServerConfig;

  beforeEach(() => {
    config = {
      port: 0, // Use random available port for testing
      allowedOrigins: ["http://localhost:3000"],
      maxConnections: 100,
      logLevel: "error", // Reduce noise in tests
      roomCleanupInterval: 1000,
      maxIdleTime: 5000,
    };

    server = new CollaborativeWebSocketServer(config);
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("server lifecycle", () => {
    it("should start and stop successfully", async () => {
      await expect(server.start()).resolves.toBeUndefined();
      await expect(server.stop()).resolves.toBeUndefined();
    });

    it("should handle multiple start calls gracefully", async () => {
      await server.start();
      // Second start should not throw
      await expect(server.start()).resolves.toBeUndefined();
    });

    it("should handle stop without start", async () => {
      await expect(server.stop()).resolves.toBeUndefined();
    });
  });

  describe("statistics", () => {
    beforeEach(async () => {
      await server.start();
    });

    it("should provide server statistics", () => {
      const stats = server.getStats();

      expect(stats).toHaveProperty("totalConnections");
      expect(stats).toHaveProperty("activeRooms");
      expect(stats).toHaveProperty("uptime");
      expect(stats).toHaveProperty("memoryUsage");
      expect(stats).toHaveProperty("roomDetails");
      expect(stats).toHaveProperty("yjsConnections");
      expect(stats).toHaveProperty("securityStats");
      expect(stats).toHaveProperty("errorStats");

      expect(typeof stats.totalConnections).toBe("number");
      expect(typeof stats.activeRooms).toBe("number");
      expect(typeof stats.uptime).toBe("number");
      expect(Array.isArray(stats.roomDetails)).toBe(true);
    });

    it("should track connections correctly", () => {
      const initialStats = server.getStats();
      expect(initialStats.totalConnections).toBe(0);
      expect(initialStats.activeRooms).toBe(0);
    });
  });

  describe("configuration", () => {
    it("should use provided configuration", () => {
      const customConfig: ServerConfig = {
        port: 9999,
        allowedOrigins: ["https://example.com"],
        maxConnections: 50,
        logLevel: "debug",
        roomCleanupInterval: 2000,
        maxIdleTime: 10000,
      };

      const customServer = new CollaborativeWebSocketServer(customConfig);
      expect(customServer).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle server creation errors gracefully", async () => {
      // Try to bind to an invalid port
      const badConfig: ServerConfig = {
        ...config,
        port: -1,
      };

      const badServer = new CollaborativeWebSocketServer(badConfig);
      await expect(badServer.start()).rejects.toThrow();
    });
  });
});
