FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies needed for wait-for-it script
RUN apk add --no-cache bash

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Make scripts executable
RUN chmod +x /app/wait-for-it.sh
RUN chmod +x /app/docker-entrypoint.sh

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Use entrypoint script to wait for database before starting the app
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start command
CMD ["npm", "start"]