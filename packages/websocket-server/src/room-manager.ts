import type { Room, ClientConnection } from "./types.js";
import { logger } from "./logger.js";

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxIdleTime: number;

  constructor(maxIdleTime = 3600000) {
    // 1 hour default
    this.maxIdleTime = maxIdleTime;
    this.startCleanupTimer();
  }

  addClientToRoom(roomName: string, connection: ClientConnection): void {
    let room = this.rooms.get(roomName);

    if (!room) {
      room = this.createRoom(roomName);
      this.rooms.set(roomName, room);

      logger.info("Room created", {
        roomName,
        totalRooms: this.rooms.size,
      });
    }

    room.clients.add(connection.ws);
    room.lastActivity = new Date();

    logger.debug("Client added to room", {
      roomName,
      connectionId: connection.id,
      clientsInRoom: room.clients.size,
      totalRooms: this.rooms.size,
    });
  }

  removeClientFromRoom(roomName: string, connection: ClientConnection): void {
    const room = this.rooms.get(roomName);
    if (!room) {
      logger.debug("Attempted to remove client from non-existent room", {
        roomName,
        connectionId: connection.id,
      });
      return;
    }

    room.clients.delete(connection.ws);
    room.lastActivity = new Date();

    logger.debug("Client removed from room", {
      roomName,
      connectionId: connection.id,
      clientsInRoom: room.clients.size,
    });

    // Don't immediately remove empty rooms - let cleanup timer handle it
    // This prevents rapid room creation/deletion cycles
  }

  private createRoom(roomName: string): Room {
    return {
      name: roomName,
      clients: new Set(),
      document: new (require("yjs").Doc)(), // Create Y.Doc for the room
      lastActivity: new Date(),
    };
  }

  private startCleanupTimer(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupEmptyRooms();
    }, 300000);
  }

  cleanupEmptyRooms(): void {
    const now = Date.now();
    const roomsToDelete: string[] = [];

    for (const [roomName, room] of this.rooms.entries()) {
      const isIdle = now - room.lastActivity.getTime() > this.maxIdleTime;
      const isEmpty = room.clients.size === 0;

      if (isEmpty && isIdle) {
        roomsToDelete.push(roomName);
      }
    }

    for (const roomName of roomsToDelete) {
      const room = this.rooms.get(roomName);
      if (room) {
        // Clean up Y.Doc to free memory
        room.document.destroy();
        this.rooms.delete(roomName);

        logger.info("Empty room cleaned up", {
          roomName,
          idleTime: now - room.lastActivity.getTime(),
          totalRooms: this.rooms.size,
        });
      }
    }

    if (roomsToDelete.length > 0) {
      logger.info("Room cleanup completed", {
        roomsRemoved: roomsToDelete.length,
        totalRooms: this.rooms.size,
      });
    }
  }

  getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      rooms: [] as Array<{
        name: string;
        clientCount: number;
        lastActivity: Date;
        idleTime: number;
      }>,
    };

    const now = Date.now();

    for (const [roomName, room] of this.rooms.entries()) {
      stats.rooms.push({
        name: roomName,
        clientCount: room.clients.size,
        lastActivity: room.lastActivity,
        idleTime: now - room.lastActivity.getTime(),
      });
    }

    // Sort by client count (most active first)
    stats.rooms.sort((a, b) => b.clientCount - a.clientCount);

    return stats;
  }

  getRoom(roomName: string): Room | undefined {
    return this.rooms.get(roomName);
  }

  getAllRoomNames(): string[] {
    return Array.from(this.rooms.keys());
  }

  getActiveRoomCount(): number {
    let activeCount = 0;
    for (const room of this.rooms.values()) {
      if (room.clients.size > 0) {
        activeCount++;
      }
    }
    return activeCount;
  }

  getTotalClientCount(): number {
    let totalClients = 0;
    for (const room of this.rooms.values()) {
      totalClients += room.clients.size;
    }
    return totalClients;
  }

  // Force cleanup for testing or manual maintenance
  forceCleanup(): void {
    logger.info("Force cleanup initiated");
    this.cleanupEmptyRooms();
  }

  // Update room activity (called when messages are sent/received)
  updateRoomActivity(roomName: string): void {
    const room = this.rooms.get(roomName);
    if (room) {
      room.lastActivity = new Date();
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clean up all rooms and their documents
    for (const [roomName, room] of this.rooms.entries()) {
      room.document.destroy();
      logger.debug("Room destroyed during shutdown", { roomName });
    }

    this.rooms.clear();
    logger.info("Room manager destroyed");
  }
}
