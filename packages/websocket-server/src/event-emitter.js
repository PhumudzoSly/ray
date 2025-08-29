import { EventEmitter } from 'events'
import { logInfo, logWarning, logError } from './logging.js'

/**
 * Custom Event Emitter System
 * Provides a centralized event system for the websocket server with enhanced features
 */
class CustomEventEmitter extends EventEmitter {
  constructor() {
    super()
    
    // Set max listeners to prevent memory leak warnings
    this.setMaxListeners(100)
    
    // Event statistics
    this.stats = {
      totalEvents: 0,
      eventsByType: new Map(),
      errors: 0,
      listeners: new Map()
    }
    
    // Event history for debugging (keep last 100 events)
    this.eventHistory = []
    this.maxHistorySize = 100
    
    // Middleware functions
    this.middleware = []
    
    // Event filters
    this.filters = new Map()
    
    // Setup error handling
    this.on('error', this.handleError.bind(this))
  }

  /**
   * Enhanced emit with middleware support and statistics
   * @param {string} eventName - Event name
   * @param {...any} args - Event arguments
   * @returns {boolean} Whether the event had listeners
   */
  emit(eventName, ...args) {
    try {
      // Update statistics
      this.stats.totalEvents++
      this.updateEventTypeStats(eventName)
      
      // Add to event history
      this.addToHistory(eventName, args)
      
      // Apply middleware
      const middlewareResult = this.applyMiddleware(eventName, args)
      if (middlewareResult === false) {
        logInfo('EVENT_BLOCKED_BY_MIDDLEWARE', 'Event blocked by middleware', { eventName })
        return false
      }
      
      // Apply filters
      if (this.isEventFiltered(eventName, args)) {
        logInfo('EVENT_FILTERED', 'Event filtered out', { eventName })
        return false
      }
      
      // Emit the event
      const result = super.emit(eventName, ...args)
      
      logInfo('EVENT_EMITTED', 'Event emitted', {
        eventName,
        listenerCount: this.listenerCount(eventName),
        hasListeners: result
      })
      
      return result
    } catch (error) {
      this.stats.errors++
      logError('EVENT_EMIT_ERROR', error, { eventName })
      this.emit('error', error, eventName, args)
      return false
    }
  }

  /**
   * Enhanced on with listener tracking
   * @param {string} eventName - Event name
   * @param {Function} listener - Event listener
   * @returns {CustomEventEmitter} This instance for chaining
   */
  on(eventName, listener) {
    this.updateListenerStats(eventName, 'add')
    return super.on(eventName, listener)
  }

  /**
   * Enhanced once with listener tracking
   * @param {string} eventName - Event name
   * @param {Function} listener - Event listener
   * @returns {CustomEventEmitter} This instance for chaining
   */
  once(eventName, listener) {
    this.updateListenerStats(eventName, 'add')
    return super.once(eventName, listener)
  }

  /**
   * Enhanced removeListener with listener tracking
   * @param {string} eventName - Event name
   * @param {Function} listener - Event listener
   * @returns {CustomEventEmitter} This instance for chaining
   */
  removeListener(eventName, listener) {
    this.updateListenerStats(eventName, 'remove')
    return super.removeListener(eventName, listener)
  }

  /**
   * Enhanced off with listener tracking
   * @param {string} eventName - Event name
   * @param {Function} listener - Event listener
   * @returns {CustomEventEmitter} This instance for chaining
   */
  off(eventName, listener) {
    this.updateListenerStats(eventName, 'remove')
    return super.off(eventName, listener)
  }

  /**
   * Add middleware function
   * @param {Function} middlewareFn - Middleware function (eventName, args) => boolean
   */
  addMiddleware(middlewareFn) {
    if (typeof middlewareFn !== 'function') {
      throw new Error('Middleware must be a function')
    }
    this.middleware.push(middlewareFn)
    logInfo('MIDDLEWARE_ADDED', 'Event middleware added')
  }

  /**
   * Remove middleware function
   * @param {Function} middlewareFn - Middleware function to remove
   */
  removeMiddleware(middlewareFn) {
    const index = this.middleware.indexOf(middlewareFn)
    if (index > -1) {
      this.middleware.splice(index, 1)
      logInfo('MIDDLEWARE_REMOVED', 'Event middleware removed')
    }
  }

  /**
   * Add event filter
   * @param {string} eventName - Event name to filter
   * @param {Function} filterFn - Filter function (args) => boolean
   */
  addFilter(eventName, filterFn) {
    if (typeof filterFn !== 'function') {
      throw new Error('Filter must be a function')
    }
    
    if (!this.filters.has(eventName)) {
      this.filters.set(eventName, [])
    }
    
    this.filters.get(eventName).push(filterFn)
    logInfo('EVENT_FILTER_ADDED', 'Event filter added', { eventName })
  }

  /**
   * Remove event filter
   * @param {string} eventName - Event name
   * @param {Function} filterFn - Filter function to remove
   */
  removeFilter(eventName, filterFn) {
    const filters = this.filters.get(eventName)
    if (filters) {
      const index = filters.indexOf(filterFn)
      if (index > -1) {
        filters.splice(index, 1)
        if (filters.length === 0) {
          this.filters.delete(eventName)
        }
        logInfo('EVENT_FILTER_REMOVED', 'Event filter removed', { eventName })
      }
    }
  }

  /**
   * Emit event with delay
   * @param {number} delay - Delay in milliseconds
   * @param {string} eventName - Event name
   * @param {...any} args - Event arguments
   * @returns {NodeJS.Timeout} Timeout ID
   */
  emitDelayed(delay, eventName, ...args) {
    return setTimeout(() => {
      this.emit(eventName, ...args)
    }, delay)
  }

  /**
   * Emit event repeatedly with interval
   * @param {number} interval - Interval in milliseconds
   * @param {string} eventName - Event name
   * @param {...any} args - Event arguments
   * @returns {NodeJS.Timer} Interval ID
   */
  emitInterval(interval, eventName, ...args) {
    return setInterval(() => {
      this.emit(eventName, ...args)
    }, interval)
  }

  /**
   * Wait for event with timeout
   * @param {string} eventName - Event name to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise that resolves with event args or rejects on timeout
   */
  waitForEvent(eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeListener(eventName, listener)
        reject(new Error(`Event '${eventName}' timeout after ${timeout}ms`))
      }, timeout)
      
      const listener = (...args) => {
        clearTimeout(timeoutId)
        resolve(args)
      }
      
      this.once(eventName, listener)
    })
  }

  /**
   * Get event statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalEvents: this.stats.totalEvents,
      eventTypes: Object.fromEntries(this.stats.eventsByType),
      listeners: Object.fromEntries(this.stats.listeners),
      errors: this.stats.errors,
      totalListeners: Array.from(this.stats.listeners.values()).reduce((sum, count) => sum + count, 0),
      eventNames: this.eventNames(),
      maxListeners: this.getMaxListeners()
    }
  }

  /**
   * Get event history
   * @param {number} limit - Number of recent events to return
   * @returns {Array} Array of recent events
   */
  getEventHistory(limit = 10) {
    return this.eventHistory.slice(-limit)
  }

  /**
   * Clear event history
   */
  clearEventHistory() {
    this.eventHistory = []
    logInfo('EVENT_HISTORY_CLEARED', 'Event history cleared')
  }

  /**
   * Get listeners for all events
   * @returns {Object} Object with event names as keys and listener counts as values
   */
  getAllListeners() {
    const result = {}
    this.eventNames().forEach(eventName => {
      result[eventName] = this.listenerCount(eventName)
    })
    return result
  }

  /**
   * Remove all listeners for all events
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.updateListenerStats(eventName, 'removeAll')
    } else {
      // Clear all listener stats
      this.stats.listeners.clear()
    }
    return super.removeAllListeners(eventName)
  }

  /**
   * Apply middleware to event
   * @param {string} eventName - Event name
   * @param {Array} args - Event arguments
   * @returns {boolean} Whether to continue with event emission
   */
  applyMiddleware(eventName, args) {
    for (const middleware of this.middleware) {
      try {
        const result = middleware(eventName, args)
        if (result === false) {
          return false
        }
      } catch (error) {
        logError('MIDDLEWARE_ERROR', error, { eventName })
        // Continue with other middleware
      }
    }
    return true
  }

  /**
   * Check if event should be filtered
   * @param {string} eventName - Event name
   * @param {Array} args - Event arguments
   * @returns {boolean} Whether the event should be filtered out
   */
  isEventFiltered(eventName, args) {
    const filters = this.filters.get(eventName)
    if (!filters || filters.length === 0) {
      return false
    }
    
    for (const filter of filters) {
      try {
        if (filter(args) === false) {
          return true
        }
      } catch (error) {
        logError('FILTER_ERROR', error, { eventName })
        // Continue with other filters
      }
    }
    
    return false
  }

  /**
   * Update event type statistics
   * @param {string} eventName - Event name
   */
  updateEventTypeStats(eventName) {
    const current = this.stats.eventsByType.get(eventName) || 0
    this.stats.eventsByType.set(eventName, current + 1)
  }

  /**
   * Update listener statistics
   * @param {string} eventName - Event name
   * @param {string} action - Action (add, remove, removeAll)
   */
  updateListenerStats(eventName, action) {
    const current = this.stats.listeners.get(eventName) || 0
    
    switch (action) {
      case 'add':
        this.stats.listeners.set(eventName, current + 1)
        break
      case 'remove':
        this.stats.listeners.set(eventName, Math.max(0, current - 1))
        break
      case 'removeAll':
        this.stats.listeners.set(eventName, 0)
        break
    }
  }

  /**
   * Add event to history
   * @param {string} eventName - Event name
   * @param {Array} args - Event arguments
   */
  addToHistory(eventName, args) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      args: args.length > 0 ? args : undefined,
      listenerCount: this.listenerCount(eventName)
    }
    
    this.eventHistory.push(event)
    
    // Keep history size under limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   * @param {string} eventName - Event name that caused the error
   * @param {Array} args - Event arguments
   */
  handleError(error, eventName, args) {
    logError('EVENT_EMITTER_ERROR', error, {
      eventName,
      argsCount: args ? args.length : 0
    })
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    this.stats = {
      totalEvents: 0,
      eventsByType: new Map(),
      errors: 0,
      listeners: new Map()
    }
    this.eventHistory = []
    logInfo('EVENT_STATS_RESET', 'Event statistics reset')
  }

  /**
   * Clean up and shutdown event emitter
   */
  shutdown() {
    logInfo('EVENT_EMITTER_SHUTDOWN', 'Shutting down event emitter')
    
    // Remove all listeners
    this.removeAllListeners()
    
    // Clear middleware and filters
    this.middleware = []
    this.filters.clear()
    
    // Clear history and stats
    this.eventHistory = []
    this.resetStats()
    
    // Emit shutdown event
    super.emit('shutdown')
  }
}

export { CustomEventEmitter }