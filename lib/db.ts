import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let _db: Database.Database | null = null;

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'backlog'
        CHECK(status IN ('backlog','in_progress','blocked','done')),
      owner TEXT,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'ideas'
        CHECK(status IN ('ideas','draft','review','scheduled','published')),
      owner TEXT,
      scheduled_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      responsibilities TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      event_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events(event_date);

    CREATE TABLE IF NOT EXISTS task_dispatches (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      agent_id TEXT,
      request_text TEXT NOT NULL,
      response_json TEXT,
      response_text TEXT,
      exit_code INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_task_dispatches_task ON task_dispatches(task_id);
  `);
}

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = process.env.MISSION_CONTROL_DATA_DIR || './data';
  fs.mkdirSync(dir, { recursive: true });

  const dbPath = path.join(dir, 'mission-control.sqlite');
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  initSchema(_db);

  return _db;
}
