#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start (5 seconds)..."
sleep 5

# Push the database schema using Drizzle
echo "Pushing database schema..."
npm run db:push

# Start the application with the path fix
echo "Starting the application..."
NODE_ENV=development node --experimental-specifier-resolution=node --import ./pathfix.js --loader tsx ./server/index.ts