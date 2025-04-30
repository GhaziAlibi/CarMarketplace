# Build stage
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies needed for wait-for-it script
RUN apk add --no-cache bash

# Copy package.json and install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy built application from build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy required files for Docker operation
COPY docker-entrypoint.sh ./
COPY wait-for-it.sh ./
COPY docker-seed.sh ./
COPY shared ./shared

# Make scripts executable
RUN chmod +x /app/wait-for-it.sh
RUN chmod +x /app/docker-entrypoint.sh
RUN chmod +x /app/docker-seed.sh

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5000

# Use entrypoint script to wait for database before starting the app
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start command
CMD ["npm", "start"]