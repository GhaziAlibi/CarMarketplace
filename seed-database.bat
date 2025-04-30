@echo off
echo Seeding the database...

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set.
    echo Please set your serverless database URL first:
    echo set DATABASE_URL=your_neon_database_url
    exit /b 1
)

docker-compose -f docker-compose.seed.yml up --build
echo Database seeding completed!
