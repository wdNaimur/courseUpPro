import * as SQLite from "expo-sqlite";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("courseup-mobile.db");
  }

  return databasePromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL,
      source_uri TEXT NOT NULL,
      source_type TEXT NOT NULL,
      access_status TEXT NOT NULL,
      lesson_count INTEGER NOT NULL,
      thumbnail_uri TEXT,
      last_played_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      media_uri TEXT NOT NULL,
      folder_label TEXT NOT NULL,
      folder_path TEXT NOT NULL,
      display_index INTEGER NOT NULL,
      PRIMARY KEY (id, course_id)
    );
  `);

  return db;
}
