#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
/app/wait-for-it.sh postgres:5432 -t 60

# Push the database schema using Drizzle
echo "Pushing database schema..."
npm run db:push

# Start the application
echo "Starting the application..."
exec "$@"