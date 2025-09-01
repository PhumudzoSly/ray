import { logger } from "./logger.js";
import type { WebSocket } from "ws";

export enum ErrorCode {
  CONNECTION_FAILED = "CONNECTION_FAILED",
  YJS_SETUP_FAILED = "YJS_SETUP_FAILED",
  INVALID_MESSAGE = "INVALID_MESSAGE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  UNAUTHORIZED = "UNAUTHORIZED",
  ROOM_ERROR = "ROOM_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export interface ErrorContext {
  connectionId?: string;
  roomName?: string;
  clientIP?: string;
  userAgent?: string;
  operation?: string;
  [key: string]: any;
}

export class WebSocketError extends Error {
  public readonly code: ErrorCode;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    context: ErrorContext = {},
    recoverable = false
  ) {
    super(message);
    this.name = "WebSocketError";
    this.code = code;
    this.context = context;
    this.recoverable = recoverable;
  }
}

export class ErrorHandler {
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();

  handleConnectionError(
    error: Error,
    ws: WebSocket,
    context: ErrorContext = {}
  ): void {
    const errorKey = `${context.connectionId || "unknown"}-${error.name}`;
    this.incrementErrorCount(errorKey);

    logger.error("Connection error occurred", {
      error: error.message,
      stack: error.stack,
      errorCount: this.errorCounts.get(errorKey),
      ...context,
    });

    // Determine if error is recoverable
    const isRecoverable = this.isRecoverableError(error);

    if (isRecoverable) {
      this.attemptRecovery(ws, error, context);
    } else {
      this.closeConnectionGracefully(ws, error, context);
    }
  }

  handleYjsError(
    error: Error,
    connectionId: string,
    roomName: string,
    context: ErrorContext = {}
  ): void {
    const wsError = new WebSocketError(
      ErrorCode.YJS_SETUP_FAILED,
      `Y.js operation failed: ${error.message}`,
      { connectionId, roomName, ...context },
      false // Y.js errors are typically not recoverable
    );

    this.logError(wsError);
  }

  handleRoomError(
    error: Error,
    roomName: string,
    operation: string,
    context: ErrorContext = {}
  ): void {
    const wsError = new WebSocketError(
      ErrorCode.ROOM_ERROR,
      `Room operation failed: ${error.message}`,
      { roomName, operation, ...context },
      true // Room errors might be recoverable
    );

    this.logError(wsError);
  }

  handleServerError(error: Error, context: ErrorContext = {}): void {
    const wsError = new WebSocketError(
      ErrorCode.SERVER_ERROR,
      `Server error: ${error.message}`,
      context,
      false // Server errors are typically not recoverable
    );

    this.logError(wsError);

    // For critical server errors, we might want to trigger alerts
    if (this.isCriticalError(error)) {
      this.triggerAlert(wsError);
    }
  }

  handleNetworkError(
    error: Error,
    ws: WebSocket,
    context: ErrorContext = {}
  ): void {
    const wsError = new WebSocketError(
      ErrorCode.NETWORK_ERROR,
      `Network error: ${error.message}`,
      context,
      true // Network errors are often recoverable
    );

    this.logError(wsError);

    // Network errors might resolve themselves, so we can be more lenient
    if (ws.readyState === ws.OPEN) {
      logger.info("Network error occurred but connection still open", {
        ...context,
        error: error.message,
      });
    } else {
      this.closeConnectionGracefully(ws, error, context);
    }
  }

  private isRecoverableError(error: Error): boolean {
    // Define which errors are recoverable
    const recoverableErrors = [
      "ECONNRESET",
      "ETIMEDOUT",
      "EPIPE",
      "EHOSTUNREACH",
    ];

    return recoverableErrors.some(
      (code) => error.message.includes(code) || error.name.includes(code)
    );
  }

  private attemptRecovery(
    ws: WebSocket,
    error: Error,
    context: ErrorContext
  ): void {
    logger.info("Attempting error recovery", {
      error: error.message,
      ...context,
    });

    // For now, just log the recovery attempt
    // In the future, we could implement specific recovery strategies
    // like reconnection logic, state restoration, etc.

    if (ws.readyState !== ws.OPEN) {
      this.closeConnectionGracefully(ws, error, context);
    }
  }

  private closeConnectionGracefully(
    ws: WebSocket,
    error: Error,
    context: ErrorContext
  ): void {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.close(1011, `Server error: ${error.message.substring(0, 100)}`);
      } else {
        ws.terminate();
      }

      logger.info("Connection closed due to error", {
        error: error.message,
        ...context,
      });
    } catch (closeError) {
      logger.error("Failed to close connection gracefully", {
        originalError: error.message,
        closeError:
          closeError instanceof Error ? closeError.message : String(closeError),
        ...context,
      });

      // Force terminate if graceful close fails
      try {
        ws.terminate();
      } catch (terminateError) {
        logger.error("Failed to terminate connection", {
          error:
            terminateError instanceof Error
              ? terminateError.message
              : String(terminateError),
          ...context,
        });
      }
    }
  }

  private logError(error: WebSocketError): void {
    logger.error(`${error.code}: ${error.message}`, {
      code: error.code,
      recoverable: error.recoverable,
      context: error.context,
      stack: error.stack,
    });
  }

  private incrementErrorCount(errorKey: string): void {
    const current = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, current + 1);
    this.lastErrorTime.set(errorKey, Date.now());
  }

  private isCriticalError(error: Error): boolean {
    // Define critical errors that need immediate attention
    const criticalPatterns = [
      "EMFILE", // Too many open files
      "ENOMEM", // Out of memory
      "ENOSPC", // No space left on device
      "Maximum call stack size exceeded",
    ];

    return criticalPatterns.some(
      (pattern) =>
        error.message.includes(pattern) || error.stack?.includes(pattern)
    );
  }

  private triggerAlert(error: WebSocketError): void {
    // Placeholder for alerting system
    logger.error("CRITICAL ERROR DETECTED", {
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: new Date().toISOString(),
    });

    // In production, this could:
    // - Send notifications to monitoring systems
    // - Trigger PagerDuty alerts
    // - Send emails to administrators
    // - Post to Slack channels
  }

  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: Array<{ key: string; count: number; lastOccurred: Date }>;
  } {
    const errorsByType: Record<string, number> = {};
    const recentErrors: Array<{
      key: string;
      count: number;
      lastOccurred: Date;
    }> = [];

    for (const [key, count] of this.errorCounts.entries()) {
      const errorType = key.split("-")[1] || "unknown";
      errorsByType[errorType] = (errorsByType[errorType] || 0) + count;

      const lastTime = this.lastErrorTime.get(key);
      if (lastTime) {
        recentErrors.push({
          key,
          count,
          lastOccurred: new Date(lastTime),
        });
      }
    }

    // Sort by most recent
    recentErrors.sort(
      (a, b) => b.lastOccurred.getTime() - a.lastOccurred.getTime()
    );

    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce(
        (sum, count) => sum + count,
        0
      ),
      errorsByType,
      recentErrors: recentErrors.slice(0, 10), // Top 10 most recent
    };
  }

  // Clean up old error tracking data
  cleanupErrorStats(maxAge = 3600000): void {
    // 1 hour default
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, timestamp] of this.lastErrorTime.entries()) {
      if (now - timestamp > maxAge) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.errorCounts.delete(key);
      this.lastErrorTime.delete(key);
    }

    if (keysToDelete.length > 0) {
      logger.debug("Cleaned up old error statistics", {
        removedEntries: keysToDelete.length,
      });
    }
  }
}
