# Database Seeding Instructions

This document explains how to seed your serverless database with sample data for the CarMarketplace application.

## Prerequisites

1. Make sure you have Docker and Docker Compose installed on your system.
2. You need to have your serverless database URL (Neon) available.

## Setting Up Your Database URL

Before running any of the commands below, you need to set your database URL as an environment variable:

### Windows

```cmd
set DATABASE_URL=your_neon_database_url
```

### Linux/Mac

```bash
export DATABASE_URL=your_neon_database_url
```

## Method 1: Seed Only (Without Starting the Application)

Use this method if you just want to seed the database without starting the application:

### Windows

```cmd
.\seed-database.bat
```

### Linux/Mac

```bash
chmod +x seed-database.sh  # Make the script executable (first time only)
./seed-database.sh
```

## Method 2: Start Application with Seeding

Use this method if you want to seed the database and then start the application:

### Windows

```cmd
.\start-with-seed.bat
```

### Linux/Mac

```bash
chmod +x start-with-seed.sh  # Make the script executable (first time only)
./start-with-seed.sh
```

## Method 3: Manual Seeding

If you prefer to run the commands manually:

### Seed Only

```bash
# Windows
set SEED_DB=true
docker-compose -f docker-compose.seed.yml up --build

# Linux/Mac
SEED_DB=true docker-compose -f docker-compose.seed.yml up --build
```

### Start with Seeding

```bash
# Windows
set SEED_DB=true
docker-compose up --build

# Linux/Mac
SEED_DB=true docker-compose up --build
```

## What Gets Seeded?

The seeding process will populate your database with:

1. **Users**:
   - Admin user (username: admin, password: admin123)
   - Seller user (username: seller, password: seller123)
   - Buyer user (username: buyer, password: buyer123)

2. **Showrooms**:
   - Premium Motors (owned by admin)
   - John Seller's Showroom (owned by seller)

3. **Cars**:
   - 2023 BMW X5 M-Sport Package
   - 2022 Mercedes-Benz S-Class S580
   - 2021 Porsche 911 Carrera 4S

The seed script is smart enough to check if data already exists before inserting, so you won't get duplicate entries if you run it multiple times.

## Troubleshooting

If you encounter any issues:

1. **Database Connection Issues**: Make sure your DATABASE_URL is correct and the database is accessible.
2. **Script Execution Issues**: Check that the seed script is being executed correctly.
3. **Permission Issues**: Make sure the shell scripts have execute permissions if you're on Linux/Mac.

You can check the logs from the seeding process to see what's happening:

```bash
docker-compose -f docker-compose.seed.yml logs
```
