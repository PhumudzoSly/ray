import { describe, it, expect, vi, beforeEach } from "vitest";
import { SecurityManager } from "../security.js";
import type { ConnectionInfo } from "../types.js";

describe("SecurityManager", () => {
  let securityManager: SecurityManager;
  const allowedOrigins = ["http://localhost:3000", "https://app.rayai.app"];

  beforeEach(() => {
    securityManager = new SecurityManager(allowedOrigins, 2); // Low limit for testing
    vi.clearAllMocks();
  });

  describe("validateConnection", () => {
    it("should accept connections from allowed origins", () => {
      const info: ConnectionInfo = {
        origin: "http://localhost:3000",
        req: {
          headers: { origin: "http://localhost:3000" },
          connection: { remoteAddress: "127.0.0.1" },
        } as any,
        secure: false,
      };

      expect(securityManager.validateConnection(info)).toBe(true);
    });

    it("should reject connections from disallowed origins", () => {
      const info: ConnectionInfo = {
        origin: "http://malicious-site.com",
        req: {
          headers: { origin: "http://malicious-site.com" },
          connection: { remoteAddress: "127.0.0.1" },
        } as any,
        secure: false,
      };

      expect(securityManager.validateConnection(info)).toBe(false);
    });

    it("should allow connections without origin in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const info: ConnectionInfo = {
        req: {
          headers: {},
          connection: { remoteAddress: "127.0.0.1" },
        } as any,
        secure: false,
      };

      expect(securityManager.validateConnection(info)).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it("should enforce rate limiting per IP", () => {
      const info: ConnectionInfo = {
        origin: "http://localhost:3000",
        req: {
          headers: { origin: "http://localhost:3000" },
          connection: { remoteAddress: "127.0.0.1" },
        } as any,
        secure: false,
      };

      // First two connections should succeed
      expect(securityManager.validateConnection(info)).toBe(true);
      securityManager.trackConnection("127.0.0.1");

      expect(securityManager.validateConnection(info)).toBe(true);
      securityManager.trackConnection("127.0.0.1");

      // Third connection should be rejected
      expect(securityManager.validateConnection(info)).toBe(false);
    });
  });

  describe("connection tracking", () => {
    it("should track and release connections correctly", () => {
      const ip = "192.168.1.1";

      securityManager.trackConnection(ip);
      expect(securityManager.getConnectionStats()[ip]).toBe(1);

      securityManager.trackConnection(ip);
      expect(securityManager.getConnectionStats()[ip]).toBe(2);

      securityManager.releaseConnection(ip);
      expect(securityManager.getConnectionStats()[ip]).toBe(1);

      securityManager.releaseConnection(ip);
      expect(securityManager.getConnectionStats()[ip]).toBeUndefined();
    });

    it("should handle releasing non-existent connections gracefully", () => {
      const ip = "192.168.1.1";

      expect(() => securityManager.releaseConnection(ip)).not.toThrow();
      expect(securityManager.getConnectionStats()[ip]).toBeUndefined();
    });
  });

  describe("future authentication hooks", () => {
    it("should have placeholder methods for future features", async () => {
      expect(await securityManager.validateToken("fake-token")).toBe(true);
      expect(await securityManager.extractUser("fake-token")).toBe(null);
      expect(await securityManager.authorizeRoom("user1", "room1")).toBe(true);
    });
  });
});
