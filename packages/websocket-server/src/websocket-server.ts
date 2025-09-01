import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { SecurityManager } from "./security.js";
import { YjsConnectionHandler } from "./yjs-handler.js";
import { RoomManager } from "./room-manager.js";
import { ErrorHandler } from "./error-handler.js";
import { logger } from "./logger.js";
import type { ServerConfig, ClientConnection } from "./types.js";

export class CollaborativeWebSocketServer {
  private wss: WebSocketServer | null = null;
  private security: SecurityManager;
  private yjsHandler: YjsConnectionHandler;
  private roomManager: RoomManager;
  private errorHandler: ErrorHandler;
  private config: ServerConfig;
  private connections: Map<string, ClientConnection> = new Map();
  private isShuttingDown = false;

  constructor(config: ServerConfig) {
    this.config = config;
    this.security = new SecurityManager(config.allowedOrigins);
    this.yjsHandler = new YjsConnectionHandler();
    this.roomManager = new RoomManager(config.maxIdleTime);
    this.errorHandler = new ErrorHandler();
    this.setupGracefulShutdown();
    this.setupErrorCleanup();
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({
          port: this.config.port,
          perMessageDeflate: {
            zlibDeflateOptions: {
              level: 1,
              chunkSize: 1024,
            },
            threshold: 1024,
            concurrencyLimit: 10,
            clientMaxWindowBits: 15,
            serverMaxWindowBits: 15,
            serverNoContextTakeover: false,
            clientMaxNoContextTakeover: false,
            zlibInflateOptions: {
              chunkSize: 1024,
            },
          },
          verifyClient: (info: any) => this.security.validateConnection(info),
        });

        this.wss.on("connection", this.handleConnection.bind(this));
        this.wss.on("error", this.handleServerError.bind(this));

        // Set up global error handlers
        process.on(
          "uncaughtException",
          this.handleUncaughtException.bind(this)
        );
        process.on(
          "unhandledRejection",
          this.handleUnhandledRejection.bind(this)
        );

        this.wss.on("listening", () => {
          logger.info("WebSocket server started", {
            port: this.config.port,
            allowedOrigins: this.config.allowedOrigins,
            maxConnections: this.config.maxConnections,
          });
          resolve();
        });
      } catch (error) {
        logger.error("Failed to start WebSocket server", {
          error: error instanceof Error ? error.message : String(error),
          port: this.config.port,
        });
        reject(error);
      }
    });
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    if (this.isShuttingDown) {
      ws.close(1001, "Server shutting down");
      return;
    }

    const connectionId = this.generateConnectionId();
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers["user-agent"] || "unknown";
    const roomName = this.extractRoomName(request);

    // Track connection for rate limiting
    this.security.trackConnection(clientIP);

    const connection: ClientConnection = {
      id: connectionId,
      ws,
      roomName,
      ip: clientIP,
      userAgent,
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    this.connections.set(connectionId, connection);

    // Add client to room
    this.roomManager.addClientToRoom(roomName, connection);

    logger.info("Client connected", {
      connectionId,
      roomName,
      clientIP,
      userAgent,
      totalConnections: this.connections.size,
    });

    // Set up Y.js document synchronization with error handling
    try {
      this.yjsHandler.setupConnection(ws, request, roomName, connectionId);
    } catch (error) {
      this.errorHandler.handleYjsError(
        error instanceof Error ? error : new Error(String(error)),
        connectionId,
        roomName,
        { clientIP, userAgent }
      );
      return; // Don't continue with connection setup if Y.js fails
    }

    // Set up connection event handlers
    ws.on("close", (code, reason) => {
      this.handleDisconnection(connectionId, code, reason);
    });

    ws.on("error", (error) => {
      this.handleConnectionError(connectionId, error);
    });

    ws.on("pong", () => {
      this.updateLastActivity(connectionId);
    });

    // Start heartbeat for this connection
    this.startHeartbeat(ws, connectionId);
  }

  private handleDisconnection(
    connectionId: string,
    code: number,
    reason: Buffer
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Clean up Y.js connection
    this.yjsHandler.cleanupConnection(connectionId);

    // Remove client from room
    this.roomManager.removeClientFromRoom(connection.roomName, connection);

    this.connections.delete(connectionId);
    this.security.releaseConnection(connection.ip);

    logger.info("Client disconnected", {
      connectionId,
      roomName: connection.roomName,
      clientIP: connection.ip,
      code,
      reason: reason.toString(),
      duration: Date.now() - connection.connectedAt.getTime(),
      totalConnections: this.connections.size,
    });
  }

  private handleConnectionError(connectionId: string, error: Error): void {
    const connection = this.connections.get(connectionId);

    // Use error handler for consistent error processing
    this.errorHandler.handleConnectionError(error, connection?.ws!, {
      connectionId,
      roomName: connection?.roomName,
      clientIP: connection?.ip,
      userAgent: connection?.userAgent,
    });

    // Clean up the connection
    if (connection) {
      this.handleDisconnection(
        connectionId,
        1006,
        Buffer.from("Connection error")
      );
    }
  }

  private handleServerError(error: Error): void {
    this.errorHandler.handleServerError(error, {
      port: this.config.port,
      totalConnections: this.connections.size,
    });
  }

  private extractRoomName(request: IncomingMessage): string {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    return url.pathname.slice(1) || "default";
  }

  private getClientIP(request: IncomingMessage): string {
    return (
      (request.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      (request.headers["x-real-ip"] as string) ||
      request.socket?.remoteAddress ||
      "unknown"
    );
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateLastActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  private startHeartbeat(ws: WebSocket, connectionId: string): void {
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      } else {
        clearInterval(interval);
      }
    }, 30000); // Ping every 30 seconds

    ws.on("close", () => clearInterval(interval));
  }

  getStats() {
    const roomStats = this.roomManager.getRoomStats();
    const yjsStats = this.yjsHandler.getConnectionStats();

    return {
      totalConnections: this.connections.size,
      activeRooms: this.roomManager.getActiveRoomCount(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      roomDetails: roomStats.rooms,
      yjsConnections: yjsStats.totalConnections,
      securityStats: this.security.getConnectionStats(),
      errorStats: this.errorHandler.getErrorStats(),
    };
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      logger.info("Graceful shutdown initiated");

      if (this.wss) {
        // Close server to stop accepting new connections
        this.wss.close(() => {
          logger.info("WebSocket server closed");
          process.exit(0);
        });

        // Close existing connections gracefully
        for (const connection of this.connections.values()) {
          connection.ws.close(1001, "Server shutting down");
        }
      } else {
        process.exit(0);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }

  private setupErrorCleanup(): void {
    // Clean up old error statistics every hour
    setInterval(() => {
      this.errorHandler.cleanupErrorStats();
    }, 3600000);
  }

  private handleUncaughtException(error: Error): void {
    logger.error("Uncaught exception", {
      error: error.message,
      stack: error.stack,
    });

    this.errorHandler.handleServerError(error, {
      type: "uncaughtException",
      fatal: true,
    });

    // Give some time for logging then exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }

  private handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    logger.error("Unhandled promise rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });

    this.errorHandler.handleServerError(
      reason instanceof Error ? reason : new Error(String(reason)),
      {
        type: "unhandledRejection",
      }
    );
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }

      this.isShuttingDown = true;

      this.wss.close(() => {
        // Clean up room manager
        this.roomManager.destroy();

        logger.info("WebSocket server stopped");
        resolve();
      });

      // Force close all connections
      for (const connection of this.connections.values()) {
        connection.ws.terminate();
      }
      this.connections.clear();
    });
  }
}
