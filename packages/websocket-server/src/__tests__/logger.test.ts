import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConsoleLogger } from "../logger.js";

describe("ConsoleLogger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log info messages by default", () => {
    const logger = new ConsoleLogger();
    logger.info("test message");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("INFO : test message")
    );
  });

  it("should include metadata in log output", () => {
    const logger = new ConsoleLogger();
    const metadata = { userId: "123", action: "connect" };

    logger.info("test message", metadata);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'test message {"userId":"123","action":"connect"}'
      )
    );
  });

  it("should respect log level filtering", () => {
    const logger = new ConsoleLogger("warn");

    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("WARN : warn message")
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("ERROR: error message")
    );
  });

  it("should format timestamps correctly", () => {
    const logger = new ConsoleLogger();
    logger.info("test message");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    );
  });

  it("should handle empty metadata gracefully", () => {
    const logger = new ConsoleLogger();
    logger.info("test message", {});

    expect(consoleSpy).toHaveBeenCalledWith(expect.not.stringContaining("{}"));
  });
});
