import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.sqlite');
export const db = new Database(dbPath);

// Make SQLite a bit safer/consistent.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema

db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    orderType TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_reservations_createdAt ON reservations(createdAt);
  CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
`);

