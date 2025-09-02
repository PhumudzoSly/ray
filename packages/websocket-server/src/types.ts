import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";

export interface ConnectionInfo {
  origin?: string;
  req: IncomingMessage;
  secure: boolean;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  roomName: string;
  ip: string;
  userAgent: string;
  connectedAt: Date;
  lastActivity: Date;
}

export interface Room {
  name: string;
  clients: Set<WebSocket>;
  document?: any; // Y.js document managed by y-websocket utils
  lastActivity: Date;
}

export interface ServerStats {
  totalConnections: number;
  activeRooms: number;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  roomDetails: Array<{
    name: string;
    clientCount: number;
    lastActivity: Date;
  }>;
}

export interface Logger {
  info(message: string, metadata?: object): void;
  warn(message: string, metadata?: object): void;
  error(message: string, metadata?: object): void;
  debug(message: string, metadata?: object): void;
}

export interface ServerConfig {
  port: number;
  allowedOrigins: string[];
  maxConnections: number;
  logLevel: "debug" | "info" | "warn" | "error";
  roomCleanupInterval: number;
  maxIdleTime: number;
}
