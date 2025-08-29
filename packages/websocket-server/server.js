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
import { ConnectionManager } from './src/connection-manager.js'
import { ChannelManager } from './src/channel-manager.js'
import { PresenceManager } from './src/presence-manager.js'
import { MessageHandler } from './src/message-handler.js'
import { CustomEventEmitter } from './src/event-emitter.js'
import { CONFIG, validateConfig, printConfigSummary } from './src/config.js'

// Validate configuration on startup
const configErrors = validateConfig()
if (configErrors.length > 0) {
  console.error('❌ Configuration errors:')
  configErrors.forEach(error => console.error(`   - ${error}`))
  process.exit(1)
}

// Print configuration summary
printConfigSummary()

const PORT = CONFIG.port
const HEALTH_PORT = CONFIG.healthPort

// Initialize managers
const eventEmitter = new CustomEventEmitter()
const connectionManager = new ConnectionManager(eventEmitter, CONFIG)
const channelManager = new ChannelManager(eventEmitter, CONFIG)
const presenceManager = new PresenceManager(eventEmitter, CONFIG)
const messageHandler = new MessageHandler(connectionManager, channelManager, presenceManager, eventEmitter, CONFIG)

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

// Pass managers to health server for API endpoints
const healthServerContext = {
  connectionManager,
  channelManager,
  presenceManager,
  eventEmitter,
  config: CONFIG
}

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  const clientIP = getClientIP(request)
  
  logInfo('NEW_CONNECTION_ATTEMPT', 'New WebSocket connection attempt', {
    clientIP,
    origin: request.headers.origin,
    userAgent: request.headers['user-agent']
  })

  // Validate origin
  if (!validateWebSocketOrigin(request.headers.origin)) {
    logWarning('ORIGIN_REJECTED', 'Connection rejected due to invalid origin', {
      origin: request.headers.origin,
      clientIP
    })
    ws.close(1008, 'Origin not allowed')
    return
  }

  // Apply rate limiting
   if (!rateLimitMiddleware(clientIP)) {
     logWarning('RATE_LIMITED', 'Connection rejected due to rate limiting', {
       clientIP
     })
     ws.close(1008, 'Rate limit exceeded')
     return
   }

  // Authenticate connection (currently in dev mode)
  const authResult = authenticateConnection(request)
  if (!authResult.success) {
    logWarning('AUTH_FAILED', 'Connection authentication failed', {
      reason: authResult.reason,
      clientIP
    })
    ws.close(1008, 'Authentication failed')
    return
  }

  // Update metrics
   updateMetrics('connection')
   
   // Extract room name from URL path
   const url = new URL(request.url, `http://${request.headers.host}`)
   const roomName = url.pathname.slice(1) || 'default'
   
   logInfo('CONNECTION_ESTABLISHED', 'WebSocket connection established', {
     roomName,
     userId: authResult.userId,
     clientIP,
     enableYjs: CONFIG.enableYjs,
     enableGeneralWS: CONFIG.enableGeneralWS
   })

   // Add connection to room tracking (legacy)
   addConnectionToRoom(roomName, ws)
  
  // Add connection to new connection manager
  const connectionId = connectionManager.addConnection(ws, {
    userId: authResult.userId,
    roomName,
    clientIP,
    userAgent: request.headers['user-agent'],
    origin: request.headers.origin
  })
  
  // Set user online in presence manager
  presenceManager.setUserOnline(authResult.userId, {
    connectionId,
    roomName,
    clientIP,
    connectedAt: Date.now()
  })
  
  // Set up Y.js WebSocket connection if enabled (backward compatibility)
  if (CONFIG.enableYjs) {
    setupWSConnection(ws, request, { docName: roomName })
  }
  
  // Set up general WebSocket message handling if enabled
  if (CONFIG.enableGeneralWS) {
    ws.on('message', async (data) => {
      try {
        await messageHandler.handleMessage(connectionId, data)
      } catch (error) {
        logError('MESSAGE_HANDLING_ERROR', error, {
          connectionId,
          userId: authResult.userId,
          roomName
        })
      }
    })
  }

  // Handle connection close
  ws.on('close', (code, reason) => {
    logInfo('CONNECTION_CLOSED', 'WebSocket connection closed', {
      connectionId,
      roomName,
      userId: authResult.userId,
      code,
      reason: reason?.toString(),
      clientIP
    })
    
    // Remove from room tracking (legacy)
     removeConnectionFromRoom(roomName, ws)
     
     // Remove from connection manager
     connectionManager.removeConnection(connectionId)
     
     // Set user offline in presence manager
     presenceManager.setUserOffline(authResult.userId)
     
     // Update metrics
     updateMetrics('disconnection')
  })

  // Handle connection errors
  ws.on('error', (error) => {
    logError('CONNECTION_ERROR', error, {
      connectionId,
      roomName,
      userId: authResult.userId,
      clientIP
    })
  })
})

// Handle WebSocket server errors
wss.on('error', (error) => {
  logError('WEBSOCKET_SERVER', error, { port: PORT })
})

// Start health server with context
const healthServer = createHealthServer(HEALTH_PORT, healthServerContext)
healthServer.listen(HEALTH_PORT, () => {
  logInfo('HEALTH_SERVER_STARTED', `Health server listening on port ${HEALTH_PORT}`)
})

logInfo('SERVERS_STARTED', 'WebSocket and Health servers started successfully', {
  websocketPort: PORT,
  healthPort: HEALTH_PORT,
  corsEnabled: true,
  yjsEnabled: CONFIG.enableYjs,
  generalWSEnabled: CONFIG.enableGeneralWS
})

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

function gracefulShutdown() {
  logInfo('SHUTDOWN_INITIATED', 'Graceful shutdown initiated')
  
  // Close WebSocket server
  wss.close(() => {
    logInfo('WEBSOCKET_SERVER_CLOSED', 'WebSocket server closed')
  })
  
  // Close health server
  healthServer.close(() => {
    logInfo('HEALTH_SERVER_CLOSED', 'Health server closed')
  })
  
  // Shutdown managers
  connectionManager.shutdown()
  channelManager.shutdown()
  presenceManager.shutdown()
  eventEmitter.shutdown()
  
  logInfo('SHUTDOWN_COMPLETE', 'Graceful shutdown complete')
  process.exit(0)
}