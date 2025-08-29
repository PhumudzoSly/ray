import { logInfo, logWarning, logError } from './logging.js'
import { EventEmitter } from 'events'

/**
 * Channel Manager
 * Manages Pusher-like channels, subscriptions, and message broadcasting
 */
class ChannelManager extends EventEmitter {
  constructor() {
    super()
    
    // Map of channelName -> Channel Info
    this.channels = new Map()
    
    // Map of WebSocket -> Set of channel names (for quick lookup)
    this.connectionChannels = new Map()
    
    // Channel statistics
    this.stats = {
      totalChannels: 0,
      totalSubscriptions: 0,
      totalUnsubscriptions: 0,
      totalMessages: 0
    }
  }

  /**
   * Subscribe a connection to a channel
   * @param {WebSocket} ws - WebSocket instance
   * @param {string} channelName - Channel name to subscribe to
   * @param {Object} connectionInfo - Connection information from ConnectionManager
   * @param {Object} options - Subscription options
   * @returns {boolean} Success status
   */
  subscribe(ws, channelName, connectionInfo, options = {}) {
    try {
      // Validate channel name
      if (!this.isValidChannelName(channelName)) {
        logWarning('INVALID_CHANNEL_NAME', 'Invalid channel name provided', {
          channelName,
          userId: connectionInfo.userId
        })
        return false
      }

      // Create channel if it doesn't exist
      if (!this.channels.has(channelName)) {
        this.createChannel(channelName)
      }

      const channel = this.channels.get(channelName)
      
      // Check if already subscribed
      if (channel.subscribers.has(ws)) {
        logWarning('ALREADY_SUBSCRIBED', 'Connection already subscribed to channel', {
          channelName,
          userId: connectionInfo.userId
        })
        return false
      }

      // Add subscriber to channel
      channel.subscribers.set(ws, {
        userId: connectionInfo.userId,
        sessionId: connectionInfo.sessionId,
        subscribedAt: Date.now(),
        metadata: connectionInfo.metadata,
        options
      })

      // Track channel subscriptions for this connection
      if (!this.connectionChannels.has(ws)) {
        this.connectionChannels.set(ws, new Set())
      }
      this.connectionChannels.get(ws).add(channelName)

      // Update statistics
      this.stats.totalSubscriptions++
      channel.stats.totalSubscriptions++
      channel.lastActivity = Date.now()

      logInfo('CHANNEL_SUBSCRIBED', 'Connection subscribed to channel', {
        channelName,
        userId: connectionInfo.userId,
        subscriberCount: channel.subscribers.size
      })

      // Emit subscription event
      this.emit('channel:subscribed', {
        channelName,
        ws,
        connectionInfo,
        subscriberCount: channel.subscribers.size
      })

      // Send subscription confirmation
      this.sendToConnection(ws, {
        type: 'subscription_succeeded',
        channel: channelName,
        data: {
          subscriberCount: channel.subscribers.size
        }
      })

      return true
    } catch (error) {
      logError('CHANNEL_SUBSCRIBE_ERROR', error, {
        channelName,
        userId: connectionInfo.userId
      })
      return false
    }
  }

  /**
   * Unsubscribe a connection from a channel
   * @param {WebSocket} ws - WebSocket instance
   * @param {string} channelName - Channel name to unsubscribe from
   * @returns {boolean} Success status
   */
  unsubscribe(ws, channelName) {
    try {
      const channel = this.channels.get(channelName)
      if (!channel) {
        logWarning('CHANNEL_NOT_FOUND', 'Attempted to unsubscribe from non-existent channel', {
          channelName
        })
        return false
      }

      const subscriber = channel.subscribers.get(ws)
      if (!subscriber) {
        logWarning('NOT_SUBSCRIBED', 'Connection not subscribed to channel', {
          channelName
        })
        return false
      }

      // Remove subscriber from channel
      channel.subscribers.delete(ws)
      
      // Remove channel from connection tracking
      const connectionChannels = this.connectionChannels.get(ws)
      if (connectionChannels) {
        connectionChannels.delete(channelName)
        if (connectionChannels.size === 0) {
          this.connectionChannels.delete(ws)
        }
      }

      // Update statistics
      this.stats.totalUnsubscriptions++
      channel.stats.totalUnsubscriptions++
      channel.lastActivity = Date.now()

      logInfo('CHANNEL_UNSUBSCRIBED', 'Connection unsubscribed from channel', {
        channelName,
        userId: subscriber.userId,
        subscriberCount: channel.subscribers.size
      })

      // Emit unsubscription event
      this.emit('channel:unsubscribed', {
        channelName,
        ws,
        subscriber,
        subscriberCount: channel.subscribers.size
      })

      // Clean up empty channel
      if (channel.subscribers.size === 0) {
        this.deleteChannel(channelName)
      }

      return true
    } catch (error) {
      logError('CHANNEL_UNSUBSCRIBE_ERROR', error, { channelName })
      return false
    }
  }

  /**
   * Broadcast message to all subscribers of a channel
   * @param {string} channelName - Channel name
   * @param {Object} message - Message to broadcast
   * @param {Object} options - Broadcasting options
   * @param {WebSocket} excludeWs - WebSocket to exclude from broadcast
   * @returns {number} Number of connections message was sent to
   */
  broadcast(channelName, message, options = {}, excludeWs = null) {
    try {
      const channel = this.channels.get(channelName)
      if (!channel) {
        logWarning('BROADCAST_CHANNEL_NOT_FOUND', 'Attempted to broadcast to non-existent channel', {
          channelName
        })
        return 0
      }

      const broadcastMessage = {
        type: 'message',
        channel: channelName,
        data: message,
        timestamp: Date.now(),
        ...options
      }

      let sentCount = 0
      const messageStr = JSON.stringify(broadcastMessage)

      // Send to all subscribers
      channel.subscribers.forEach((subscriber, ws) => {
        if (ws !== excludeWs && ws.readyState === ws.OPEN) {
          ws.send(messageStr)
          sentCount++
        }
      })

      // Update statistics
      this.stats.totalMessages++
      channel.stats.totalMessages++
      channel.lastActivity = Date.now()

      logInfo('CHANNEL_BROADCAST', 'Message broadcasted to channel', {
        channelName,
        sentCount,
        subscriberCount: channel.subscribers.size,
        messageType: message.type || 'unknown'
      })

      // Emit broadcast event
      this.emit('channel:broadcast', {
        channelName,
        message: broadcastMessage,
        sentCount,
        subscriberCount: channel.subscribers.size
      })

      return sentCount
    } catch (error) {
      logError('CHANNEL_BROADCAST_ERROR', error, { channelName })
      return 0
    }
  }

  /**
   * Get channel information
   * @param {string} channelName - Channel name
   * @returns {Object|null} Channel info or null if not found
   */
  getChannel(channelName) {
    const channel = this.channels.get(channelName)
    if (!channel) return null

    return {
      name: channelName,
      subscriberCount: channel.subscribers.size,
      createdAt: channel.createdAt,
      lastActivity: channel.lastActivity,
      stats: { ...channel.stats }
    }
  }

  /**
   * Get all active channels
   * @returns {Array} Array of channel information
   */
  getAllChannels() {
    return Array.from(this.channels.keys()).map(channelName => 
      this.getChannel(channelName)
    )
  }

  /**
   * Get subscribers of a channel
   * @param {string} channelName - Channel name
   * @returns {Array} Array of subscriber information
   */
  getChannelSubscribers(channelName) {
    const channel = this.channels.get(channelName)
    if (!channel) return []

    return Array.from(channel.subscribers.values()).map(subscriber => ({
      userId: subscriber.userId,
      sessionId: subscriber.sessionId,
      subscribedAt: subscriber.subscribedAt,
      metadata: subscriber.metadata
    }))
  }

  /**
   * Get channels a connection is subscribed to
   * @param {WebSocket} ws - WebSocket instance
   * @returns {Array} Array of channel names
   */
  getConnectionChannels(ws) {
    const channels = this.connectionChannels.get(ws)
    return channels ? Array.from(channels) : []
  }

  /**
   * Remove all subscriptions for a connection
   * @param {WebSocket} ws - WebSocket instance
   */
  removeConnectionFromAllChannels(ws) {
    const channels = this.getConnectionChannels(ws)
    
    channels.forEach(channelName => {
      this.unsubscribe(ws, channelName)
    })

    logInfo('CONNECTION_CHANNELS_CLEANED', 'Removed connection from all channels', {
      channelCount: channels.length
    })
  }

  /**
   * Get channel manager statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      activeChannels: this.channels.size,
      totalConnections: this.connectionChannels.size
    }
  }

  /**
   * Create a new channel
   * @param {string} channelName - Channel name
   */
  createChannel(channelName) {
    const channel = {
      name: channelName,
      subscribers: new Map(), // WebSocket -> subscriber info
      createdAt: Date.now(),
      lastActivity: Date.now(),
      stats: {
        totalSubscriptions: 0,
        totalUnsubscriptions: 0,
        totalMessages: 0
      }
    }

    this.channels.set(channelName, channel)
    this.stats.totalChannels++

    logInfo('CHANNEL_CREATED', 'New channel created', { channelName })
    this.emit('channel:created', { channelName, channel })
  }

  /**
   * Delete a channel
   * @param {string} channelName - Channel name
   */
  deleteChannel(channelName) {
    const channel = this.channels.get(channelName)
    if (!channel) return

    // Remove all subscribers
    channel.subscribers.forEach((subscriber, ws) => {
      const connectionChannels = this.connectionChannels.get(ws)
      if (connectionChannels) {
        connectionChannels.delete(channelName)
        if (connectionChannels.size === 0) {
          this.connectionChannels.delete(ws)
        }
      }
    })

    this.channels.delete(channelName)

    logInfo('CHANNEL_DELETED', 'Channel deleted', { channelName })
    this.emit('channel:deleted', { channelName })
  }

  /**
   * Validate channel name
   * @param {string} channelName - Channel name to validate
   * @returns {boolean} Whether the channel name is valid
   */
  isValidChannelName(channelName) {
    if (!channelName || typeof channelName !== 'string') return false
    
    // Channel name rules:
    // - Must be 1-200 characters
    // - Can contain letters, numbers, hyphens, underscores, dots, colons
    // - Cannot start or end with special characters
    const channelRegex = /^[a-zA-Z0-9][a-zA-Z0-9._:-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/
    
    return channelName.length >= 1 && 
           channelName.length <= 200 && 
           channelRegex.test(channelName)
  }

  /**
   * Send message to a specific connection
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message to send
   */
  sendToConnection(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  /**
   * Clean up and shutdown channel manager
   */
  shutdown() {
    logInfo('CHANNEL_MANAGER_SHUTDOWN', 'Shutting down channel manager')
    
    // Clear all channels and connections
    this.channels.clear()
    this.connectionChannels.clear()
    
    this.emit('shutdown')
  }
}

export { ChannelManager }