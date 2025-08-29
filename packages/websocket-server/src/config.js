// Configuration options for the WebSocket server
// This file centralizes all configuration settings

// Environment variables with defaults
const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = parseInt(process.env.WS_PORT) || 3001
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT) || 3005

// Feature toggles
const ENABLE_YJS = process.env.ENABLE_YJS !== 'false' // Default: true
const ENABLE_GENERAL_WS = process.env.ENABLE_GENERAL_WS !== 'false' // Default: true
const ENABLE_PRESENCE = process.env.ENABLE_PRESENCE !== 'false' // Default: true
const ENABLE_CHANNELS = process.env.ENABLE_CHANNELS !== 'false' // Default: true

// Performance settings
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.MAX_CONNECTIONS_PER_IP) || 10
const MAX_CHANNELS_PER_CONNECTION = parseInt(process.env.MAX_CHANNELS_PER_CONNECTION) || 50
const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL) || 30000 // 30 seconds
const PRESENCE_CLEANUP_INTERVAL = parseInt(process.env.PRESENCE_CLEANUP_INTERVAL) || 60000 // 1 minute
const CONNECTION_TIMEOUT = parseInt(process.env.CONNECTION_TIMEOUT) || 300000 // 5 minutes

// Security settings
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']

const ENABLE_AUTH = process.env.ENABLE_AUTH === 'true' // Default: false (dev mode)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

// Logging settings
const ENABLE_DETAILED_LOGGING = process.env.ENABLE_DETAILED_LOGGING === 'true'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info' // debug, info, warn, error

// Rate limiting
const ENABLE_RATE_LIMITING = process.env.ENABLE_RATE_LIMITING !== 'false' // Default: true
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100

// WebSocket settings
const WS_COMPRESSION = process.env.WS_COMPRESSION !== 'false' // Default: true
const WS_MAX_PAYLOAD = parseInt(process.env.WS_MAX_PAYLOAD) || 1024 * 1024 // 1MB

// Export configuration object
export const CONFIG = {
  // Environment
  nodeEnv: NODE_ENV,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  
  // Server ports
  port: PORT,
  healthPort: HEALTH_PORT,
  
  // Feature flags
  enableYjs: ENABLE_YJS,
  enableGeneralWS: ENABLE_GENERAL_WS,
  enablePresence: ENABLE_PRESENCE,
  enableChannels: ENABLE_CHANNELS,
  
  // Performance
  maxConnectionsPerIP: MAX_CONNECTIONS_PER_IP,
  maxChannelsPerConnection: MAX_CHANNELS_PER_CONNECTION,
  heartbeatInterval: HEARTBEAT_INTERVAL,
  presenceCleanupInterval: PRESENCE_CLEANUP_INTERVAL,
  connectionTimeout: CONNECTION_TIMEOUT,
  
  // Security
  allowedOrigins: ALLOWED_ORIGINS,
  enableAuth: ENABLE_AUTH,
  jwtSecret: JWT_SECRET,
  
  // Logging
  enableDetailedLogging: ENABLE_DETAILED_LOGGING,
  logLevel: LOG_LEVEL,
  
  // Rate limiting
  enableRateLimiting: ENABLE_RATE_LIMITING,
  rateLimitWindow: RATE_LIMIT_WINDOW,
  rateLimitMaxRequests: RATE_LIMIT_MAX_REQUESTS,
  
  // WebSocket
  wsCompression: WS_COMPRESSION,
  wsMaxPayload: WS_MAX_PAYLOAD
}

// Configuration validation
export function validateConfig() {
  const errors = []
  
  if (!ENABLE_YJS && !ENABLE_GENERAL_WS) {
    errors.push('At least one of ENABLE_YJS or ENABLE_GENERAL_WS must be true')
  }
  
  if (PORT === HEALTH_PORT) {
    errors.push('WS_PORT and HEALTH_PORT cannot be the same')
  }
  
  if (PORT < 1 || PORT > 65535) {
    errors.push('WS_PORT must be between 1 and 65535')
  }
  
  if (HEALTH_PORT < 1 || HEALTH_PORT > 65535) {
    errors.push('HEALTH_PORT must be between 1 and 65535')
  }
  
  if (MAX_CONNECTIONS_PER_IP < 1) {
    errors.push('MAX_CONNECTIONS_PER_IP must be at least 1')
  }
  
  if (MAX_CHANNELS_PER_CONNECTION < 1) {
    errors.push('MAX_CHANNELS_PER_CONNECTION must be at least 1')
  }
  
  if (HEARTBEAT_INTERVAL < 1000) {
    errors.push('HEARTBEAT_INTERVAL must be at least 1000ms')
  }
  
  if (PRESENCE_CLEANUP_INTERVAL < 1000) {
    errors.push('PRESENCE_CLEANUP_INTERVAL must be at least 1000ms')
  }
  
  if (CONNECTION_TIMEOUT < 1000) {
    errors.push('CONNECTION_TIMEOUT must be at least 1000ms')
  }
  
  if (ENABLE_AUTH && !JWT_SECRET) {
    errors.push('JWT_SECRET is required when ENABLE_AUTH is true')
  }
  
  if (WS_MAX_PAYLOAD < 1024) {
    errors.push('WS_MAX_PAYLOAD must be at least 1024 bytes')
  }
  
  return errors
}

// Print configuration summary
export function printConfigSummary() {
  console.log('\n📋 WebSocket Server Configuration:')
  console.log(`   Environment: ${CONFIG.nodeEnv}`)
  console.log(`   WebSocket Port: ${CONFIG.port}`)
  console.log(`   Health Port: ${CONFIG.healthPort}`)
  console.log(`   YJS Enabled: ${CONFIG.enableYjs}`)
  console.log(`   General WS Enabled: ${CONFIG.enableGeneralWS}`)
  console.log(`   Presence Enabled: ${CONFIG.enablePresence}`)
  console.log(`   Channels Enabled: ${CONFIG.enableChannels}`)
  console.log(`   Authentication: ${CONFIG.enableAuth ? 'Enabled' : 'Disabled (Dev Mode)'}`)
  console.log(`   Rate Limiting: ${CONFIG.enableRateLimiting ? 'Enabled' : 'Disabled'}`)
  console.log(`   Detailed Logging: ${CONFIG.enableDetailedLogging ? 'Enabled' : 'Disabled'}`)
  console.log(`   Allowed Origins: ${CONFIG.allowedOrigins.join(', ')}`)
  console.log()
}

export default CONFIG