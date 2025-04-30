#!/bin/bash
echo "Starting the application with database seeding..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set."
    echo "Please set your serverless database URL first:"
    echo "export DATABASE_URL=your_neon_database_url"
    exit 1
fi

SEED_DB=true docker-compose up --build
