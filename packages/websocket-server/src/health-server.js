import http from 'http'
import { applySecurityHeaders, applyCORSHeaders, validateHTTPOrigin } from './security.js'
import { getServerStats } from './monitoring.js'
import { logWarning, logError } from './logging.js'

// Create health check and monitoring server
function createHealthServer(port = 3005) {
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
      if (req.url === '/health') {
        handleHealthCheck(req, res)
      } else if (req.url === '/metrics' || req.url === '/stats') {
        handleMetrics(req, res)
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

export {
  createHealthServer
}