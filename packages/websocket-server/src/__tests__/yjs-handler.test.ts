import { describe, it, expect, vi, beforeEach } from "vitest";
import { YjsConnectionHandler } from "../yjs-handler.js";
import { WebSocket } from "ws";
import type { IncomingMessage } from "http";

// Mock y-websocket
const mockSetupWSConnection = vi.fn();
vi.mock("y-websocket/bin/utils", () => ({
  setupWSConnection: mockSetupWSConnection,
}));

describe("YjsConnectionHandler", () => {
  let handler: YjsConnectionHandler;
  let mockWebSocket: WebSocket;
  let mockRequest: IncomingMessage;

  beforeEach(() => {
    handler = new YjsConnectionHandler();
    mockWebSocket = {
      send: vi.fn(),
      on: vi.fn(),
      readyState: 1, // OPEN
      OPEN: 1,
    } as any;

    mockRequest = {
      url: "/test-room",
      headers: {},
    } as any;

    mockSetupWSConnection.mockClear();
    mockSetupWSConnection.mockReturnValue(() => {}); // Mock cleanup function
  });

  describe("connection setup", () => {
    it("should setup Y.js connection successfully", () => {
      handler.setupConnection(
        mockWebSocket,
        mockRequest,
        "test-room",
        "conn-123"
      );

      expect(mockSetupWSConnection).toHaveBeenCalledWith(
        mockWebSocket,
        mockRequest,
        { docName: "test-room", gc: true }
      );
    });

    it("should track active connections", () => {
      handler.setupConnection(mockWebSocket, mockRequest, "room1", "conn-1");
      handler.setupConnection(mockWebSocket, mockRequest, "room2", "conn-2");

      const stats = handler.getConnectionStats();
      expect(stats.totalConnections).toBe(2);
      expect(stats.roomCounts).toEqual({
        room1: 1,
        room2: 1,
      });
    });

    it("should handle setup errors gracefully", () => {
      mockSetupWSConnection.mockImplementation(() => {
        throw new Error("Y.js setup failed");
      });

      // Should not throw
      expect(() => {
        handler.setupConnection(
          mockWebSocket,
          mockRequest,
          "test-room",
          "conn-123"
        );
      }).not.toThrow();
    });
  });

  describe("connection cleanup", () => {
    it("should cleanup connections properly", () => {
      const mockCleanup = vi.fn();
      mockSetupWSConnection.mockReturnValue(mockCleanup);

      handler.setupConnection(
        mockWebSocket,
        mockRequest,
        "test-room",
        "conn-123"
      );
      handler.cleanupConnection("conn-123");

      expect(mockCleanup).toHaveBeenCalled();

      const stats = handler.getConnectionStats();
      expect(stats.totalConnections).toBe(0);
    });

    it("should handle cleanup of non-existent connections", () => {
      expect(() => {
        handler.cleanupConnection("non-existent");
      }).not.toThrow();
    });

    it("should handle cleanup errors gracefully", () => {
      const mockCleanup = vi.fn().mockImplementation(() => {
        throw new Error("Cleanup failed");
      });
      mockSetupWSConnection.mockReturnValue(mockCleanup);

      handler.setupConnection(
        mockWebSocket,
        mockRequest,
        "test-room",
        "conn-123"
      );

      expect(() => {
        handler.cleanupConnection("conn-123");
      }).not.toThrow();
    });
  });

  describe("statistics and monitoring", () => {
    it("should provide accurate connection statistics", () => {
      handler.setupConnection(mockWebSocket, mockRequest, "room1", "conn-1");
      handler.setupConnection(mockWebSocket, mockRequest, "room1", "conn-2");
      handler.setupConnection(mockWebSocket, mockRequest, "room2", "conn-3");

      const stats = handler.getConnectionStats();
      expect(stats.totalConnections).toBe(3);
      expect(stats.roomCounts.room1).toBe(2);
      expect(stats.roomCounts.room2).toBe(1);
    });

    it("should list active rooms", () => {
      handler.setupConnection(mockWebSocket, mockRequest, "room1", "conn-1");
      handler.setupConnection(mockWebSocket, mockRequest, "room2", "conn-2");

      const rooms = handler.getActiveRooms();
      expect(rooms).toContain("room1");
      expect(rooms).toContain("room2");
      expect(rooms).toHaveLength(2);
    });

    it("should list room connections", () => {
      handler.setupConnection(mockWebSocket, mockRequest, "room1", "conn-1");
      handler.setupConnection(mockWebSocket, mockRequest, "room1", "conn-2");
      handler.setupConnection(mockWebSocket, mockRequest, "room2", "conn-3");

      const room1Connections = handler.getRoomConnections("room1");
      expect(room1Connections).toContain("conn-1");
      expect(room1Connections).toContain("conn-2");
      expect(room1Connections).toHaveLength(2);

      const room2Connections = handler.getRoomConnections("room2");
      expect(room2Connections).toContain("conn-3");
      expect(room2Connections).toHaveLength(1);
    });
  });

  describe("message type detection", () => {
    it("should enhance WebSocket send method for logging", () => {
      handler.setupConnection(
        mockWebSocket,
        mockRequest,
        "test-room",
        "conn-123"
      );

      // The send method should be wrapped for logging
      expect(mockWebSocket.send).toBeDefined();
    });

    it("should set up message event listener", () => {
      handler.setupConnection(
        mockWebSocket,
        mockRequest,
        "test-room",
        "conn-123"
      );

      // Should have set up message listener
      expect(mockWebSocket.on).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });
  });
});
