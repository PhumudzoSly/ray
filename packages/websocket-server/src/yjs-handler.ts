import { setupWSConnection } from "y-websocket/bin/utils";
import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { logger } from "./logger.js";

export class YjsConnectionHandler {
  private activeConnections: Map<
    string,
    {
      ws: WebSocket;
      roomName: string;
      cleanup: () => void;
    }
  > = new Map();

  setupConnection(
    ws: WebSocket,
    request: IncomingMessage,
    roomName: string,
    connectionId: string
  ): void {
    try {
      logger.debug("Setting up Y.js connection", {
        connectionId,
        roomName,
        url: request.url,
      });

      // Set up Y.js WebSocket connection with room-specific document
      const cleanup = setupWSConnection(ws, request, {
        docName: roomName,
        gc: true, // Enable garbage collection for better memory management
      });

      // Store connection info for cleanup
      this.activeConnections.set(connectionId, {
        ws,
        roomName,
        cleanup: cleanup || (() => {}), // Fallback if setupWSConnection doesn't return cleanup
      });

      // Enhanced logging for Y.js events
      const originalSend = ws.send.bind(ws);
      ws.send = (data: any, options?: any, cb?: any) => {
        logger.debug("Y.js message sent", {
          connectionId,
          roomName,
          dataLength: data?.length || 0,
          type: this.getMessageType(data),
        });
        return originalSend(data, options, cb);
      };

      // Log when connection receives Y.js messages
      ws.on("message", (data) => {
        logger.debug("Y.js message received", {
          connectionId,
          roomName,
          dataLength: Buffer.isBuffer(data)
            ? data.length
            : (data as ArrayBuffer)?.byteLength || 0,
          type: this.getMessageType(data),
        });
      });

      logger.info("Y.js connection established", {
        connectionId,
        roomName,
        totalYjsConnections: this.activeConnections.size,
      });
    } catch (error) {
      logger.error("Failed to setup Y.js connection", {
        connectionId,
        roomName,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Close the WebSocket if Y.js setup fails
      ws.close(1011, "Y.js setup failed");
    }
  }

  cleanupConnection(connectionId: string): void {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) {
      logger.debug("No Y.js connection to cleanup", { connectionId });
      return;
    }

    try {
      // Call the cleanup function returned by setupWSConnection
      connection.cleanup();

      this.activeConnections.delete(connectionId);

      logger.info("Y.js connection cleaned up", {
        connectionId,
        roomName: connection.roomName,
        remainingConnections: this.activeConnections.size,
      });
    } catch (error) {
      logger.error("Error during Y.js cleanup", {
        connectionId,
        roomName: connection.roomName,
        error: error instanceof Error ? error.message : String(error),
      });

      // Force remove from tracking even if cleanup failed
      this.activeConnections.delete(connectionId);
    }
  }

  private getMessageType(data: any): string {
    if (!data || !data.length) return "unknown";

    try {
      // Y.js message types based on first byte
      const firstByte = data[0];
      switch (firstByte) {
        case 0:
          return "sync-step1";
        case 1:
          return "sync-step2";
        case 2:
          return "update";
        case 3:
          return "auth";
        case 4:
          return "query-awareness";
        case 5:
          return "awareness";
        default:
          return `unknown-${firstByte}`;
      }
    } catch {
      return "parse-error";
    }
  }

  getConnectionStats(): {
    totalConnections: number;
    roomCounts: Record<string, number>;
  } {
    const roomCounts: Record<string, number> = {};

    for (const connection of this.activeConnections.values()) {
      roomCounts[connection.roomName] =
        (roomCounts[connection.roomName] || 0) + 1;
    }

    return {
      totalConnections: this.activeConnections.size,
      roomCounts,
    };
  }

  // Get all active room names
  getActiveRooms(): string[] {
    const rooms = new Set<string>();
    for (const connection of this.activeConnections.values()) {
      rooms.add(connection.roomName);
    }
    return Array.from(rooms);
  }

  // Get connections for a specific room
  getRoomConnections(roomName: string): string[] {
    const connections: string[] = [];
    for (const [connectionId, connection] of this.activeConnections.entries()) {
      if (connection.roomName === roomName) {
        connections.push(connectionId);
      }
    }
    return connections;
  }
}
