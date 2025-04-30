#!/bin/bash

# Start production environment with Docker Compose
echo "Starting AutoMart production environment..."

# Check if .env exists, create from template if it doesn't
if [ ! -f .env ]; then
  echo "Creating .env from template..."
  cp .env.example .env
  echo "⚠️ Please edit .env with your production settings before continuing!"
  echo "Press Enter to continue or Ctrl+C to abort..."
  read
fi

# Build and start the production containers
echo "Building and starting production containers..."
docker-compose build
docker-compose up -d

echo "Production environment started in detached mode."
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"