import { Pool, PoolClient } from 'pg';

export class Database {
  private pool: Pool | null = null;

  async connect(connectionString: string): Promise<void> {
    this.pool = new Pool({
      connectionString,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      console.log('PostgreSQL connection established');
      client.release();
    } catch (error) {
      throw new Error(`Failed to connect to PostgreSQL: ${error}`);
    }
  }

  async initialize(): Promise<void> {
    if (!this.pool) throw new Error('Database not connected');

    // Users table
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
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
    await this.query(`
      CREATE TABLE IF NOT EXISTS matches (
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
    // CRITICAL: match_id UNIQUE constraint prevents duplicate conversations for same match
    // This ensures one conversation per match, preventing race conditions
    await this.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id)
      )
    `);

    // Messages table - optimized for pagination
    await this.query(`
      CREATE TABLE IF NOT EXISTS messages (
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

    // Likes table - for tracking who liked whom
    await this.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id),
        UNIQUE(from_user_id, to_user_id)
      )
    `);

    // Create indexes for performance
    await this.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)');
    await this.query('CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_id_1, user_id_2)');
    await this.query('CREATE INDEX IF NOT EXISTS idx_likes_users ON likes(from_user_id, to_user_id)');

    console.log('PostgreSQL database initialized successfully');
  }

  // Helper method to execute queries
  private async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.pool) throw new Error('Database not connected');
    const result = await this.pool.query(sql, params);
    return result;
  }

  // Public query methods for use in services
  async run(sql: string, params: any[] = []): Promise<void> {
    await this.query(sql, params);
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    const result = await this.query(sql, params);
    return result.rows[0] as T | undefined;
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.query(sql, params);
    return result.rows as T[];
  }

  async close(): Promise<void> {
    if (!this.pool) return;
    await this.pool.end();
    console.log('PostgreSQL connection closed');
  }

  // Get a client for transactions
  async getClient(): Promise<PoolClient> {
    if (!this.pool) throw new Error('Database not connected');
    return this.pool.connect();
  }
}

export const db = new Database();
