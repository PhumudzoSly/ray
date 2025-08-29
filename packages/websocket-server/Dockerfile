FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies using npm (since we're in an isolated container)
RUN npm install --only=production

# Copy server code
COPY server.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S websocket -u 1001

# Change ownership of the app directory
RUN chown -R websocket:nodejs /app
USER websocket

# Expose ports
EXPOSE 8080

# Health check disabled to avoid 426 errors with Railway
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:8081/health || exit 1

# Start the server
CMD ["node", "server.js"]