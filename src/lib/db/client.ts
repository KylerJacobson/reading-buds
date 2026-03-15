import Database from "@tauri-apps/plugin-sql";

// Module-level singleton — one connection shared across the whole app.
let _db: Database | null = null;

/**
 * Returns the open database connection, initialising it on first call.
 * Migrations are applied automatically by the Rust plugin on startup, so
 * all this needs to do is open the connection.
 */
export async function getDb(): Promise<Database> {
  if (!_db) {
    _db = await Database.load("sqlite:reading-buddy.db");
  }
  return _db;
}
