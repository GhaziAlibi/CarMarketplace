import { db } from './db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    // Add the header_image column to the showrooms table if it doesn't exist
    await db.execute(sql`
      ALTER TABLE showrooms 
      ADD COLUMN IF NOT EXISTS header_image TEXT
    `);
    
    // Add email and phone columns to showrooms table
    await db.execute(sql`
      ALTER TABLE showrooms 
      ADD COLUMN IF NOT EXISTS email TEXT
    `);
    
    await db.execute(sql`
      ALTER TABLE showrooms 
      ADD COLUMN IF NOT EXISTS phone TEXT
    `);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();