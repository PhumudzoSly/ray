import type { ServerConfig } from "./types.js";

export function createConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT || "1234", 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://app.rayai.app",
    ],
    maxConnections: parseInt(process.env.MAX_CONNECTIONS || "1000", 10),
    logLevel: (process.env.LOG_LEVEL as any) || "info",
    roomCleanupInterval: parseInt(
      process.env.ROOM_CLEANUP_INTERVAL || "300000",
      10
    ), // 5 minutes
    maxIdleTime: parseInt(process.env.MAX_IDLE_TIME || "3600000", 10), // 1 hour
  };
}
