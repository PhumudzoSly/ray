import http from 'http'
import { applySecurityHeaders, applyCORSHeaders, validateHTTPOrigin } from './security.js'
import { getServerStats } from './monitoring.js'
import { logWarning, logError } from './logging.js'

// Create health check and monitoring server
function createHealthServer(port = 3005, context = {}) {
  const { connectionManager, channelManager, presenceManager, eventEmitter, config } = context
  
  const healthServer = http.createServer((req, res) => {
    const origin = req.headers.origin
    
    // Apply security headers
    applySecurityHeaders(res)
    
    // Apply CORS headers
    applyCORSHeaders(res, origin)
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    
    // Validate origin for non-preflight requests
    if (origin && !validateHTTPOrigin(origin)) {
      logWarning('CORS_VIOLATION', 'Request from unauthorized origin', { origin, url: req.url })
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Origin not allowed' }))
      return
    }
    
    try {
      const url = new URL(req.url, `http://localhost:${port}`)
      const pathname = url.pathname
      
      if (pathname === '/health') {
        handleHealthCheck(req, res)
      } else if (pathname === '/metrics' || pathname === '/stats') {
        handleMetrics(req, res)
      } else if (pathname === '/channels') {
        handleChannels(req, res, channelManager)
      } else if (pathname.startsWith('/channels/') && pathname.endsWith('/users')) {
        const channel = pathname.split('/')[2]
        handleChannelUsers(req, res, channelManager, channel)
      } else if (pathname.startsWith('/channels/') && pathname.endsWith('/broadcast')) {
        const channel = pathname.split('/')[2]
        handleChannelBroadcast(req, res, channelManager, channel)
      } else if (pathname === '/presence') {
        handlePresence(req, res, presenceManager)
      } else {
        handleNotFound(req, res)
      }
    } catch (error) {
      logError('HEALTH_SERVER', error, { url: req.url, origin })
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal server error' }))
    }
  })
  
  return healthServer
}

// Handle health check endpoint
function handleHealthCheck(req, res) {
  const stats = getServerStats()
  
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ 
    status: 'ok', 
    uptime: stats.server.uptime,
    timestamp: stats.timestamp
  }))
}

// Handle metrics endpoint
function handleMetrics(req, res) {
  const stats = getServerStats()
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(stats))
}

// Handle 404 responses
function handleNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
}

// Handle channels endpoint - GET /channels
function handleChannels(req, res, channelManager) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  
  if (!channelManager) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Channel manager not available' }))
    return
  }
  
  const channels = channelManager.getAllChannels()
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ channels }))
}

// Handle channel users endpoint - GET /channels/:channel/users
function handleChannelUsers(req, res, channelManager, channel) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  
  if (!channelManager || !channel) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Invalid request' }))
    return
  }
  
  const users = channelManager.getChannelSubscribers(channel)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ channel, users }))
}

// Handle channel broadcast endpoint - POST /channels/:channel/broadcast
function handleChannelBroadcast(req, res, channelManager, channel) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  
  if (!channelManager || !channel) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Invalid request' }))
    return
  }
  
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  
  req.on('end', () => {
    try {
      const { message, event } = JSON.parse(body)
      
      if (!message) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Message is required' }))
        return
      }
      
      const result = channelManager.broadcast(channel, {
          type: 'broadcast',
          event: event || 'message',
          data: message,
          timestamp: Date.now()
        })
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        success: true, 
        channel, 
        messagesSent: result.messagesSent,
        subscriberCount: result.subscriberCount
      }))
    } catch (error) {
      logError('BROADCAST_ERROR', error, { channel })
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON' }))
    }
  })
}

// Handle presence endpoint - GET /presence
function handlePresence(req, res, presenceManager) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  
  if (!presenceManager) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Presence manager not available' }))
    return
  }
  
  const presence = presenceManager.getAllUsersPresence()
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ presence }))
}

export {
  createHealthServer
}