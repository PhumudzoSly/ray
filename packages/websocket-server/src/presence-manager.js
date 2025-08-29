import { logInfo, logWarning, logError } from './logging.js'
import { EventEmitter } from 'events'

/**
 * Presence Manager
 * Manages user presence, online/offline status, and metadata across channels and rooms
 */
class PresenceManager extends EventEmitter {
  constructor() {
    super()
    
    // Map of userId -> presence info
    this.userPresence = new Map()
    
    // Map of channelName -> Map of userId -> presence data
    this.channelPresence = new Map()
    
    // Map of WebSocket -> userId (for quick lookup)
    this.connectionUsers = new Map()
    
    // Presence statistics
    this.stats = {
      totalUsers: 0,
      onlineUsers: 0,
      totalPresenceUpdates: 0,
      totalChannelJoins: 0,
      totalChannelLeaves: 0
    }
    
    // Cleanup interval for stale presence data
    this.cleanupInterval = setInterval(() => {
      this.cleanupStalePresence()
    }, 60000) // Run every minute
  }

  /**
   * Set user presence when they connect
   * @param {WebSocket} ws - WebSocket instance
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {Object} metadata - User metadata
   * @returns {boolean} Success status
   */
  setUserOnline(ws, userId, sessionId, metadata = {}) {
    try {
      const now = Date.now()
      
      // Track connection to user mapping
      this.connectionUsers.set(ws, userId)
      
      // Get or create user presence
      let userPresence = this.userPresence.get(userId)
      
      if (!userPresence) {
        userPresence = {
          userId,
          status: 'online',
          connections: new Map(), // sessionId -> connection info
          metadata: {},
          firstSeen: now,
          lastSeen: now,
          channels: new Set()
        }
        this.userPresence.set(userId, userPresence)
        this.stats.totalUsers++
      }
      
      // Add this connection/session
      userPresence.connections.set(sessionId, {
        ws,
        sessionId,
        connectedAt: now,
        lastActivity: now,
        metadata: { ...metadata }
      })
      
      // Update user metadata (merge with existing)
      userPresence.metadata = { ...userPresence.metadata, ...metadata }
      userPresence.status = 'online'
      userPresence.lastSeen = now
      
      // Update online users count
      this.updateOnlineUsersCount()
      
      logInfo('USER_ONLINE', 'User set to online', {
        userId,
        sessionId,
        connectionCount: userPresence.connections.size
      })
      
      // Emit presence change event
      this.emit('presence:online', {
        userId,
        sessionId,
        metadata: userPresence.metadata,
        connectionCount: userPresence.connections.size
      })
      
      return true
    } catch (error) {
      logError('SET_USER_ONLINE_ERROR', error, { userId, sessionId })
      return false
    }
  }

  /**
   * Set user offline when they disconnect
   * @param {WebSocket} ws - WebSocket instance
   * @returns {boolean} Success status
   */
  setUserOffline(ws) {
    try {
      const userId = this.connectionUsers.get(ws)
      if (!userId) {
        logWarning('USER_NOT_FOUND', 'WebSocket not associated with any user')
        return false
      }
      
      const userPresence = this.userPresence.get(userId)
      if (!userPresence) {
        logWarning('USER_PRESENCE_NOT_FOUND', 'User presence not found', { userId })
        return false
      }
      
      // Find and remove the connection
      let removedSessionId = null
      for (const [sessionId, connection] of userPresence.connections) {
        if (connection.ws === ws) {
          userPresence.connections.delete(sessionId)
          removedSessionId = sessionId
          break
        }
      }
      
      // Remove connection tracking
      this.connectionUsers.delete(ws)
      
      // Update user status
      const now = Date.now()
      userPresence.lastSeen = now
      
      // If no more connections, set user offline
      if (userPresence.connections.size === 0) {
        userPresence.status = 'offline'
        
        // Remove user from all channel presence
        userPresence.channels.forEach(channelName => {
          this.removeUserFromChannelPresence(channelName, userId)
        })
        userPresence.channels.clear()
      }
      
      // Update online users count
      this.updateOnlineUsersCount()
      
      logInfo('USER_OFFLINE', 'User connection removed', {
        userId,
        sessionId: removedSessionId,
        remainingConnections: userPresence.connections.size,
        status: userPresence.status
      })
      
      // Emit presence change event
      this.emit('presence:offline', {
        userId,
        sessionId: removedSessionId,
        status: userPresence.status,
        connectionCount: userPresence.connections.size
      })
      
      return true
    } catch (error) {
      logError('SET_USER_OFFLINE_ERROR', error)
      return false
    }
  }

  /**
   * Update user presence metadata
   * @param {string} userId - User ID
   * @param {Object} metadata - New metadata to merge
   * @returns {boolean} Success status
   */
  updateUserPresence(userId, metadata = {}) {
    try {
      const userPresence = this.userPresence.get(userId)
      if (!userPresence) {
        logWarning('UPDATE_PRESENCE_USER_NOT_FOUND', 'User not found for presence update', { userId })
        return false
      }
      
      // Merge metadata
      const oldMetadata = { ...userPresence.metadata }
      userPresence.metadata = { ...userPresence.metadata, ...metadata }
      userPresence.lastSeen = Date.now()
      
      this.stats.totalPresenceUpdates++
      
      logInfo('USER_PRESENCE_UPDATED', 'User presence metadata updated', {
        userId,
        oldMetadata,
        newMetadata: userPresence.metadata
      })
      
      // Update presence in all channels user is in
      userPresence.channels.forEach(channelName => {
        this.updateChannelPresence(channelName, userId, userPresence.metadata)
      })
      
      // Emit presence update event
      this.emit('presence:updated', {
        userId,
        metadata: userPresence.metadata,
        oldMetadata,
        channels: Array.from(userPresence.channels)
      })
      
      return true
    } catch (error) {
      logError('UPDATE_USER_PRESENCE_ERROR', error, { userId })
      return false
    }
  }

  /**
   * Add user to channel presence
   * @param {string} channelName - Channel name
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  joinChannelPresence(channelName, userId) {
    try {
      const userPresence = this.userPresence.get(userId)
      if (!userPresence) {
        logWarning('JOIN_CHANNEL_USER_NOT_FOUND', 'User not found for channel presence', { userId, channelName })
        return false
      }
      
      // Create channel presence if it doesn't exist
      if (!this.channelPresence.has(channelName)) {
        this.channelPresence.set(channelName, new Map())
      }
      
      const channelUsers = this.channelPresence.get(channelName)
      
      // Add user to channel presence
      channelUsers.set(userId, {
        userId,
        status: userPresence.status,
        metadata: { ...userPresence.metadata },
        joinedAt: Date.now(),
        lastActivity: Date.now()
      })
      
      // Track channel in user presence
      userPresence.channels.add(channelName)
      
      this.stats.totalChannelJoins++
      
      logInfo('USER_JOINED_CHANNEL_PRESENCE', 'User joined channel presence', {
        userId,
        channelName,
        channelUserCount: channelUsers.size
      })
      
      // Emit channel presence join event
      this.emit('presence:channel_join', {
        userId,
        channelName,
        metadata: userPresence.metadata,
        channelUserCount: channelUsers.size
      })
      
      return true
    } catch (error) {
      logError('JOIN_CHANNEL_PRESENCE_ERROR', error, { userId, channelName })
      return false
    }
  }

  /**
   * Remove user from channel presence
   * @param {string} channelName - Channel name
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  leaveChannelPresence(channelName, userId) {
    try {
      const channelUsers = this.channelPresence.get(channelName)
      if (!channelUsers || !channelUsers.has(userId)) {
        logWarning('LEAVE_CHANNEL_USER_NOT_IN_PRESENCE', 'User not in channel presence', { userId, channelName })
        return false
      }
      
      // Remove user from channel presence
      channelUsers.delete(userId)
      
      // Remove channel from user presence
      const userPresence = this.userPresence.get(userId)
      if (userPresence) {
        userPresence.channels.delete(channelName)
      }
      
      // Clean up empty channel presence
      if (channelUsers.size === 0) {
        this.channelPresence.delete(channelName)
      }
      
      this.stats.totalChannelLeaves++
      
      logInfo('USER_LEFT_CHANNEL_PRESENCE', 'User left channel presence', {
        userId,
        channelName,
        channelUserCount: channelUsers.size
      })
      
      // Emit channel presence leave event
      this.emit('presence:channel_leave', {
        userId,
        channelName,
        channelUserCount: channelUsers.size
      })
      
      return true
    } catch (error) {
      logError('LEAVE_CHANNEL_PRESENCE_ERROR', error, { userId, channelName })
      return false
    }
  }

  /**
   * Get user presence information
   * @param {string} userId - User ID
   * @returns {Object|null} User presence info or null if not found
   */
  getUserPresence(userId) {
    const userPresence = this.userPresence.get(userId)
    if (!userPresence) return null
    
    return {
      userId,
      status: userPresence.status,
      metadata: { ...userPresence.metadata },
      connectionCount: userPresence.connections.size,
      channels: Array.from(userPresence.channels),
      firstSeen: userPresence.firstSeen,
      lastSeen: userPresence.lastSeen
    }
  }

  /**
   * Get all users presence
   * @returns {Array} Array of user presence information
   */
  getAllUsersPresence() {
    return Array.from(this.userPresence.keys()).map(userId => 
      this.getUserPresence(userId)
    )
  }

  /**
   * Get channel presence (users in a channel)
   * @param {string} channelName - Channel name
   * @returns {Array} Array of users in the channel
   */
  getChannelPresence(channelName) {
    const channelUsers = this.channelPresence.get(channelName)
    if (!channelUsers) return []
    
    return Array.from(channelUsers.values()).map(user => ({
      userId: user.userId,
      status: user.status,
      metadata: { ...user.metadata },
      joinedAt: user.joinedAt,
      lastActivity: user.lastActivity
    }))
  }

  /**
   * Get online users count
   * @returns {number} Number of online users
   */
  getOnlineUsersCount() {
    return this.stats.onlineUsers
  }

  /**
   * Get presence statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      activeChannels: this.channelPresence.size
    }
  }

  /**
   * Update channel presence for a user
   * @param {string} channelName - Channel name
   * @param {string} userId - User ID
   * @param {Object} metadata - Updated metadata
   */
  updateChannelPresence(channelName, userId, metadata) {
    const channelUsers = this.channelPresence.get(channelName)
    if (channelUsers && channelUsers.has(userId)) {
      const user = channelUsers.get(userId)
      user.metadata = { ...metadata }
      user.lastActivity = Date.now()
    }
  }

  /**
   * Remove user from channel presence (internal method)
   * @param {string} channelName - Channel name
   * @param {string} userId - User ID
   */
  removeUserFromChannelPresence(channelName, userId) {
    const channelUsers = this.channelPresence.get(channelName)
    if (channelUsers) {
      channelUsers.delete(userId)
      if (channelUsers.size === 0) {
        this.channelPresence.delete(channelName)
      }
    }
  }

  /**
   * Update online users count
   */
  updateOnlineUsersCount() {
    let onlineCount = 0
    this.userPresence.forEach(user => {
      if (user.status === 'online' && user.connections.size > 0) {
        onlineCount++
      }
    })
    this.stats.onlineUsers = onlineCount
  }

  /**
   * Clean up stale presence data
   */
  cleanupStalePresence() {
    const now = Date.now()
    const staleThreshold = 5 * 60 * 1000 // 5 minutes
    
    let cleanedUsers = 0
    
    this.userPresence.forEach((user, userId) => {
      // Clean up offline users that haven't been seen for a while
      if (user.status === 'offline' && (now - user.lastSeen) > staleThreshold) {
        // Remove from all channels
        user.channels.forEach(channelName => {
          this.removeUserFromChannelPresence(channelName, userId)
        })
        
        this.userPresence.delete(userId)
        cleanedUsers++
      }
    })
    
    if (cleanedUsers > 0) {
      this.stats.totalUsers -= cleanedUsers
      this.updateOnlineUsersCount()
      
      logInfo('PRESENCE_CLEANUP', 'Cleaned up stale presence data', {
        cleanedUsers,
        remainingUsers: this.userPresence.size
      })
    }
  }

  /**
   * Clean up and shutdown presence manager
   */
  shutdown() {
    logInfo('PRESENCE_MANAGER_SHUTDOWN', 'Shutting down presence manager')
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    
    // Clear all presence data
    this.userPresence.clear()
    this.channelPresence.clear()
    this.connectionUsers.clear()
    
    this.emit('shutdown')
  }
}

export { PresenceManager }