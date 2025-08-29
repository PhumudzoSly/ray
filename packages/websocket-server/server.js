import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

// Configuration
const PORT = process.env.PORT || 1234

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://app.rayai.app'
]

// Simple logging utility
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  const logData = Object.keys(data).length > 0 ? JSON.stringify(data) : ''
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message} ${logData}`)
}

// Validate WebSocket origin
function validateOrigin(origin) {
  if (!origin) return true // Allow connections without origin in development
  return ALLOWED_ORIGINS.includes(origin)
}

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
  verifyClient: (info) => {
    const origin = info.origin
    const isValidOrigin = validateOrigin(origin)
    
    if (!isValidOrigin) {
      log('warn', 'Connection rejected due to invalid origin', {
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
  const clientIP = request.socket.remoteAddress
  const origin = request.headers.origin
  const userAgent = request.headers['user-agent']
  
  // Extract room name from URL path
  const url = new URL(request.url, `http://${request.headers.host}`)
  const roomName = url.pathname.slice(1) || 'default'
  
  log('info', 'New Y.js connection established', {
    roomName,
    clientIP,
    origin,
    userAgent
  })
  
  // Set up Y.js WebSocket connection
  setupWSConnection(ws, request, { docName: roomName })
  
  // Handle connection close
  ws.on('close', (code, reason) => {
    log('info', 'Y.js connection closed', {
      roomName,
      code,
      reason: reason?.toString(),
      clientIP
    })
  })
  
  // Handle connection errors
  ws.on('error', (error) => {
    log('error', 'Y.js connection error', {
      roomName,
      error: error.message,
      clientIP
    })
  })
})

// Handle WebSocket server errors
wss.on('error', (error) => {
  log('error', 'WebSocket server error', { error: error.message, port: PORT })
})

// Server startup
wss.on('listening', () => {
  log('info', 'Y.js WebSocket server started', {
    port: PORT,
    allowedOrigins: ALLOWED_ORIGINS
  })
})

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

function gracefulShutdown() {
  log('info', 'Graceful shutdown initiated')
  
  wss.close(() => {
    log('info', 'Y.js WebSocket server closed')
    process.exit(0)
  })
}

log('info', 'Starting Y.js WebSocket server...', { port: PORT })