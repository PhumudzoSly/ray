import { logWarning } from './logging.js'

// Rate limiting configuration
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production'

const RATE_LIMIT_CONFIG = {
  maxConnectionsPerIP: parseInt(process.env.MAX_CONNECTIONS_PER_IP) || (isDevelopment ? 50 : 10),
  maxConnectionsPerUser: parseInt(process.env.MAX_CONNECTIONS_PER_USER) || (isDevelopment ? 20 : 5),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000 // 1 minute
}

// Rate limiting storage
const ipConnections = new Map() // IP -> { count, windowStart }
const userConnections = new Map() // userId -> count

// Check IP-based rate limiting
function checkIPRateLimit(clientIP) {
  // Be more lenient with localhost IPs in development
  const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost'
  const effectiveLimit = (isDevelopment && isLocalhost) ? 
    RATE_LIMIT_CONFIG.maxConnectionsPerIP * 2 : 
    RATE_LIMIT_CONFIG.maxConnectionsPerIP
  
  const now = Date.now()
  const ipData = ipConnections.get(clientIP)
  
  if (!ipData) {
    ipConnections.set(clientIP, { count: 1, windowStart: now })
    return true
  }
  
  // Reset window if expired
  if (now - ipData.windowStart > RATE_LIMIT_CONFIG.windowMs) {
    ipConnections.set(clientIP, { count: 1, windowStart: now })
    return true
  }
  
  // Check if limit exceeded
  if (ipData.count >= effectiveLimit) {
    logWarning('RATE_LIMITED', `IP ${clientIP} exceeded connection limit`, {
      currentCount: ipData.count,
      maxAllowed: effectiveLimit,
      windowStart: new Date(ipData.windowStart).toISOString(),
      isLocalhost,
      isDevelopment
    })
    return false
  }
  
  // Increment counter
  ipData.count++
  return true
}

// Check user-based rate limiting
function checkUserRateLimit(userId) {
  const currentCount = userConnections.get(userId) || 0
  
  if (currentCount >= RATE_LIMIT_CONFIG.maxConnectionsPerUser) {
    logWarning('RATE_LIMITED', `User ${userId} exceeded connection limit`, {
      currentCount,
      maxAllowed: RATE_LIMIT_CONFIG.maxConnectionsPerUser
    })
    return false
  }
  
  return true
}

// Increment user connection count
function incrementUserConnections(userId) {
  const currentCount = userConnections.get(userId) || 0
  userConnections.set(userId, currentCount + 1)
}

// Decrement user connection count
function decrementUserConnections(userId) {
  const currentCount = userConnections.get(userId) || 0
  if (currentCount <= 1) {
    userConnections.delete(userId)
  } else {
    userConnections.set(userId, currentCount - 1)
  }
}

// Clean up expired rate limits
function cleanupRateLimits() {
  const now = Date.now()
  
  for (const [ip, data] of ipConnections.entries()) {
    if (now - data.windowStart > RATE_LIMIT_CONFIG.windowMs) {
      ipConnections.delete(ip)
    }
  }
  
  console.log(`🧹 Rate limit cleanup completed. Active IP limits: ${ipConnections.size}, Active user connections: ${userConnections.size}`)
}

// Start cleanup interval
function startRateLimitCleanup() {
  setInterval(cleanupRateLimits, 5 * 60 * 1000) // Every 5 minutes
}

export {
  RATE_LIMIT_CONFIG,
  checkIPRateLimit,
  checkUserRateLimit,
  incrementUserConnections,
  decrementUserConnections,
  cleanupRateLimits,
  startRateLimitCleanup
}