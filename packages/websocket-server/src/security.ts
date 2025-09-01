import type { ConnectionInfo } from "./types.js";
import { logger } from "./logger.js";

export class SecurityManager {
  private allowedOrigins: Set<string>;
  private connectionCounts: Map<string, number> = new Map();
  private maxConnectionsPerIP: number;

  constructor(allowedOrigins: string[], maxConnectionsPerIP = 10) {
    this.allowedOrigins = new Set(allowedOrigins);
    this.maxConnectionsPerIP = maxConnectionsPerIP;
  }

  validateConnection(info: ConnectionInfo): boolean {
    const ip = this.getClientIP(info.req);
    const origin = info.req.headers.origin;

    // Validate origin
    if (!this.validateOrigin(origin)) {
      logger.warn("Connection rejected: invalid origin", {
        origin,
        ip,
        userAgent: info.req.headers["user-agent"],
      });
      return false;
    }

    // Check rate limiting
    if (!this.checkRateLimit(ip)) {
      logger.warn("Connection rejected: rate limit exceeded", {
        ip,
        currentConnections: this.connectionCounts.get(ip),
        maxConnections: this.maxConnectionsPerIP,
      });
      return false;
    }

    logger.debug("Connection validated successfully", {
      origin,
      ip,
      userAgent: info.req.headers["user-agent"],
    });

    return true;
  }

  private validateOrigin(origin?: string): boolean {
    // Allow connections without origin in development
    if (process.env.NODE_ENV === "development" && !origin) {
      return true;
    }

    if (!origin) {
      return false;
    }

    return this.allowedOrigins.has(origin);
  }

  private checkRateLimit(ip: string): boolean {
    const currentConnections = this.connectionCounts.get(ip) || 0;
    return currentConnections < this.maxConnectionsPerIP;
  }

  private getClientIP(req: any): string {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown"
    );
  }

  trackConnection(ip: string): void {
    const current = this.connectionCounts.get(ip) || 0;
    this.connectionCounts.set(ip, current + 1);

    logger.debug("Connection tracked", {
      ip,
      connections: current + 1,
    });
  }

  releaseConnection(ip: string): void {
    const current = this.connectionCounts.get(ip) || 0;
    if (current <= 1) {
      this.connectionCounts.delete(ip);
    } else {
      this.connectionCounts.set(ip, current - 1);
    }

    logger.debug("Connection released", {
      ip,
      connections: Math.max(0, current - 1),
    });
  }

  getConnectionStats(): Record<string, number> {
    return Object.fromEntries(this.connectionCounts);
  }

  // Future authentication hooks
  async validateToken(token: string): Promise<boolean> {
    // Placeholder for future JWT validation
    logger.debug("Token validation requested", { tokenLength: token.length });
    return true;
  }

  async extractUser(
    token: string
  ): Promise<{ id: string; name: string } | null> {
    // Placeholder for future user extraction
    logger.debug("User extraction requested", { tokenLength: token.length });
    return null;
  }

  async authorizeRoom(userId: string, roomName: string): Promise<boolean> {
    // Placeholder for future room authorization
    logger.debug("Room authorization requested", { userId, roomName });
    return true;
  }
}
