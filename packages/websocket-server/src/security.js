import { logWarning } from './logging.js'

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' ws: wss:; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// CORS configuration
const CORS_CONFIG = {
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'https://app.rayai.dev'],
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}

// Apply security headers to response
function applySecurityHeaders(res) {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value)
  })
}

// Apply CORS headers to response
function applyCORSHeaders(res, origin) {
  const isAllowedOrigin = CORS_CONFIG.allowedOrigins.includes('*') || 
    CORS_CONFIG.allowedOrigins.includes(origin)
  
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '))
  res.setHeader('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '))
  res.setHeader('Access-Control-Max-Age', CORS_CONFIG.maxAge)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

// WebSocket origin validation
function validateWebSocketOrigin(origin) {
  if (!origin) {
    return process.env.NODE_ENV !== 'production' // Allow in development
  }
  
  return CORS_CONFIG.allowedOrigins.includes('*') || 
         CORS_CONFIG.allowedOrigins.includes(origin)
}

// Validate HTTP request origin
function validateHTTPOrigin(origin) {
  if (!origin) {
    return true // Allow requests without origin header
  }
  
  return CORS_CONFIG.allowedOrigins.includes('*') || 
         CORS_CONFIG.allowedOrigins.includes(origin)
}

// Get client IP address from request
function getClientIP(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         request.headers['x-real-ip'] ||
         request.socket?.remoteAddress ||
         'unknown'
}

export {
  SECURITY_HEADERS,
  CORS_CONFIG,
  applySecurityHeaders,
  applyCORSHeaders,
  validateWebSocketOrigin,
  validateHTTPOrigin,
  getClientIP
}