# WebSocket Server for Collaborative Editing

A rebuilt Y.js WebSocket server for real-time collaborative editing with improved reliability, monitoring, and TypeScript support.

## Features

- **Y.js Integration**: Full support for Y.js collaborative editing protocol
- **TypeScript**: Complete TypeScript implementation with type safety
- **Robust Error Handling**: Comprehensive error handling and recovery mechanisms
- **Security**: Origin validation and connection security
- **Monitoring**: Health checks, logging, and performance metrics
- **Room Management**: Automatic room cleanup and connection management
- **Railway Ready**: Optimized for Railway deployment with health checks

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Build the TypeScript code:

```bash
pnpm build
```

3. Start the development server:

```bash
pnpm dev
```

The server will run on `ws://localhost:1234` by default (compatible with existing collaborative editor).

## Environment Variables

### Core Settings

- `NODE_ENV`: Environment mode (development/production)
- `WS_PORT`: WebSocket server port (default: 1234)
- `HEALTH_PORT`: Health check endpoint port (default: 1235)
- `LOG_LEVEL`: Logging level (debug/info/warn/error, default: info)

### Security Settings

- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `MAX_CONNECTIONS_PER_IP`: Maximum connections per IP address (default: 10)

### Performance Settings

- `CONNECTION_TIMEOUT`: Connection timeout in milliseconds (default: 300000)
- `ROOM_CLEANUP_INTERVAL`: Room cleanup interval in milliseconds (default: 3600000)

## Connection Format

The server accepts WebSocket connections in the format:

```
ws://localhost:1234/{roomName}
```

Where `roomName` is extracted from the URL path. The server is compatible with the existing collaborative editor component.

Example connection URLs:

```
ws://localhost:1234/document-123
ws://localhost:1234/my-collaborative-doc
ws://localhost:1234/project-notes
```

## Room Management

- Rooms are created automatically when clients connect
- Empty rooms are cleaned up after the configured interval (default: 1 hour)
- Each room maintains its own Y.js document instance
- Connection metadata is tracked for monitoring and debugging
- Supports multiple clients per room with real-time synchronization

## Railway Deployment

### Option 1: Direct Package Deployment (Recommended)

1. **Create a new Railway project**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure the service**
   - Set the **Root Directory** to `packages/websocket-server`
   - Railway will automatically detect the `railway.toml` configuration

3. **Set environment variables**

   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://app.rayai.app
   LOG_LEVEL=info
   ```

   (WS_PORT and HEALTH_PORT are set automatically by railway.toml)

4. **Deploy**
   - Railway will build and deploy your WebSocket server
   - You'll get a public URL like `https://your-app.railway.app`
   - WebSocket connections use `wss://your-app.railway.app`

### Option 2: Docker Deployment

1. **Create Railway project with Dockerfile**
   - Same as Option 1, but Railway will detect and use the Dockerfile
   - More control over the build environment

2. **Manual Docker build** (if needed)
   ```bash
   cd packages/websocket-server
   docker build -t websocket-server .
   docker run -p 8080:8080 -p 8081:8081 \
     -e NODE_ENV=production \
     -e WS_PORT=8080 \
     -e HEALTH_PORT=8081 \
     -e LOG_LEVEL=info \
     -e ALLOWED_ORIGINS=https://app.rayai.app \
     websocket-server
   ```

### Option 3: Standalone Repository

If you prefer to deploy as a separate repository:

1. **Copy the websocket-server package** to a new repository
2. **Deploy normally** on Railway without specifying a root directory
3. **Same environment variables** as above

### Deployment Verification

1. **Health Check**: Visit `https://your-app.railway.app/health`
2. **WebSocket Test**: Use a WebSocket client to connect to `wss://your-app.railway.app`
3. **Logs**: Check Railway logs for any connection or authentication issues

### Environment Variables Reference

| Variable                 | Required | Default       | Description                                 |
| ------------------------ | -------- | ------------- | ------------------------------------------- |
| `NODE_ENV`               | ✅       | `development` | Set to `production` for Railway             |
| `WS_PORT`                | ❌       | `1234`        | WebSocket server port (auto-set by Railway) |
| `HEALTH_PORT`            | ❌       | `1235`        | Health check port                           |
| `LOG_LEVEL`              | ❌       | `info`        | Logging level (debug/info/warn/error)       |
| `ALLOWED_ORIGINS`        | ❌       | -             | Comma-separated list of allowed origins     |
| `MAX_CONNECTIONS_PER_IP` | ❌       | `10`          | Maximum connections per IP address          |

### Troubleshooting

- **Build fails**: Check that TypeScript compiles successfully with `npm run build`
- **Health check fails**: Ensure `HEALTH_PORT` is accessible and server is running
- **WebSocket connection fails**: Verify `ALLOWED_ORIGINS` includes your client domain
- **Connection rejected**: Check origin validation and CORS settings
- **Room sync issues**: Check Y.js protocol compatibility and network connectivity

### Railway Configuration

The server includes:

- Health check endpoint at `/health` for load balancer monitoring
- Graceful shutdown handling with proper cleanup
- TypeScript compilation with optimized build process
- Comprehensive error handling and structured logging
- Room management with automatic cleanup
- Origin validation for security

## Client Integration

The server is compatible with the existing collaborative editor. For local development:

```typescript
const provider = new WebSocketProvider("ws://localhost:1234", roomName, doc);
```

For production deployment:

```typescript
const provider = new WebSocketProvider(
  "wss://your-railway-app.railway.app",
  roomName,
  doc
);
```

## Security

- Origin validation prevents unauthorized connections
- Connection rate limiting per IP address
- Invalid connections are immediately closed
- All connection attempts are logged for security monitoring

## Monitoring

The server provides detailed logging for:

- Connection attempts and validation
- Room creation and cleanup events
- Y.js document synchronization
- WebSocket errors and disconnections
- Performance metrics and server statistics

## Performance

- Message compression enabled for reduced bandwidth
- Garbage collection enabled for Y.js documents
- Efficient room-based message broadcasting
- Optimized for high-concurrency collaborative editing
