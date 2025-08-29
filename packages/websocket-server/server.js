import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

// Import modular components
import { authenticateConnection, validateRoomAccess } from './src/auth.js'
import { logError, logWarning, logInfo, closeConnectionWithError } from './src/logging.js'
import { 
  checkIPRateLimit, 
  checkUserRateLimit, 
  incrementUserConnections, 
  decrementUserConnections,
  startRateLimitCleanup 
} from './src/rate-limiting.js'
import { 
  serverMetrics, 
  activeConnections, 
  updateMetrics, 
  addToRoom, 
  removeFromRoom, 
  getServerStats,
  startStatsLogging 
} from './src/monitoring.js'
import { validateWebSocketOrigin, getClientIP, CORS_CONFIG } from './src/security.js'
import { createHealthServer } from './src/health-server.js'

const PORT = process.env.PORT || 1234

// Initialize background processes
startRateLimitCleanup()
startStatsLogging()

// Create WebSocket server
const wss = new WebSocketServer({
  port: PORT,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 1,
      chunkSize: 1024,
    },
    threshold: 1024,
    concurrencyLimit: 10,
    clientMaxWindowBits: 15,
    serverMaxWindowBits: 15,
    serverMaxNoContextTakeover: false,
    clientMaxNoContextTakeover: false,
    zlibInflateOptions: {
      chunkSize: 1024,
    },
  },
  // Origin validation for WebSocket connections
  verifyClient: (info) => {
    const origin = info.origin
    const isValidOrigin = validateWebSocketOrigin(origin)
    
    if (!isValidOrigin) {
      logWarning('WS_ORIGIN_REJECTED', 'WebSocket connection rejected due to invalid origin', {
        origin,
        ip: info.req.socket.remoteAddress
      })
      return false
    }
    
    return true
  }
})

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  try {
    // Get client IP address
    const clientIP = getClientIP(request)
    
    logInfo('CONNECTION_ATTEMPT', 'New WebSocket connection attempt', { clientIP })
    
    // Skip IP rate limiting for development
    // Rate limiting disabled
    
    // Skip authentication for development
    const auth = { userId: 'dev-user', org: 'dev-org' }
    
    logInfo('CONNECTION_AUTHENTICATED', 'Connection authenticated successfully (dev mode)', {
      clientIP,
      userId: auth.userId,
      org: auth.org
    })
    
    // Update metrics
    serverMetrics.totalConnections++
    updateMetrics()
    
    // Increment user connection count
    incrementUserConnections(auth.userId)
    
    // Extract room name from URL path
    const url = new URL(request.url, `http://localhost:${PORT}`)
    const roomName = url.pathname.slice(1) // Remove leading slash
    
    if (!roomName) {
      closeConnectionWithError(ws, 'INVALID_ROOM', {
        clientIP,
        userId: auth.userId,
        reason: 'No room specified'
      })
      return
    }
    
    // Skip room access validation for development
    // Room access validation disabled
    
    logInfo('ROOM_JOIN', 'User joined room successfully', {
      userId: auth.userId,
      roomName,
      org: auth.org,
      clientIP
    })
    
    // Store auth info on the WebSocket for later use
    ws.auth = auth
    ws.roomName = roomName
    
    // Track active connection and add to room
    activeConnections.set(ws, {
      ip: clientIP,
      userId: auth.userId,
      timestamp: Date.now()
    })
    addToRoom(roomName, ws)
    
    // Setup Y.js WebSocket connection with room isolation
    try {
      setupWSConnection(ws, request, {
        docName: roomName,
        gc: true // Enable garbage collection
      })
    } catch (setupError) {
      logError('Y_WEBSOCKET_SETUP', setupError, {
        userId: auth.userId,
        roomName,
        clientIP
      })
      closeConnectionWithError(ws, 'SERVER_ERROR', {
        userId: auth.userId,
        roomName
      })
      return
    }
    
    // Handle connection close
    ws.on('close', (code, reason) => {
      logInfo('CONNECTION_CLOSE', 'User disconnected', {
        userId: auth.userId,
        roomName,
        code,
        reason: reason.toString(),
        clientIP
      })
      
      // Update metrics
      serverMetrics.totalDisconnections++
      updateMetrics()
      
      // Clean up tracking
      decrementUserConnections(auth.userId)
      activeConnections.delete(ws)
      removeFromRoom(roomName, ws)
    })
    
    // Handle errors
    ws.on('error', (error) => {
      logError('WEBSOCKET_ERROR', error, {
        userId: auth.userId,
        roomName,
        clientIP
      })
    })
    
  } catch (connectionError) {
    logError('CONNECTION_HANDLER', connectionError, { clientIP: getClientIP(request) })
    closeConnectionWithError(ws, 'SERVER_ERROR', { clientIP: getClientIP(request) })
  }
})

// Handle WebSocket server errors
wss.on('error', (error) => {
  logError('WEBSOCKET_SERVER', error, { port: PORT })
})

// Create and start health check server
const healthServer = createHealthServer()
const healthPort = process.env.HEALTH_PORT || 3005
healthServer.listen(healthPort, () => {
  console.log(`🏥 Health server running on port ${healthPort}`)
  console.log(`   Health: http://localhost:${healthPort}/health`)
  console.log(`   Metrics: http://localhost:${healthPort}/metrics`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...')
  wss.close(() => {
    healthServer.close(() => {
      console.log('✅ Server shutdown complete')
      process.exit(0)
    })
  })
})

// Server startup logging
console.log(`🚀 WebSocket server starting on port ${PORT}`)
console.log('Environment:', process.env.NODE_ENV || 'development')
console.log('Allowed Origins:', CORS_CONFIG.allowedOrigins.join(', '))
console.log('Security Headers:', process.env.NODE_ENV === 'production' ? 'Enabled' : 'Development mode')
console.log('\n📊 Server ready for connections!')