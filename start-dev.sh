#!/bin/bash

# Start development environment with Docker Compose
echo "Starting AutoMart development environment..."

# Check if .env.dev exists, create from template if it doesn't
if [ ! -f .env.dev ]; then
  echo "Creating .env.dev from template..."
  cp .env.example .env.dev
  echo "Please edit .env.dev with your development settings if needed."
fi

# Build and start the development containers
echo "Building and starting development containers..."
docker-compose -f docker-compose.dev.yml up --build

# The script will wait here while the containers are running
# When the user presses Ctrl+C, the script will continue

echo "Development environment stopped."