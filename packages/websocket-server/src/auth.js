import jwt from 'jsonwebtoken'
import { logWarning, logInfo, logError } from './logging.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

// Authentication middleware
function authenticateConnection(ws, request) {
  try {
    const url = new URL(request.url, `http://localhost:${process.env.PORT || 1234}`)
    const token = url.searchParams.get('token')
    const userId = url.searchParams.get('userId')
    const org = url.searchParams.get('org')
    
    if (!token || !userId || !org) {
      logWarning('AUTH_VALIDATION', 'Missing required authentication parameters', {
        hasToken: !!token,
        hasUserId: !!userId,
        hasOrg: !!org
      })
      return null
    }
    
    // Validate token structure
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      logWarning('AUTH_TOKEN_STRUCTURE', 'Invalid JWT token structure', {
        tokenParts: tokenParts.length,
        userId,
        org
      })
      return null
    }
    
    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (jwtError) {
      logError('JWT_VERIFICATION', jwtError, {
        userId,
        org,
        tokenPreview: token.substring(0, 20) + '...'
      })
      return null
    }
    
    // Validate token claims match URL parameters
    if (decoded.userId !== userId || decoded.org !== org) {
      logWarning('AUTH_MISMATCH', 'Token claims do not match URL parameters', {
        tokenUserId: decoded.userId,
        urlUserId: userId,
        tokenOrg: decoded.org,
        urlOrg: org
      })
      return null
    }
    
    logInfo('AUTH_SUCCESS', 'User authenticated successfully', {
      userId,
      org
    })
    
    return { userId, org, token }
    
  } catch (error) {
    logError('AUTH_ERROR', error, {
      url: request.url
    })
    return null
  }
}

// Validate room access based on organization
function validateRoomAccess(roomName, userOrg) {
  try {
    // Room format: org-name/room-name or just room-name for default org
    if (!roomName || typeof roomName !== 'string') {
      logWarning('ROOM_VALIDATION', 'Invalid room name format', {
        roomName,
        type: typeof roomName
      })
      return false
    }
    
    // If room contains org prefix, validate it matches user's org
    if (roomName.includes('/')) {
      const [roomOrg] = roomName.split('/')
      if (roomOrg !== userOrg) {
        logWarning('ROOM_ACCESS_DENIED', 'User organization does not match room organization', {
          roomName,
          roomOrg,
          userOrg,
          expectedFormat: `${userOrg}/room-name`
        })
        return false
      }
    }
    
    return true
    
  } catch (error) {
    logError('ROOM_VALIDATION_ERROR', error, {
      roomName,
      userOrg
    })
    return false
  }
}

export {
  authenticateConnection,
  validateRoomAccess
}