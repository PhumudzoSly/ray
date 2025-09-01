# Design Document

## Overview

The rebuilt WebSocket server will be a clean, modern implementation focused on Y.js collaborative editing. It will use the latest WebSocket standards, proper error handling, and maintainable architecture while ensuring compatibility with the existing collaborative editor component.

## Architecture

### Core Components

1. **WebSocket Server**: Main server instance using the `ws` library
2. **Y.js Integration**: Document synchronization using `y-websocket/bin/utils`
3. **Connection Manager**: Handles client connections, rooms, and cleanup
4. **Security Layer**: Origin validation and future authentication hooks
5. **Logging System**: Structured logging for debugging and monitoring

### Technology Stack

- **Node.js**: Runtime environment (>=18.0.0)
- **ws**: WebSocket server implementation
- **y-websocket**: Y.js WebSocket utilities for document synchronization
- **yjs**: Conflict-free replicated data types for collaborative editing

## Components and Interfaces

### WebSocket Server Configuration

```javascript
const serverConfig = {
  port: process.env.PORT || 1234,
  perMessageDeflate: {
    level: 1,
    chunkSize: 1024,
    threshold: 1024,
    concurrencyLimit: 10,
  },
  verifyClient: (info) => validateConnection(info),
};
```

### Connection Validation

```javascript
interface ConnectionInfo {
  origin: string
  req: IncomingMessage
  secure: boolean
}

function validateConnection(info: ConnectionInfo): boolean
```

### Room Management

```javascript
interface Room {
  name: string
  clients: Set<WebSocket>
  document: Y.Doc
  lastActivity: Date
}

class RoomManager {
  private rooms: Map<string, Room>

  getOrCreateRoom(roomName: string): Room
  removeEmptyRooms(): void
  getStats(): RoomStats
}
```

### Logging Interface

```javascript
interface Logger {
  info(message: string, metadata?: object): void
  warn(message: string, metadata?: object): void
  error(message: string, metadata?: object): void
  debug(message: string, metadata?: object): void
}
```

## Data Models

### Connection Metadata

```javascript
interface ClientConnection {
  id: string
  ws: WebSocket
  roomName: string
  ip: string
  userAgent: string
  connectedAt: Date
  lastActivity: Date
}
```

### Server Statistics

```javascript
interface ServerStats {
  totalConnections: number
  activeRooms: number
  uptime: number
  memoryUsage: NodeJS.MemoryUsage
  roomDetails: Array<{
    name: string
    clientCount: number
    lastActivity: Date
  }>
}
```

## Error Handling

### Connection Errors

1. **Invalid Origin**: Reject connection with 403 status
2. **Malformed WebSocket Frames**: Log error and close connection gracefully
3. **Y.js Sync Errors**: Log error but maintain connection if possible
4. **Network Timeouts**: Implement ping/pong heartbeat mechanism

### Server Errors

1. **Port Binding Failures**: Log error and exit with appropriate code
2. **Memory Exhaustion**: Implement cleanup routines and monitoring
3. **Unhandled Exceptions**: Log stack trace and attempt graceful recovery

### Error Recovery Strategies

```javascript
// Graceful error handling pattern
try {
  // WebSocket operation
} catch (error) {
  logger.error("Operation failed", {
    error: error.message,
    stack: error.stack,
    context: "operation_context",
  });

  // Attempt recovery or cleanup
  if (isRecoverable(error)) {
    attemptRecovery();
  } else {
    cleanupAndClose();
  }
}
```

## Security Design

### Origin Validation

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',   // Web app dev
  'http://localhost:3001',   // Docs dev
  'http://localhost:3002',   // Landing dev
  'https://app.rayai.app',   // Production
  // Add more as needed
]

function validateOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'development' && !origin) {
    return true // Allow no origin in dev
  }
  return ALLOWED_ORIGINS.includes(origin)
}
```

### Future Authentication Hooks

```javascript
interface AuthHooks {
  validateToken?(token: string): Promise<boolean>
  extractUser?(token: string): Promise<User>
  authorizeRoom?(user: User, roomName: string): Promise<boolean>
}
```

## Performance Considerations

### Connection Limits

- Maximum connections per IP: 10 (configurable)
- Maximum rooms: 1000 (with cleanup)
- Idle room cleanup: 1 hour of inactivity

### Memory Management

- Periodic cleanup of empty rooms
- Document persistence hooks for large documents
- Connection pooling and reuse

### Monitoring Metrics

```javascript
interface Metrics {
  connectionsPerSecond: number
  messagesPerSecond: number
  averageRoomSize: number
  memoryUsagePerRoom: number
  errorRate: number
}
```

## Testing Strategy

### Unit Tests

1. **Connection Validation**: Test origin checking and security rules
2. **Room Management**: Test room creation, cleanup, and statistics
3. **Error Handling**: Test various error scenarios and recovery
4. **Y.js Integration**: Test document synchronization logic

### Integration Tests

1. **Client Connection Flow**: Test full connection lifecycle
2. **Multi-client Synchronization**: Test real-time document sync
3. **Reconnection Scenarios**: Test network failure recovery
4. **Load Testing**: Test server under concurrent connections

### Test Environment Setup

```javascript
// Test server configuration
const testConfig = {
  port: 0, // Random available port
  logLevel: "silent",
  allowedOrigins: ["http://localhost:3000"],
  maxConnections: 100,
};
```

### Mock Client Implementation

```javascript
class MockYjsClient {
  constructor(serverUrl: string, roomName: string)
  connect(): Promise<void>
  sendUpdate(update: Uint8Array): void
  disconnect(): void
  onUpdate(callback: (update: Uint8Array) => void): void
}
```

## Deployment Considerations

### Environment Variables

```bash
PORT=1234
NODE_ENV=production
LOG_LEVEL=info
MAX_CONNECTIONS=1000
ALLOWED_ORIGINS=https://app.rayai.app,https://staging.rayai.app
```

### Health Checks

```javascript
// Health check endpoint for load balancers
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    connections: wss.clients.size,
    memory: process.memoryUsage(),
  });
});
```

### Graceful Shutdown

```javascript
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  logger.info("Shutdown initiated");

  // Stop accepting new connections
  wss.close(() => {
    // Close existing connections gracefully
    wss.clients.forEach((ws) => {
      ws.close(1001, "Server shutting down");
    });

    logger.info("Server shutdown complete");
    process.exit(0);
  });
}
```

## Compatibility Requirements

### Existing Client Integration

The server must maintain compatibility with the existing collaborative editor:

1. **URL Format**: `ws://localhost:1234/{roomName}`
2. **Y.js Protocol**: Standard y-websocket message format
3. **Connection Events**: Same event names and payloads
4. **Environment Variables**: `NEXT_PUBLIC_WEBSOCKET_URL` support

### Migration Strategy

1. **Zero-downtime deployment**: New server can run alongside old one
2. **Gradual rollout**: Test with specific rooms first
3. **Rollback plan**: Keep old server code for quick revert
4. **Monitoring**: Track connection success rates during migration
