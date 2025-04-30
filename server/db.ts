import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "@shared/schema";

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure Neon with WebSocket
neonConfig.webSocketConstructor = ws;

// Create the pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Log connection info
console.log(`Connected to PostgreSQL database at ${process.env.DATABASE_URL.split('@')[1] || 'localhost'}`);

export { pool, db };