FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S websocket -u 1001

# Change ownership of the app directory
RUN chown -R websocket:nodejs /app
USER websocket

# Expose ports
EXPOSE 8080 8081

# Health check for the health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/health || exit 1

# Start the server
CMD ["npm", "start"]