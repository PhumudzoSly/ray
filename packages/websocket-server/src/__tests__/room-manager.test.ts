import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RoomManager } from "../room-manager.js";
import type { ClientConnection } from "../types.js";
import { WebSocket } from "ws";

// Mock Y.js
vi.mock("yjs", () => ({
  Doc: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

describe("RoomManager", () => {
  let roomManager: RoomManager;
  let mockConnection: ClientConnection;

  beforeEach(() => {
    roomManager = new RoomManager(1000); // 1 second for testing
    mockConnection = {
      id: "test-conn-1",
      ws: new WebSocket("ws://localhost:1234") as any,
      roomName: "test-room",
      ip: "127.0.0.1",
      userAgent: "test-agent",
      connectedAt: new Date(),
      lastActivity: new Date(),
    };
  });

  afterEach(() => {
    roomManager.destroy();
  });

  describe("room creation and management", () => {
    it("should create a room when adding first client", () => {
      roomManager.addClientToRoom("test-room", mockConnection);

      const stats = roomManager.getRoomStats();
      expect(stats.totalRooms).toBe(1);
      expect(stats.rooms[0].name).toBe("test-room");
      expect(stats.rooms[0].clientCount).toBe(1);
    });

    it("should add multiple clients to the same room", () => {
      const connection2 = {
        ...mockConnection,
        id: "test-conn-2",
        ws: new WebSocket("ws://localhost:1234") as any,
      };

      roomManager.addClientToRoom("test-room", mockConnection);
      roomManager.addClientToRoom("test-room", connection2);

      const stats = roomManager.getRoomStats();
      expect(stats.totalRooms).toBe(1);
      expect(stats.rooms[0].clientCount).toBe(2);
    });

    it("should remove clients from rooms", () => {
      roomManager.addClientToRoom("test-room", mockConnection);
      roomManager.removeClientFromRoom("test-room", mockConnection);

      const stats = roomManager.getRoomStats();
      expect(stats.rooms[0].clientCount).toBe(0);
    });

    it("should handle removing client from non-existent room gracefully", () => {
      expect(() => {
        roomManager.removeClientFromRoom("non-existent", mockConnection);
      }).not.toThrow();
    });
  });

  describe("room cleanup", () => {
    it("should clean up empty idle rooms", async () => {
      roomManager.addClientToRoom("test-room", mockConnection);
      roomManager.removeClientFromRoom("test-room", mockConnection);

      // Wait for room to become idle
      await new Promise((resolve) => setTimeout(resolve, 1100));

      roomManager.cleanupEmptyRooms();

      const stats = roomManager.getRoomStats();
      expect(stats.totalRooms).toBe(0);
    });

    it("should not clean up rooms with active clients", async () => {
      roomManager.addClientToRoom("test-room", mockConnection);

      await new Promise((resolve) => setTimeout(resolve, 1100));

      roomManager.cleanupEmptyRooms();

      const stats = roomManager.getRoomStats();
      expect(stats.totalRooms).toBe(1);
    });
  });

  describe("statistics", () => {
    it("should provide accurate room statistics", () => {
      roomManager.addClientToRoom("room1", mockConnection);
      roomManager.addClientToRoom("room2", {
        ...mockConnection,
        id: "conn2",
        roomName: "room2",
      });

      const stats = roomManager.getRoomStats();
      expect(stats.totalRooms).toBe(2);
      expect(stats.rooms).toHaveLength(2);

      // Should be sorted by client count
      expect(stats.rooms[0].clientCount).toBeGreaterThanOrEqual(
        stats.rooms[1].clientCount
      );
    });

    it("should track active room count correctly", () => {
      roomManager.addClientToRoom("room1", mockConnection);
      roomManager.addClientToRoom("room2", {
        ...mockConnection,
        id: "conn2",
        roomName: "room2",
      });

      expect(roomManager.getActiveRoomCount()).toBe(2);

      roomManager.removeClientFromRoom("room1", mockConnection);
      expect(roomManager.getActiveRoomCount()).toBe(1);
    });

    it("should track total client count correctly", () => {
      const conn2 = { ...mockConnection, id: "conn2" };

      roomManager.addClientToRoom("room1", mockConnection);
      roomManager.addClientToRoom("room1", conn2);

      expect(roomManager.getTotalClientCount()).toBe(2);
    });
  });

  describe("room activity tracking", () => {
    it("should update room activity", () => {
      roomManager.addClientToRoom("test-room", mockConnection);

      const initialStats = roomManager.getRoomStats();
      const initialActivity = initialStats.rooms[0].lastActivity;

      // Wait a bit then update activity
      setTimeout(() => {
        roomManager.updateRoomActivity("test-room");

        const updatedStats = roomManager.getRoomStats();
        const updatedActivity = updatedStats.rooms[0].lastActivity;

        expect(updatedActivity.getTime()).toBeGreaterThan(
          initialActivity.getTime()
        );
      }, 10);
    });
  });
});
