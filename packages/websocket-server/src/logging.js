// Error codes with standardized messages and WebSocket close codes
const ERROR_CODES = {
  // Authentication errors
  AUTH_FAILED: { message: 'Authentication failed', closeCode: 1008 },
  AUTH_VALIDATION: { message: 'Authentication validation error', closeCode: 1008 },
  AUTH_TOKEN_STRUCTURE: { message: 'Invalid token structure', closeCode: 1008 },
  AUTH_MISMATCH: { message: 'Authentication mismatch', closeCode: 1008 },
  AUTH_SUCCESS: { message: 'Authentication successful', closeCode: null },
  AUTH_ERROR: { message: 'Authentication error', closeCode: 1011 },
  JWT_VERIFICATION: { message: 'JWT verification failed', closeCode: 1008 },
  
  // Rate limiting errors
  RATE_LIMITED: { message: 'Rate limit exceeded', closeCode: 1008 },
  
  // Room access errors
  ACCESS_DENIED: { message: 'Room access denied', closeCode: 1008 },
  INVALID_ROOM: { message: 'Invalid room name', closeCode: 1008 },
  ROOM_VALIDATION: { message: 'Room validation failed', closeCode: 1008 },
  ROOM_ACCESS_DENIED: { message: 'Room access denied for organization', closeCode: 1008 },
  ROOM_VALIDATION_ERROR: { message: 'Room validation error', closeCode: 1011 },
  ROOM_JOIN: { message: 'User joined room', closeCode: null },
  
  // Connection errors
  CONNECTION_ATTEMPT: { message: 'Connection attempt', closeCode: null },
  CONNECTION_AUTHENTICATED: { message: 'Connection authenticated', closeCode: null },
  CONNECTION_CLOSE: { message: 'Connection closed', closeCode: null },
  CONNECTION_HANDLER: { message: 'Connection handler error', closeCode: 1011 },
  
  // WebSocket errors
  WEBSOCKET_ERROR: { message: 'WebSocket error', closeCode: 1011 },
  WS_ORIGIN_REJECTED: { message: 'WebSocket origin rejected', closeCode: 1008 },
  Y_WEBSOCKET_SETUP: { message: 'Y.js WebSocket setup error', closeCode: 1011 },
  
  // Server errors
  SERVER_ERROR: { message: 'Internal server error', closeCode: 1011 },
  HEALTH_SERVER: { message: 'Health server error', closeCode: null },
  
  // Security errors
  CORS_VIOLATION: { message: 'CORS policy violation', closeCode: null }
}

// Structured logging functions
function logError(code, error, metadata = {}) {
  const errorInfo = ERROR_CODES[code] || { message: 'Unknown error', closeCode: 1011 }
  console.error(`❌ [${new Date().toISOString()}] ${code}: ${errorInfo.message}`, {
    error: error.message || error,
    stack: error.stack,
    ...metadata
  })
}

function logWarning(code, message, metadata = {}) {
  const errorInfo = ERROR_CODES[code] || { message: 'Unknown warning', closeCode: null }
  console.warn(`⚠️  [${new Date().toISOString()}] ${code}: ${message || errorInfo.message}`, metadata)
}

function logInfo(code, message, metadata = {}) {
  const errorInfo = ERROR_CODES[code] || { message: 'Unknown info', closeCode: null }
  console.log(`✅ [${new Date().toISOString()}] ${code}: ${message || errorInfo.message}`, metadata)
}

// Close WebSocket connection with standardized error
function closeConnectionWithError(ws, errorCode, metadata = {}) {
  const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.SERVER_ERROR
  
  logError(errorCode, new Error(errorInfo.message), metadata)
  
  if (ws.readyState === ws.OPEN) {
    ws.close(errorInfo.closeCode, errorInfo.message)
  }
}

export {
  ERROR_CODES,
  logError,
  logWarning,
  logInfo,
  closeConnectionWithError
}