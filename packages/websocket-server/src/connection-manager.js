import { logInfo, logWarning, logError } from './logging.js'
import { EventEmitter } from 'events'

/**
 * Connection Manager
 * Handles WebSocket connections, user sessions, and connection lifecycle
 */
class ConnectionManager extends EventEmitter {
  constructor() {
    super()
    
    // Map of WebSocket -> Connection Info
    this.connections = new Map()
    
    // Map of userId -> Set of WebSockets (for multiple connections per user)
    this.userConnections = new Map()
    
    // Connection statistics
    this.stats = {
      totalConnections: 0,
      totalDisconnections: 0,
      currentConnections: 0,
      peakConnections: 0
    }
  }

  /**
   * Add a new WebSocket connection
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} connectionInfo - Connection metadata
   * @param {string} connectionInfo.userId - User ID
   * @param {string} connectionInfo.sessionId - Unique session ID
   * @param {string} connectionInfo.ip - Client IP address
   * @param {Object} connectionInfo.metadata - Additional user metadata
   */
  addConnection(ws, connectionInfo) {
    const { userId, sessionId, ip, metadata = {} } = connectionInfo
    
    // Create connection record
    const connection = {
      ws,
      userId,
      sessionId,
      ip,
      metadata,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      channels: new Set(), // Channels this connection is subscribed to
      isAlive: true // For heartbeat tracking
    }
    
    // Store connection
    this.connections.set(ws, connection)
    
    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set())
    }
    this.userConnections.get(userId).add(ws)
    
    // Update statistics
    this.stats.totalConnections++
    this.stats.currentConnections++
    this.stats.peakConnections = Math.max(this.stats.peakConnections, this.stats.currentConnections)
    
    logInfo('CONNECTION_ADDED', 'New connection established', {
      userId,
      sessionId,
      ip,
      totalConnections: this.stats.currentConnections
    })
    
    // Set up WebSocket event handlers
    this.setupWebSocketHandlers(ws)
    
    // Emit connection event
    this.emit('connection:added', { connection, ws })
    
    return connection
  }

  /**
   * Remove a WebSocket connection
   * @param {WebSocket} ws - WebSocket instance
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  removeConnection(ws, code = 1000, reason = 'Normal closure') {
    const connection = this.connections.get(ws)
    
    if (!connection) {
      logWarning('CONNECTION_NOT_FOUND', 'Attempted to remove non-existent connection')
      return
    }
    
    const { userId, sessionId, channels } = connection
    
    // Remove from connections map
    this.connections.delete(ws)
    
    // Remove from user connections
    const userWs = this.userConnections.get(userId)
    if (userWs) {
      userWs.delete(ws)
      if (userWs.size === 0) {
        this.userConnections.delete(userId)
      }
    }
    
    // Update statistics
    this.stats.totalDisconnections++
    this.stats.currentConnections--
    
    logInfo('CONNECTION_REMOVED', 'Connection closed', {
      userId,
      sessionId,
      code,
      reason,
      totalConnections: this.stats.currentConnections
    })
    
    // Emit disconnection event with channel info for cleanup
    this.emit('connection:removed', { connection, ws, channels })
  }

  /**
   * Get connection info for a WebSocket
   * @param {WebSocket} ws - WebSocket instance
   * @returns {Object|null} Connection info or null if not found
   */
  getConnection(ws) {
    return this.connections.get(ws) || null
  }

  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of WebSocket instances
   */
  getUserConnections(userId) {
    const userWs = this.userConnections.get(userId)
    return userWs ? Array.from(userWs) : []
  }

  /**
   * Get all active connections
   * @returns {Array} Array of connection objects
   */
  getAllConnections() {
    return Array.from(this.connections.values())
  }

  /**
   * Update connection's last activity timestamp
   * @param {WebSocket} ws - WebSocket instance
   */
  updateActivity(ws) {
    const connection = this.connections.get(ws)
    if (connection) {
      connection.lastActivity = Date.now()
    }
  }

  /**
   * Update connection metadata
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} metadata - New metadata to merge
   */
  updateMetadata(ws, metadata) {
    const connection = this.connections.get(ws)
    if (connection) {
      connection.metadata = { ...connection.metadata, ...metadata }
      this.emit('connection:metadata_updated', { connection, ws })
    }
  }

  /**
   * Add channel to connection's subscription list
   * @param {WebSocket} ws - WebSocket instance
   * @param {string} channel - Channel name
   */
  addChannelToConnection(ws, channel) {
    const connection = this.connections.get(ws)
    if (connection) {
      connection.channels.add(channel)
    }
  }

  /**
   * Remove channel from connection's subscription list
   * @param {WebSocket} ws - WebSocket instance
   * @param {string} channel - Channel name
   */
  removeChannelFromConnection(ws, channel) {
    const connection = this.connections.get(ws)
    if (connection) {
      connection.channels.delete(channel)
    }
  }

  /**
   * Get connection statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      activeUsers: this.userConnections.size,
      connectionsPerUser: this.userConnections.size > 0 
        ? this.stats.currentConnections / this.userConnections.size 
        : 0
    }
  }

  /**
   * Setup WebSocket event handlers
   * @param {WebSocket} ws - WebSocket instance
   */
  setupWebSocketHandlers(ws) {
    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      const connection = this.connections.get(ws)
      if (connection) {
        connection.isAlive = true
        this.updateActivity(ws)
      }
    })

    // Handle WebSocket errors
    ws.on('error', (error) => {
      const connection = this.connections.get(ws)
      logError('WEBSOCKET_ERROR', error, {
        userId: connection?.userId,
        sessionId: connection?.sessionId
      })
    })

    // Handle WebSocket close
    ws.on('close', (code, reason) => {
      this.removeConnection(ws, code, reason.toString())
    })
  }

  /**
   * Start heartbeat interval to check connection health
   * @param {number} interval - Heartbeat interval in milliseconds (default: 30000)
   */
  startHeartbeat(interval = 30000) {
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((connection, ws) => {
        if (!connection.isAlive) {
          logWarning('HEARTBEAT_FAILED', 'Connection failed heartbeat check', {
            userId: connection.userId,
            sessionId: connection.sessionId
          })
          ws.terminate()
          return
        }
        
        connection.isAlive = false
        ws.ping()
      })
    }, interval)
    
    logInfo('HEARTBEAT_STARTED', 'Connection heartbeat monitoring started', { interval })
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
      logInfo('HEARTBEAT_STOPPED', 'Connection heartbeat monitoring stopped')
    }
  }

  /**
   * Broadcast message to all connections of a user
   * @param {string} userId - User ID
   * @param {Object} message - Message to send
   */
  broadcastToUser(userId, message) {
    const connections = this.getUserConnections(userId)
    const messageStr = JSON.stringify(message)
    
    connections.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(messageStr)
      }
    })
  }

  /**
   * Broadcast message to specific connections
   * @param {Array} connections - Array of WebSocket instances
   * @param {Object} message - Message to send
   */
  broadcastToConnections(connections, message) {
    const messageStr = JSON.stringify(message)
    
    connections.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(messageStr)
      }
    })
  }

  /**
   * Clean up and close all connections
   */
  shutdown() {
    logInfo('CONNECTION_MANAGER_SHUTDOWN', 'Shutting down connection manager')
    
    this.stopHeartbeat()
    
    // Close all connections
    this.connections.forEach((connection, ws) => {
      ws.close(1001, 'Server shutdown')
    })
    
    // Clear all maps
    this.connections.clear()
    this.userConnections.clear()
    
    this.emit('shutdown')
  }
}

export { ConnectionManager }