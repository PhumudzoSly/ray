import type { Logger } from "./types.js";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
};

const RESET_COLOR = "\x1b[0m";

export class ConsoleLogger implements Logger {
  private minLevel: number;

  constructor(level: LogLevel = "info") {
    this.minLevel = LOG_LEVELS[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    metadata?: object
  ): string {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];
    const levelStr = level.toUpperCase().padEnd(5);

    let logLine = `${color}[${timestamp}] ${levelStr}${RESET_COLOR}: ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      logLine += ` ${JSON.stringify(metadata)}`;
    }

    return logLine;
  }

  debug(message: string, metadata?: object): void {
    if (this.shouldLog("debug")) {
      console.log(this.formatMessage("debug", message, metadata));
    }
  }

  info(message: string, metadata?: object): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message, metadata));
    }
  }

  warn(message: string, metadata?: object): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, metadata));
    }
  }

  error(message: string, metadata?: object): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, metadata));
    }
  }
}

// Create default logger instance
export const logger = new ConsoleLogger(
  (process.env.LOG_LEVEL as LogLevel) || "info"
);
