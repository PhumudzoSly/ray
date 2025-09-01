import { createServer, IncomingMessage, ServerResponse } from "http";
import { logger } from "./logger.js";
import type { CollaborativeWebSocketServer } from "./websocket-server.js";

export class HealthServer {
  private server: ReturnType<typeof createServer> | null = null;
  private wsServer: CollaborativeWebSocketServer;
  private port: number;

  constructor(wsServer: CollaborativeWebSocketServer, port = 8080) {
    this.wsServer = wsServer;
    this.port = port;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.handleRequest.bind(this));

      this.server.listen(this.port, () => {
        logger.info("Health check server started", { port: this.port });
        resolve();
      });

      this.server.on("error", (error) => {
        logger.error("Health server error", { error: error.message });
        reject(error);
      });
    });
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method !== "GET") {
      this.sendResponse(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      switch (url.pathname) {
        case "/health":
          this.handleHealthCheck(res);
          break;
        case "/metrics":
          this.handleMetrics(res);
          break;
        case "/stats":
          this.handleStats(res);
          break;
        case "/ready":
          this.handleReadiness(res);
          break;
        case "/live":
          this.handleLiveness(res);
          break;
        default:
          this.sendResponse(res, 404, { error: "Not found" });
      }
    } catch (error) {
      logger.error("Health server request error", {
        path: url.pathname,
        error: error instanceof Error ? error.message : String(error),
      });
      this.sendResponse(res, 500, { error: "Internal server error" });
    }
  }

  private handleHealthCheck(res: ServerResponse): void {
    const stats = this.wsServer.getStats();
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "2.0.0",
      connections: stats.totalConnections,
      rooms: stats.activeRooms,
      memory: this.formatMemoryUsage(stats.memoryUsage),
      errors: stats.errorStats.totalErrors,
    };

    this.sendResponse(res, 200, health);
  }

  private handleMetrics(res: ServerResponse): void {
    const stats = this.wsServer.getStats();

    // Prometheus-style metrics
    const metrics = [
      `# HELP websocket_connections_total Total number of WebSocket connections`,
      `# TYPE websocket_connections_total gauge`,
      `websocket_connections_total ${stats.totalConnections}`,
      "",
      `# HELP websocket_rooms_active Number of active rooms`,
      `# TYPE websocket_rooms_active gauge`,
      `websocket_rooms_active ${stats.activeRooms}`,
      "",
      `# HELP websocket_uptime_seconds Server uptime in seconds`,
      `# TYPE websocket_uptime_seconds counter`,
      `websocket_uptime_seconds ${Math.floor(stats.uptime)}`,
      "",
      `# HELP websocket_memory_usage_bytes Memory usage in bytes`,
      `# TYPE websocket_memory_usage_bytes gauge`,
      `websocket_memory_usage_bytes{type="rss"} ${stats.memoryUsage.rss}`,
      `websocket_memory_usage_bytes{type="heapUsed"} ${stats.memoryUsage.heapUsed}`,
      `websocket_memory_usage_bytes{type="heapTotal"} ${stats.memoryUsage.heapTotal}`,
      "",
      `# HELP websocket_errors_total Total number of errors`,
      `# TYPE websocket_errors_total counter`,
      `websocket_errors_total ${stats.errorStats.totalErrors}`,
      "",
    ];

    // Add per-room metrics
    for (const room of stats.roomDetails) {
      metrics.push(
        `websocket_room_connections{room="${room.name}"} ${room.clientCount}`
      );
    }

    res.setHeader("Content-Type", "text/plain");
    this.sendResponse(res, 200, metrics.join("\n"), false);
  }

  private handleStats(res: ServerResponse): void {
    const stats = this.wsServer.getStats();

    const detailedStats = {
      ...stats,
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
      },
      system: {
        loadAverage:
          process.platform === "win32" ? [0, 0, 0] : process.loadavg(),
        cpuUsage: process.cpuUsage(),
      },
    };

    this.sendResponse(res, 200, detailedStats);
  }

  private handleReadiness(res: ServerResponse): void {
    // Check if server is ready to accept connections
    const stats = this.wsServer.getStats();
    const isReady = stats.totalConnections >= 0; // Simple check - server is running

    const readiness = {
      ready: isReady,
      timestamp: new Date().toISOString(),
      checks: {
        websocket_server: isReady,
        memory_usage: stats.memoryUsage.heapUsed < 1024 * 1024 * 1024, // < 1GB
        error_rate: stats.errorStats.totalErrors < 100, // Arbitrary threshold
      },
    };

    this.sendResponse(res, isReady ? 200 : 503, readiness);
  }

  private handleLiveness(res: ServerResponse): void {
    // Simple liveness check - if we can respond, we're alive
    const liveness = {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    this.sendResponse(res, 200, liveness);
  }

  private sendResponse(
    res: ServerResponse,
    statusCode: number,
    data: any,
    isJson = true
  ): void {
    res.writeHead(statusCode);

    if (isJson) {
      res.end(JSON.stringify(data, null, 2));
    } else {
      res.end(data);
    }
  }

  private formatMemoryUsage(memory: NodeJS.MemoryUsage) {
    return {
      rss: this.formatBytes(memory.rss),
      heapTotal: this.formatBytes(memory.heapTotal),
      heapUsed: this.formatBytes(memory.heapUsed),
      external: this.formatBytes(memory.external),
      arrayBuffers: this.formatBytes(memory.arrayBuffers),
    };
  }

  private formatBytes(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info("Health check server stopped");
        resolve();
      });
    });
  }
}
