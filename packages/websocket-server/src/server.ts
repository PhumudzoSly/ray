#!/usr/bin/env node

import { CollaborativeWebSocketServer } from "./websocket-server.js";
import { HealthServer } from "./health-server.js";
import { createConfig } from "./config.js";
import { logger } from "./logger.js";

async function main() {
  try {
    // Load configuration
    const config = createConfig();

    logger.info("Starting WebSocket server with configuration", {
      port: config.port,
      allowedOrigins: config.allowedOrigins,
      maxConnections: config.maxConnections,
      logLevel: config.logLevel,
    });

    // Create and start WebSocket server
    const wsServer = new CollaborativeWebSocketServer(config);
    await wsServer.start();

    // Create and start health check server
    const healthServer = new HealthServer(wsServer, config.port + 1000); // Health on port 2234 if WS is on 1234
    await healthServer.start();

    logger.info("All servers started successfully", {
      websocketPort: config.port,
      healthPort: config.port + 1000,
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info("Shutdown signal received, stopping servers...");

      try {
        await healthServer.stop();
        await wsServer.stop();
        logger.info("All servers stopped gracefully");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown", {
          error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (
  import.meta.url.endsWith("server.js") &&
  process.argv[1]?.endsWith("server.js")
) {
  main().catch((error) => {
    console.error("Unhandled error in main:", error);
    process.exit(1);
  });
}
