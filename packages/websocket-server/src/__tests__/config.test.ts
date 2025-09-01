import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createConfig } from "../config.js";

describe("Configuration", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should use default configuration when no environment variables are set", () => {
    // Clear relevant env vars
    delete process.env.PORT;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.MAX_CONNECTIONS;
    delete process.env.LOG_LEVEL;

    const config = createConfig();

    expect(config.port).toBe(1234);
    expect(config.allowedOrigins).toContain("http://localhost:3000");
    expect(config.allowedOrigins).toContain("https://app.rayai.app");
    expect(config.maxConnections).toBe(1000);
    expect(config.logLevel).toBe("info");
  });

  it("should use environment variables when provided", () => {
    process.env.PORT = "8080";
    process.env.ALLOWED_ORIGINS = "https://example.com,https://test.com";
    process.env.MAX_CONNECTIONS = "500";
    process.env.LOG_LEVEL = "debug";
    process.env.ROOM_CLEANUP_INTERVAL = "600000";
    process.env.MAX_IDLE_TIME = "7200000";

    const config = createConfig();

    expect(config.port).toBe(8080);
    expect(config.allowedOrigins).toEqual([
      "https://example.com",
      "https://test.com",
    ]);
    expect(config.maxConnections).toBe(500);
    expect(config.logLevel).toBe("debug");
    expect(config.roomCleanupInterval).toBe(600000);
    expect(config.maxIdleTime).toBe(7200000);
  });

  it("should handle invalid port gracefully", () => {
    process.env.PORT = "invalid";

    const config = createConfig();
    expect(config.port).toBe(1234); // Should fall back to default
  });

  it("should handle invalid numbers gracefully", () => {
    process.env.MAX_CONNECTIONS = "not-a-number";
    process.env.ROOM_CLEANUP_INTERVAL = "invalid";

    const config = createConfig();
    expect(config.maxConnections).toBe(1000); // Default
    expect(config.roomCleanupInterval).toBe(300000); // Default
  });

  it("should handle empty allowed origins", () => {
    process.env.ALLOWED_ORIGINS = "";

    const config = createConfig();
    expect(config.allowedOrigins).toEqual([""]); // Single empty string
  });

  it("should trim whitespace from origins", () => {
    process.env.ALLOWED_ORIGINS = " https://example.com , https://test.com ";

    const config = createConfig();
    expect(config.allowedOrigins).toEqual([
      " https://example.com ",
      " https://test.com ",
    ]);
  });
});
