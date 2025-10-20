/**
 * SQLite Database Utilities
 * 
 * Provides SQLite connection for analytics and logging.
 * Uses better-sqlite3 for synchronous API (simpler and faster).
 * 
 * Features:
 * - Automatic schema migration
 * - Connection pooling (singleton pattern)
 * - Write-Ahead Logging (WAL) for better concurrency
 * - Automatic cleanup of old events (30-day retention)
 * 
 * Tables:
 * - events: User tracking events
 * - metrics: Aggregated performance metrics
 * - logs: Application logs
 * - alerts: Alert triggers and thresholds
 * 
 * Phase 7: Monitoring System
 * Created: 2025-10-18
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'analytics.db');
const SCHEMA_VERSION = 1;

let db: Database.Database | null = null;

/**
 * Initialize database schema
 */
function initializeSchema(database: Database.Database): void {
  // Enable WAL mode for better concurrency
  database.pragma('journal_mode = WAL');
  database.pragma('synchronous = NORMAL');
  database.pragma('foreign_keys = ON');

  // Create schema version table
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check current schema version
  const currentVersion = database.prepare('SELECT MAX(version) as version FROM schema_version').get() as { version: number | null };

  if (!currentVersion.version || currentVersion.version < SCHEMA_VERSION) {
    console.log(`[db] Migrating schema from ${currentVersion.version || 0} to ${SCHEMA_VERSION}`);
    applyMigrations(database, currentVersion.version || 0);
  }
}

/**
 * Apply database migrations
 */
function applyMigrations(database: Database.Database, fromVersion: number): void {
  const migrations: Array<() => void> = [];

  // Migration 1: Initial schema
  if (fromVersion < 1) {
    migrations.push(() => {
      database.exec(`
        -- Events table (user tracking)
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event TEXT NOT NULL,
          properties TEXT NOT NULL DEFAULT '{}',
          timestamp INTEGER NOT NULL,
          session_id TEXT NOT NULL,
          page_url TEXT NOT NULL,
          user_agent TEXT NOT NULL,
          ip_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);
        CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
        CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

        -- Metrics table (aggregated performance data)
        CREATE TABLE IF NOT EXISTS metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          metric_name TEXT NOT NULL,
          metric_value REAL NOT NULL,
          metric_unit TEXT NOT NULL,
          tags TEXT NOT NULL DEFAULT '{}',
          timestamp INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
        CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);

        -- Logs table (application logs)
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL,
          message TEXT NOT NULL,
          context TEXT NOT NULL DEFAULT '{}',
          stack_trace TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
        CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

        -- Alerts table (monitoring alerts)
        CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          alert_type TEXT NOT NULL,
          severity TEXT NOT NULL,
          message TEXT NOT NULL,
          details TEXT NOT NULL DEFAULT '{}',
          resolved BOOLEAN NOT NULL DEFAULT 0,
          resolved_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
        CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
        CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
        CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
      `);

      // Insert schema version
      database.prepare('INSERT INTO schema_version (version) VALUES (?)').run(1);
    });
  }

  // Execute migrations
  for (const migration of migrations) {
    migration();
  }
}

/**
 * Get database connection (singleton)
 */
export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database connection
  db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Initialize schema
  initializeSchema(db);

  console.log(`[db] SQLite database initialized at ${DB_PATH}`);

  return db;
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[db] SQLite database connection closed');
  }
}

/**
 * Cleanup old events (30-day retention)
 */
export function cleanupOldEvents(): number {
  const db = getDb();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const result = db.prepare('DELETE FROM events WHERE created_at < ?').run(thirtyDaysAgo);

  console.log(`[db] Cleaned up ${result.changes} old events (older than ${thirtyDaysAgo})`);

  return result.changes;
}

/**
 * Get event statistics
 */
export function getEventStats(): {
  total_events: number;
  unique_sessions: number;
  date_range: { oldest: string | null; newest: string | null };
} {
  const db = getDb();

  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  const uniqueSessions = db.prepare('SELECT COUNT(DISTINCT session_id) as count FROM events').get() as { count: number };
  const dateRange = db.prepare('SELECT MIN(created_at) as oldest, MAX(created_at) as newest FROM events').get() as { oldest: string | null; newest: string | null };

  return {
    total_events: totalEvents.count,
    unique_sessions: uniqueSessions.count,
    date_range: dateRange,
  };
}

/**
 * Log metric to database
 */
export function logMetric(
  name: string,
  value: number,
  unit: string = 'count',
  tags: Record<string, any> = {}
): void {
  const db = getDb();

  db.prepare(`
    INSERT INTO metrics (metric_name, metric_value, metric_unit, tags, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, value, unit, JSON.stringify(tags), Date.now());
}

/**
 * Create alert
 */
export function createAlert(
  type: string,
  severity: 'critical' | 'warning' | 'info',
  message: string,
  details: Record<string, any> = {}
): void {
  const db = getDb();

  db.prepare(`
    INSERT INTO alerts (alert_type, severity, message, details)
    VALUES (?, ?, ?, ?)
  `).run(type, severity, message, JSON.stringify(details));

  console.warn(`[alert:${severity}] ${type}: ${message}`);
}

// Cleanup old events on startup (in production, use cron job)
if (process.env.NODE_ENV === 'production') {
  // Run cleanup once on initialization
  setTimeout(() => {
    try {
      cleanupOldEvents();
    } catch (error) {
      console.error('[db] Failed to cleanup old events:', error);
    }
  }, 5000); // Delay 5 seconds to avoid blocking startup
}
