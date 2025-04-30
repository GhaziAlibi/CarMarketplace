#!/bin/sh
set -e

# This script is used to seed the database when running in Docker
# It will be called from the docker-entrypoint.sh script

echo "Seeding the database..."

# Execute the seed script
node dist/seed.js

echo "Database seeding complete!"