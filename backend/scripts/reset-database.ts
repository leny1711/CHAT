#!/usr/bin/env node

/**
 * Database Reset Script
 * 
 * WARNING: This script will DELETE ALL DATA in the database!
 * 
 * Usage:
 *   npm run db:reset
 *   or
 *   npx ts-node scripts/reset-database.ts
 * 
 * This script:
 * - Drops all tables
 * - Recreates tables with fresh schema
 * - Should only be used in DEVELOPMENT
 */

// This script requires ts-node to be available
// It will be executed via: npx ts-node scripts/reset-database.ts

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Make sure you have a .env file with DATABASE_URL configured');
  process.exit(1);
}

async function resetDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Drop all tables
    console.log('🗑️  Dropping all tables...');
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS conversations CASCADE');
    await pool.query('DROP TABLE IF EXISTS likes CASCADE');
    await pool.query('DROP TABLE IF EXISTS matches CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ All tables dropped');
    
    // Recreate tables
    console.log('📝 Creating fresh database schema...');
    
    // Users table
    await pool.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        age INTEGER,
        bio TEXT,
        profile_photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Matches table
    await pool.query(`
      CREATE TABLE matches (
        id TEXT PRIMARY KEY,
        user_id_1 TEXT NOT NULL,
        user_id_2 TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id_1) REFERENCES users(id),
        FOREIGN KEY (user_id_2) REFERENCES users(id),
        UNIQUE(user_id_1, user_id_2)
      )
    `);
    
    // Conversations table
    await pool.query(`
      CREATE TABLE conversations (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id)
      )
    `);
    
    // Messages table
    await pool.query(`
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        status TEXT DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    `);
    
    // Likes table
    await pool.query(`
      CREATE TABLE likes (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id),
        UNIQUE(from_user_id, to_user_id)
      )
    `);
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await pool.query('CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC)');
    await pool.query('CREATE INDEX idx_matches_users ON matches(user_id_1, user_id_2)');
    await pool.query('CREATE INDEX idx_likes_users ON likes(from_user_id, to_user_id)');
    
    console.log('✅ Database schema created successfully');
    console.log('');
    console.log('================================================');
    console.log('✨ Database reset complete!');
    console.log('================================================');
    console.log('');
    console.log('All data has been deleted and tables recreated.');
    console.log('You can now start the backend server with: npm run dev');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the reset
resetDatabase();
