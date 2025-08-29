import { logInfo, logWarning, logError } from './logging.js'
import { EventEmitter } from 'events'

/**
 * Message Handler
 * Handles different types of WebSocket messages including yjs, subscribe, broadcast, presence, and ping/pong
 */
class MessageHandler extends EventEmitter {
  constructor(connectionManager, channelManager, presenceManager) {
    super()
    
    this.connectionManager = connectionManager
    this.channelManager = channelManager
    this.presenceManager = presenceManager
    
    // Message statistics
    this.stats = {
      totalMessages: 0,
      messagesByType: {
        yjs: 0,
        subscribe: 0,
        unsubscribe: 0,
        broadcast: 0,
        presence: 0,
        ping: 0,
        pong: 0,
        unknown: 0
      },
      errors: 0
    }
    
    // Bind message handlers
    this.messageHandlers = {
      yjs: this.handleYjsMessage.bind(this),
      subscribe: this.handleSubscribeMessage.bind(this),
      unsubscribe: this.handleUnsubscribeMessage.bind(this),
      broadcast: this.handleBroadcastMessage.bind(this),
      presence: this.handlePresenceMessage.bind(this),
      ping: this.handlePingMessage.bind(this),
      pong: this.handlePongMessage.bind(this)
    }
  }

  /**
   * Process incoming WebSocket message
   * @param {WebSocket} ws - WebSocket instance
   * @param {Buffer|string} data - Raw message data
   */
  async handleMessage(ws, data) {
    try {
      this.stats.totalMessages++
      
      // Get connection info
      const connectionInfo = this.connectionManager.getConnection(ws)
      if (!connectionInfo) {
        logWarning('MESSAGE_NO_CONNECTION', 'Received message from unregistered connection')
        return
      }
      
      // Update connection activity
      this.connectionManager.updateActivity(ws)
      
      let message
      let messageType = 'unknown'
      
      // Handle binary messages (likely Yjs)
      if (Buffer.isBuffer(data)) {
        messageType = 'yjs'
        message = { type: 'yjs', data }
      } else {
        // Handle text messages
        try {
          const parsedMessage = JSON.parse(data.toString())
          messageType = parsedMessage.type || 'unknown'
          message = parsedMessage
        } catch (parseError) {
          // If JSON parsing fails, treat as raw text message
          messageType = 'raw'
          message = { type: 'raw', data: data.toString() }
        }
      }
      
      // Update message type statistics
      if (this.stats.messagesByType.hasOwnProperty(messageType)) {
        this.stats.messagesByType[messageType]++
      } else {
        this.stats.messagesByType.unknown++
      }
      
      // Route message to appropriate handler
      const handler = this.messageHandlers[messageType]
      if (handler) {
        await handler(ws, message, connectionInfo)
      } else {
        await this.handleUnknownMessage(ws, message, connectionInfo)
      }
      
      // Emit message processed event
      this.emit('message:processed', {
        type: messageType,
        connectionInfo,
        messageSize: data.length
      })
      
    } catch (error) {
      this.stats.errors++
      logError('MESSAGE_HANDLER_ERROR', error, {
        connectionId: ws.connectionId,
        messageSize: data?.length
      })
      
      // Send error response to client
      this.sendErrorResponse(ws, 'MESSAGE_PROCESSING_ERROR', 'Failed to process message')
    }
  }

  /**
   * Handle Yjs messages (binary data)
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handleYjsMessage(ws, message, connectionInfo) {
    try {
      // Extract room from connection info or URL
      const room = connectionInfo.room || connectionInfo.metadata?.room
      
      if (!room) {
        logWarning('YJS_NO_ROOM', 'Yjs message received without room information', {
          userId: connectionInfo.userId
        })
        return
      }
      
      // Emit Yjs message event for external handling (y-websocket integration)
      this.emit('message:yjs', {
        ws,
        data: message.data,
        room,
        connectionInfo
      })
      
      logInfo('YJS_MESSAGE_PROCESSED', 'Yjs message processed', {
        room,
        userId: connectionInfo.userId,
        dataSize: message.data.length
      })
      
    } catch (error) {
      logError('YJS_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
    }
  }

  /**
   * Handle channel subscription messages
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handleSubscribeMessage(ws, message, connectionInfo) {
    try {
      const { channel, options = {} } = message
      
      if (!channel) {
        this.sendErrorResponse(ws, 'INVALID_CHANNEL', 'Channel name is required')
        return
      }
      
      // Subscribe to channel
      const success = this.channelManager.subscribe(ws, channel, connectionInfo, options)
      
      if (success) {
        // Join channel presence if requested
        if (options.presence !== false) {
          this.presenceManager.joinChannelPresence(channel, connectionInfo.userId)
        }
        
        logInfo('CHANNEL_SUBSCRIBED', 'User subscribed to channel', {
          channel,
          userId: connectionInfo.userId
        })
      } else {
        this.sendErrorResponse(ws, 'SUBSCRIPTION_FAILED', 'Failed to subscribe to channel')
      }
      
    } catch (error) {
      logError('SUBSCRIBE_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
      this.sendErrorResponse(ws, 'SUBSCRIPTION_ERROR', 'Error processing subscription')
    }
  }

  /**
   * Handle channel unsubscription messages
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handleUnsubscribeMessage(ws, message, connectionInfo) {
    try {
      const { channel } = message
      
      if (!channel) {
        this.sendErrorResponse(ws, 'INVALID_CHANNEL', 'Channel name is required')
        return
      }
      
      // Unsubscribe from channel
      const success = this.channelManager.unsubscribe(ws, channel)
      
      if (success) {
        // Leave channel presence
        this.presenceManager.leaveChannelPresence(channel, connectionInfo.userId)
        
        // Send unsubscription confirmation
        this.sendResponse(ws, {
          type: 'unsubscription_succeeded',
          channel
        })
        
        logInfo('CHANNEL_UNSUBSCRIBED', 'User unsubscribed from channel', {
          channel,
          userId: connectionInfo.userId
        })
      } else {
        this.sendErrorResponse(ws, 'UNSUBSCRIPTION_FAILED', 'Failed to unsubscribe from channel')
      }
      
    } catch (error) {
      logError('UNSUBSCRIBE_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
      this.sendErrorResponse(ws, 'UNSUBSCRIPTION_ERROR', 'Error processing unsubscription')
    }
  }

  /**
   * Handle broadcast messages
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handleBroadcastMessage(ws, message, connectionInfo) {
    try {
      const { channel, data, options = {} } = message
      
      if (!channel) {
        this.sendErrorResponse(ws, 'INVALID_CHANNEL', 'Channel name is required')
        return
      }
      
      if (!data) {
        this.sendErrorResponse(ws, 'INVALID_DATA', 'Message data is required')
        return
      }
      
      // Add sender information to the message
      const broadcastData = {
        ...data,
        sender: {
          userId: connectionInfo.userId,
          sessionId: connectionInfo.sessionId,
          metadata: connectionInfo.metadata
        },
        timestamp: Date.now()
      }
      
      // Broadcast to channel (exclude sender if specified)
      const excludeSender = options.excludeSender !== false
      const sentCount = this.channelManager.broadcast(
        channel,
        broadcastData,
        options,
        excludeSender ? ws : null
      )
      
      // Send broadcast confirmation to sender
      this.sendResponse(ws, {
        type: 'broadcast_sent',
        channel,
        sentCount
      })
      
      logInfo('MESSAGE_BROADCASTED', 'Message broadcasted to channel', {
        channel,
        userId: connectionInfo.userId,
        sentCount
      })
      
    } catch (error) {
      logError('BROADCAST_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
      this.sendErrorResponse(ws, 'BROADCAST_ERROR', 'Error processing broadcast')
    }
  }

  /**
   * Handle presence update messages
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handlePresenceMessage(ws, message, connectionInfo) {
    try {
      const { metadata = {} } = message
      
      // Update user presence
      const success = this.presenceManager.updateUserPresence(connectionInfo.userId, metadata)
      
      if (success) {
        // Update connection metadata
        this.connectionManager.updateMetadata(ws, metadata)
        
        // Send presence update confirmation
        this.sendResponse(ws, {
          type: 'presence_updated',
          metadata
        })
        
        logInfo('PRESENCE_UPDATED', 'User presence updated', {
          userId: connectionInfo.userId,
          metadata
        })
      } else {
        this.sendErrorResponse(ws, 'PRESENCE_UPDATE_FAILED', 'Failed to update presence')
      }
      
    } catch (error) {
      logError('PRESENCE_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
      this.sendErrorResponse(ws, 'PRESENCE_ERROR', 'Error processing presence update')
    }
  }

  /**
   * Handle ping messages
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handlePingMessage(ws, message, connectionInfo) {
    try {
      // Send pong response
      this.sendResponse(ws, {
        type: 'pong',
        timestamp: Date.now(),
        data: message.data || null
      })
      
      // Update connection heartbeat
      this.connectionManager.updateHeartbeat(ws)
      
    } catch (error) {
      logError('PING_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
    }
  }

  /**
   * Handle pong messages
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handlePongMessage(ws, message, connectionInfo) {
    try {
      // Update connection heartbeat
      this.connectionManager.updateHeartbeat(ws)
      
      logInfo('PONG_RECEIVED', 'Pong received from client', {
        userId: connectionInfo.userId,
        latency: message.timestamp ? Date.now() - message.timestamp : null
      })
      
    } catch (error) {
      logError('PONG_MESSAGE_ERROR', error, {
        userId: connectionInfo.userId
      })
    }
  }

  /**
   * Handle unknown message types
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} message - Message object
   * @param {Object} connectionInfo - Connection information
   */
  async handleUnknownMessage(ws, message, connectionInfo) {
    logWarning('UNKNOWN_MESSAGE_TYPE', 'Received unknown message type', {
      type: message.type,
      userId: connectionInfo.userId
    })
    
    // Emit unknown message event for external handling
    this.emit('message:unknown', {
      ws,
      message,
      connectionInfo
    })
    
    // Send error response
    this.sendErrorResponse(ws, 'UNKNOWN_MESSAGE_TYPE', `Unknown message type: ${message.type}`)
  }

  /**
   * Send response message to client
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} response - Response object
   */
  sendResponse(ws, response) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(response))
    }
  }

  /**
   * Send error response to client
   * @param {WebSocket} ws - WebSocket instance
   * @param {string} code - Error code
   * @param {string} message - Error message
   */
  sendErrorResponse(ws, code, message) {
    this.sendResponse(ws, {
      type: 'error',
      error: {
        code,
        message,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Send ping to client
   * @param {WebSocket} ws - WebSocket instance
   * @param {Object} data - Optional ping data
   */
  sendPing(ws, data = null) {
    this.sendResponse(ws, {
      type: 'ping',
      timestamp: Date.now(),
      data
    })
  }

  /**
   * Get message handler statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      errorRate: this.stats.totalMessages > 0 ? (this.stats.errors / this.stats.totalMessages) : 0
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalMessages: 0,
      messagesByType: {
        yjs: 0,
        subscribe: 0,
        unsubscribe: 0,
        broadcast: 0,
        presence: 0,
        ping: 0,
        pong: 0,
        unknown: 0
      },
      errors: 0
    }
  }

  /**
   * Clean up and shutdown message handler
   */
  shutdown() {
    logInfo('MESSAGE_HANDLER_SHUTDOWN', 'Shutting down message handler')
    this.emit('shutdown')
  }
}

export { MessageHandler }