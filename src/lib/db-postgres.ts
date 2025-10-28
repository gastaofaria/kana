import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        wallet_address TEXT PRIMARY KEY,
        total_deposits NUMERIC DEFAULT 0,
        shares BIGINT DEFAULT 0,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
        updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
      )
    `

    // Create deposits table
    await sql`
      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        wallet_address TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        transaction_signature TEXT,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
        FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
      )
    `

    // Create pool_state table
    await sql`
      CREATE TABLE IF NOT EXISTS pool_state (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_shares BIGINT DEFAULT 0,
        total_assets NUMERIC DEFAULT 0,
        CHECK (id = 1)
      )
    `

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(wallet_address)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at)
    `

    // Initialize pool_state if it doesn't exist
    await sql`
      INSERT INTO pool_state (id, total_shares, total_assets)
      VALUES (1, 0, 0)
      ON CONFLICT (id) DO NOTHING
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export { sql }
