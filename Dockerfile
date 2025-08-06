# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY README.md ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S freebird -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R freebird:nodejs /app

# Switch to non-root user
USER freebird

# Expose port (for potential HTTP transport in future)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node dist/index.js --help || exit 1

# Default command
CMD ["node", "dist/index.js"]