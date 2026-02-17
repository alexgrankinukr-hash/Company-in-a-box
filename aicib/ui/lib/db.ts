import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { getProjectDir } from "./config";

let cachedDb: Database.Database | null = null;

/**
 * Get a shared SQLite database connection to .aicib/state.db.
 * Sets WAL mode and 5s busy timeout. Connection is cached since
 * the Next.js dev server is long-lived.
 */
export function getDb(): Database.Database {
  if (cachedDb) return cachedDb;

  const projectDir = getProjectDir();
  const dbPath = path.join(projectDir, ".aicib", "state.db");

  if (!fs.existsSync(dbPath)) {
    throw new Error(
      `Database not found at ${dbPath}. Run 'aicib init' and 'aicib start' first.`
    );
  }

  cachedDb = new Database(dbPath);
  cachedDb.pragma("journal_mode = WAL");
  cachedDb.pragma("busy_timeout = 5000");

  return cachedDb;
}

/**
 * Open a fresh read-only database connection (for SSE streams that
 * need their own connection lifecycle).
 */
export function openReadOnlyDb(): Database.Database {
  const projectDir = getProjectDir();
  const dbPath = path.join(projectDir, ".aicib", "state.db");

  const db = new Database(dbPath, { readonly: true });
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  return db;
}
