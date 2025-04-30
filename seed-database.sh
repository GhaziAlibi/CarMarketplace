#!/bin/bash
echo "Seeding the database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set."
    echo "Please set your serverless database URL first:"
    echo "export DATABASE_URL=your_neon_database_url"
    exit 1
fi

docker-compose -f docker-compose.seed.yml up --build
echo "Database seeding completed!"
