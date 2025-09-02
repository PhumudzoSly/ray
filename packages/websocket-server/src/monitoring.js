// Server metrics tracking
const serverMetrics = {
  startTime: Date.now(),
  totalConnections: 0,
  totalDisconnections: 0,
  peakConnections: 0,
  currentConnections: 0,
  authFailures: 0,
  rateLimitHits: 0,
  roomAccessDenials: 0,
  activeRooms: new Set(),
  lastActivity: Date.now()
}

// Room-specific statistics
const roomStats = new Map() // roomName -> { connections: Set, createdAt, lastActivity }

// Active connections tracking
const activeConnections = new Map() // ws -> { ip, userId, timestamp }

// Update server metrics
function updateMetrics() {
  serverMetrics.currentConnections = activeConnections.size
  serverMetrics.peakConnections = Math.max(serverMetrics.peakConnections, serverMetrics.currentConnections)
  serverMetrics.lastActivity = Date.now()
}

// Add connection to room tracking
function addToRoom(roomName, ws) {
  if (!roomStats.has(roomName)) {
    roomStats.set(roomName, {
      connections: new Set(),
      createdAt: Date.now(),
      lastActivity: Date.now()
    })
    serverMetrics.activeRooms.add(roomName)
  }
  
  const room = roomStats.get(roomName)
  room.connections.add(ws)
  room.lastActivity = Date.now()
}

// Remove connection from room tracking
function removeFromRoom(roomName, ws) {
  const room = roomStats.get(roomName)
  if (room) {
    room.connections.delete(ws)
    room.lastActivity = Date.now()
    
    // Clean up empty rooms
    if (room.connections.size === 0) {
      roomStats.delete(roomName)
      serverMetrics.activeRooms.delete(roomName)
    }
  }
}

// Get comprehensive server statistics
function getServerStats() {
  const uptime = Date.now() - serverMetrics.startTime
  const memoryUsage = process.memoryUsage()
  
  return {
    server: {
      uptime: Math.floor(uptime / 1000), // seconds
      uptimeFormatted: formatUptime(uptime),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    },
    connections: {
      current: serverMetrics.currentConnections,
      peak: serverMetrics.peakConnections,
      total: serverMetrics.totalConnections,
      totalDisconnections: serverMetrics.totalDisconnections
    },
    errors: {
      authFailures: serverMetrics.authFailures,
      rateLimitHits: serverMetrics.rateLimitHits,
      roomAccessDenials: serverMetrics.roomAccessDenials
    },
    rooms: {
      active: serverMetrics.activeRooms.size,
      list: Array.from(serverMetrics.activeRooms),
      details: Array.from(roomStats.entries()).map(([name, stats]) => ({
        name,
        connections: stats.connections.size,
        createdAt: new Date(stats.createdAt).toISOString(),
        lastActivity: new Date(stats.lastActivity).toISOString()
      }))
    },
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024) // MB
    },
    lastActivity: new Date(serverMetrics.lastActivity).toISOString(),
    timestamp: new Date().toISOString()
  }
}

// Format uptime in human-readable format
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// Log server statistics periodically
function logServerStats() {
  const stats = getServerStats()
  console.log(`📊 Server Stats - Uptime: ${stats.server.uptimeFormatted}, Connections: ${stats.connections.current}/${stats.connections.peak}, Rooms: ${stats.rooms.active}, Memory: ${stats.memory.heapUsed}MB`)
}

// Start periodic stats logging
function startStatsLogging() {
  setInterval(logServerStats, 10 * 60 * 1000) // Every 10 minutes
}

export {
  serverMetrics,
  roomStats,
  activeConnections,
  updateMetrics,
  addToRoom,
  removeFromRoom,
  getServerStats,
  startStatsLogging
}