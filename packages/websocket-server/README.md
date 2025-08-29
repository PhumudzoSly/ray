# WebSocket Server for Collaborative Editing

A Y.js WebSocket server with authentication and organization-based room isolation for real-time collaborative editing.

## Features

- **Y.js Integration**: Full support for Y.js collaborative editing protocol
- **Authentication**: JWT token validation with user and organization verification
- **Room Isolation**: Organization-scoped rooms prevent cross-organization access
- **Auto-reconnection**: Robust connection handling with proper error recovery
- **Railway Ready**: Configured for easy deployment on Railway

## Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

The server will run on `http://localhost:3001` by default.

## Environment Variables

- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT token verification (required in production)
- `NODE_ENV`: Environment mode (development/production)
- `HEALTH_PORT`: Health check endpoint port (default: 3002, production only)

## Authentication

Clients must provide the following query parameters when connecting:

- `token`: JWT token containing nested session data
- `userId`: User ID (must match `session.session.userId` or `session.user.id` in token)
- `org`: Organization ID (must match `session.session.activeOrganizationId` in token)

**JWT Token Structure Expected:**
```json
{
  "session": {
    "session": {
      "userId": "rlUBuMQ3Rx9KdpYkhhqGzAF6d5WSPGUO",
      "activeOrganizationId": "9TxaoZ8NuBIUuN2BfejcTAhqewJRAtcK",
      "expiresAt": "2025-09-05T07:02:03.272Z",
      // ... other session data
    },
    "user": {
      "id": "rlUBuMQ3Rx9KdpYkhhqGzAF6d5WSPGUO",
      "email": "user@example.com",
      // ... other user data
    }
  },
  "expiresAt": 1756454676233,
  "signature": "..."
}
```

Example connection URL:
```
ws://localhost:3001/my-org-document-123?token=jwt_token&userId=rlUBuMQ3Rx9KdpYkhhqGzAF6d5WSPGUO&org=9TxaoZ8NuBIUuN2BfejcTAhqewJRAtcK
```

## Room Format

Rooms follow the format: `{org}-{entityType}-{entityId}`

Examples:
- `acme-document-456`
- `startup-board-789`
- `company-note-123`

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
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   ```
   (PORT and HEALTH_PORT are set automatically by railway.toml)

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
     -e JWT_SECRET=your-secret \
     -e NODE_ENV=production \
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

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | - | Secret key for JWT token validation |
| `NODE_ENV` | ✅ | `development` | Set to `production` for Railway |
| `PORT` | ❌ | `8080` | Main server port (auto-set by Railway) |
| `HEALTH_PORT` | ❌ | `8081` | Health check port |

### Troubleshooting

- **Build fails**: Check that `package.json` dependencies are correct
- **Health check fails**: Ensure `HEALTH_PORT` is accessible
- **WebSocket connection fails**: Verify JWT_SECRET matches your client
- **Authentication errors**: Check token, userId, and org parameters

### Railway Configuration

The server includes:
- Health check endpoint at `/health` (production only)
- Graceful shutdown handling
- WebSocket compression for better performance
- Proper error handling and logging

## Client Integration

Update your client-side WebSocket provider to connect to the deployed server:

```typescript
const provider = new WebSocketProvider(
  'wss://your-railway-app.railway.app',
  roomName,
  doc,
  {
    params: {
      token: userToken,
      userId: user.id,
      org: user.org
    }
  }
)
```

## Security

- JWT tokens are verified in production mode
- Room access is restricted by organization
- Invalid connections are immediately closed
- All authentication attempts are logged

## Monitoring

The server provides detailed logging for:
- Connection attempts and authentication
- Room access validation
- User join/leave events
- WebSocket errors and disconnections

## Performance

- Message compression enabled for reduced bandwidth
- Garbage collection enabled for Y.js documents
- Efficient room-based message broadcasting
- Optimized for high-concurrency collaborative editing