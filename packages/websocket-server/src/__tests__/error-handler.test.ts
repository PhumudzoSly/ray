import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorHandler, ErrorCode, WebSocketError } from "../error-handler.js";
import { WebSocket } from "ws";

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;
  let mockWebSocket: WebSocket;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
    mockWebSocket = {
      readyState: 1, // OPEN
      OPEN: 1,
      close: vi.fn(),
      terminate: vi.fn(),
    } as any;
  });

  describe("WebSocketError", () => {
    it("should create error with correct properties", () => {
      const error = new WebSocketError(
        ErrorCode.CONNECTION_FAILED,
        "Test error",
        { connectionId: "test-123" },
        true
      );

      expect(error.code).toBe(ErrorCode.CONNECTION_FAILED);
      expect(error.message).toBe("Test error");
      expect(error.context.connectionId).toBe("test-123");
      expect(error.recoverable).toBe(true);
      expect(error.name).toBe("WebSocketError");
    });
  });

  describe("handleConnectionError", () => {
    it("should handle recoverable errors gracefully", () => {
      const error = new Error("ECONNRESET: Connection reset by peer");

      errorHandler.handleConnectionError(error, mockWebSocket, {
        connectionId: "test-123",
        roomName: "test-room",
      });

      // Should not close connection for recoverable errors if still open
      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });

    it("should close connection for non-recoverable errors", () => {
      const error = new Error("Fatal error");

      errorHandler.handleConnectionError(error, mockWebSocket, {
        connectionId: "test-123",
      });

      expect(mockWebSocket.close).toHaveBeenCalledWith(
        1011,
        expect.stringContaining("Fatal error")
      );
    });

    it("should terminate connection if close fails", () => {
      const error = new Error("Fatal error");
      mockWebSocket.close = vi.fn().mockImplementation(() => {
        throw new Error("Close failed");
      });

      errorHandler.handleConnectionError(error, mockWebSocket, {
        connectionId: "test-123",
      });

      expect(mockWebSocket.terminate).toHaveBeenCalled();
    });
  });

  describe("error statistics", () => {
    it("should track error counts correctly", () => {
      const error1 = new Error("Test error 1");
      const error2 = new Error("Test error 2");

      errorHandler.handleConnectionError(error1, mockWebSocket, {
        connectionId: "conn-1",
      });
      errorHandler.handleConnectionError(error1, mockWebSocket, {
        connectionId: "conn-1",
      });
      errorHandler.handleConnectionError(error2, mockWebSocket, {
        connectionId: "conn-2",
      });

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.recentErrors).toHaveLength(2); // Two different error keys
    });

    it("should clean up old error statistics", () => {
      const error = new Error("Old error");

      errorHandler.handleConnectionError(error, mockWebSocket, {
        connectionId: "test-123",
      });

      let stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);

      // Clean up with very short max age
      errorHandler.cleanupErrorStats(0);

      stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(0);
    });
  });

  describe("Y.js error handling", () => {
    it("should handle Y.js setup errors", () => {
      const error = new Error("Y.js setup failed");

      expect(() => {
        errorHandler.handleYjsError(error, "conn-123", "room-456");
      }).not.toThrow();
    });
  });

  describe("room error handling", () => {
    it("should handle room operation errors", () => {
      const error = new Error("Room operation failed");

      expect(() => {
        errorHandler.handleRoomError(error, "test-room", "addClient");
      }).not.toThrow();
    });
  });

  describe("server error handling", () => {
    it("should handle general server errors", () => {
      const error = new Error("Server error");

      expect(() => {
        errorHandler.handleServerError(error);
      }).not.toThrow();
    });

    it("should identify critical errors", () => {
      const criticalError = new Error("EMFILE: too many open files");

      expect(() => {
        errorHandler.handleServerError(criticalError);
      }).not.toThrow();
    });
  });

  describe("network error handling", () => {
    it("should handle network errors when connection is open", () => {
      const error = new Error("ETIMEDOUT: Network timeout");

      errorHandler.handleNetworkError(error, mockWebSocket, {
        connectionId: "test-123",
      });

      // Should not close connection if it's still open and error is recoverable
      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });

    it("should close connection when WebSocket is not open", () => {
      const error = new Error("Network error");
      mockWebSocket.readyState = 3; // CLOSED

      errorHandler.handleNetworkError(error, mockWebSocket, {
        connectionId: "test-123",
      });

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });
});
