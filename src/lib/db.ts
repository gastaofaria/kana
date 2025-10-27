import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'deposits.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    wallet_address TEXT PRIMARY KEY,
    total_deposits REAL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_signature TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
  );

  CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(wallet_address);
  CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at);
`)

export default db
