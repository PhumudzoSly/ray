import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CollaborativeWebSocketServer } from "../websocket-server.js";
import { HealthServer } from "../health-server.js";
import type { ServerConfig } from "../types.js";
import { WebSocket } from "ws";

describe("Integration Tests", () => {
  let wsServer: CollaborativeWebSocketServer;
  let healthServer: HealthServer;
  let config: ServerConfig;
  let wsPort: number;
  let healthPort: number;

  beforeEach(async () => {
    // Use random ports for testing
    wsPort = 30000 + Math.floor(Math.random() * 10000);
    healthPort = wsPort + 1000;

    config = {
      port: wsPort,
      allowedOrigins: ["http://localhost:3000"],
      maxConnections: 100,
      logLevel: "error",
      roomCleanupInterval: 1000,
      maxIdleTime: 5000,
    };

    wsServer = new CollaborativeWebSocketServer(config);
    healthServer = new HealthServer(wsServer, healthPort);

    await wsServer.start();
    await healthServer.start();
  });

  afterEach(async () => {
    await healthServer.stop();
    await wsServer.stop();
  });

  describe("WebSocket connection flow", () => {
    it("should accept valid WebSocket connections", (done) => {
      const client = new WebSocket(`ws://localhost:${wsPort}/test-room`, {
        origin: "http://localhost:3000",
      });

      client.on("open", () => {
        expect(client.readyState).toBe(WebSocket.OPEN);
        client.close();
        done();
      });

      client.on("error", (error) => {
        done(error);
      });
    });

    it("should reject connections from invalid origins", (done) => {
      const client = new WebSocket(`ws://localhost:${wsPort}/test-room`, {
        origin: "http://malicious-site.com",
      });

      client.on("error", (error) => {
        // Connection should be rejected
        expect(error).toBeDefined();
        done();
      });

      client.on("open", () => {
        // Should not reach here
        client.close();
        done(new Error("Connection should have been rejected"));
      });
    });

    it("should handle multiple clients in the same room", (done) => {
      let connectedClients = 0;
      const targetClients = 3;

      const clients: WebSocket[] = [];

      for (let i = 0; i < targetClients; i++) {
        const client = new WebSocket(
          `ws://localhost:${wsPort}/multi-client-room`,
          {
            origin: "http://localhost:3000",
          }
        );

        client.on("open", () => {
          connectedClients++;
          if (connectedClients === targetClients) {
            // All clients connected, check stats
            const stats = wsServer.getStats();
            expect(stats.totalConnections).toBe(targetClients);

            // Clean up
            clients.forEach((c) => c.close());
            done();
          }
        });

        client.on("error", done);
        clients.push(client);
      }
    });
  });

  describe("Health check endpoints", () => {
    it("should respond to health check requests", async () => {
      const response = await fetch(`http://localhost:${healthPort}/health`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("status", "healthy");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("connections");
    });

    it("should provide metrics in Prometheus format", async () => {
      const response = await fetch(`http://localhost:${healthPort}/metrics`);
      expect(response.status).toBe(200);

      const text = await response.text();
      expect(text).toContain("websocket_connections_total");
      expect(text).toContain("websocket_rooms_active");
    });

    it("should provide detailed statistics", async () => {
      const response = await fetch(`http://localhost:${healthPort}/stats`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("totalConnections");
      expect(data).toHaveProperty("activeRooms");
      expect(data).toHaveProperty("process");
      expect(data).toHaveProperty("system");
    });

    it("should respond to readiness checks", async () => {
      const response = await fetch(`http://localhost:${healthPort}/ready`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("ready", true);
      expect(data).toHaveProperty("checks");
    });

    it("should respond to liveness checks", async () => {
      const response = await fetch(`http://localhost:${healthPort}/live`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("alive", true);
    });
  });

  describe("Room management integration", () => {
    it("should track room statistics correctly", (done) => {
      const room1Client = new WebSocket(`ws://localhost:${wsPort}/room1`, {
        origin: "http://localhost:3000",
      });

      const room2Client = new WebSocket(`ws://localhost:${wsPort}/room2`, {
        origin: "http://localhost:3000",
      });

      let connectionsReady = 0;

      const checkStats = () => {
        connectionsReady++;
        if (connectionsReady === 2) {
          setTimeout(() => {
            const stats = wsServer.getStats();
            expect(stats.totalConnections).toBe(2);
            expect(stats.activeRooms).toBe(2);

            room1Client.close();
            room2Client.close();
            done();
          }, 100); // Small delay to ensure stats are updated
        }
      };

      room1Client.on("open", checkStats);
      room2Client.on("open", checkStats);

      room1Client.on("error", done);
      room2Client.on("error", done);
    });
  });

  describe("Error handling integration", () => {
    it("should handle client disconnections gracefully", (done) => {
      const client = new WebSocket(`ws://localhost:${wsPort}/disconnect-test`, {
        origin: "http://localhost:3000",
      });

      client.on("open", () => {
        // Abruptly terminate the connection
        client.terminate();

        // Check that server handles it gracefully
        setTimeout(() => {
          const stats = wsServer.getStats();
          expect(stats.totalConnections).toBe(0);
          done();
        }, 100);
      });

      client.on("error", done);
    });
  });
});
