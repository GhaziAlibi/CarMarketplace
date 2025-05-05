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

// Obfuscate DB URL for logging (show only the host, not credentials)
const getObfuscatedDbUrl = (url: string) => {
  try {
    // Extract host info without credentials
    const parts = url.split('@');
    return parts.length > 1 ? parts[1] : 'localhost';
  } catch (e) {
    return 'database';
  }
};

// Create the connection pool with some safeguards
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Add some protections against connection overload
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // return an error after 5 seconds if connection could not be established
});

// Set up error handlers on the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // On severe errors, exit the process so we restart cleanly
  if (err.fatal) {
    console.error('Fatal database error, exiting application');
    process.exit(1);
  }
});

// Perform a test query to validate connection works
async function validateDbConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log(`Connected to PostgreSQL database at ${getObfuscatedDbUrl(process.env.DATABASE_URL)}`);
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    throw new Error('Database connection failed. Please check DATABASE_URL and network connectivity.');
  } finally {
    client.release();
  }
}

// Initialize connection - will throw if not successful
validateDbConnection().catch(err => {
  console.error('Database connection validation failed:', err);
  // In production, we might want to exit the process here
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Create Drizzle ORM instance with schema
const db = drizzle(pool, { schema });

export { pool, db };