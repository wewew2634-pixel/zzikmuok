/**
 * Data Retention Cron Job
 * 
 * Automated deletion of user data after 7-day grace period (GDPR/CCPA compliance).
 * Should be called daily by cron scheduler (Vercel Cron, Railway Cron, or system cron).
 * 
 * @route GET /api/cron/data-retention
 * @auth Bearer token (CRON_SECRET)
 * @returns Deletion statistics
 * 
 * Setup:
 * 1. Vercel: Add to vercel.json crons array
 * 2. Railway: Add to Procfile or use external cron service
 * 3. Manual: curl with CRON_SECRET header
 * 
 * Phase 10: Data Retention Automation
 * Created: 2025-10-18
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/sqlite';

interface DeletionStats {
  deleted_users: number;
  deleted_posts: number;
  deleted_tokens: number;
  deleted_sessions: number;
  elapsed_ms: number;
}

/**
 * Verify cron authentication
 */
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('[cron] CRON_SECRET not configured, allowing request');
    return true; // In development, allow without auth
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === cronSecret;
}

/**
 * Delete user data marked for deletion (7-day grace period)
 */
async function deleteExpiredUserData(): Promise<DeletionStats> {
  const db = getDb();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const stats: DeletionStats = {
    deleted_users: 0,
    deleted_posts: 0,
    deleted_tokens: 0,
    deleted_sessions: 0,
    elapsed_ms: 0,
  };

  const start = Date.now();

  try {
    // Start transaction
    db.exec('BEGIN TRANSACTION');

    // Find users marked for deletion
    const usersToDelete = db
      .prepare(
        `SELECT id FROM users 
         WHERE deleted_at IS NOT NULL 
         AND deleted_at < ? 
         AND deletion_completed = 0`
      )
      .all(sevenDaysAgo) as Array<{ id: number }>;

    console.log(`[cron] Found ${usersToDelete.length} users to permanently delete`);

    for (const user of usersToDelete) {
      // Delete OAuth tokens (encrypted)
      const tokensResult = db
        .prepare('DELETE FROM oauth_tokens WHERE user_id = ?')
        .run(user.id);
      stats.deleted_tokens += tokensResult.changes;

      // Delete synced posts
      const postsResult = db
        .prepare('DELETE FROM posts WHERE user_id = ?')
        .run(user.id);
      stats.deleted_posts += postsResult.changes;

      // Delete user sessions
      const sessionsResult = db
        .prepare('DELETE FROM sessions WHERE user_id = ?')
        .run(user.id);
      stats.deleted_sessions += sessionsResult.changes;

      // Mark user as permanently deleted (keep user record for audit)
      db.prepare(
        'UPDATE users SET deletion_completed = 1, email = NULL, phone = NULL WHERE id = ?'
      ).run(user.id);

      stats.deleted_users++;
    }

    // Commit transaction
    db.exec('COMMIT');

    stats.elapsed_ms = Date.now() - start;

    console.log('[cron] Data retention completed:', stats);

    return stats;
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    throw error;
  }
}

/**
 * Cleanup old analytics events (30-day retention)
 */
async function cleanupOldAnalytics(): Promise<number> {
  const db = getDb();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const result = db
    .prepare('DELETE FROM events WHERE created_at < ?')
    .run(thirtyDaysAgo);

  console.log(`[cron] Cleaned up ${result.changes} old analytics events`);

  return result.changes;
}

/**
 * Cleanup old logs (90-day retention for audit compliance)
 */
async function cleanupOldLogs(): Promise<number> {
  const db = getDb();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const result = db
    .prepare('DELETE FROM logs WHERE created_at < ? AND level NOT IN (?, ?)')
    .run(ninetyDaysAgo, 'error', 'critical'); // Keep error logs longer

  console.log(`[cron] Cleaned up ${result.changes} old logs`);

  return result.changes;
}

/**
 * GET /api/cron/data-retention
 * 
 * Runs data retention automation
 */
export async function GET(request: NextRequest) {
  console.log('[cron] Data retention job started');

  // Verify authentication
  if (!verifyCronAuth(request)) {
    console.warn('[cron] Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Run deletion tasks
    const deletionStats = await deleteExpiredUserData();
    const analyticsDeleted = await cleanupOldAnalytics();
    const logsDeleted = await cleanupOldLogs();

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        ...deletionStats,
        deleted_analytics: analyticsDeleted,
        deleted_logs: logsDeleted,
      },
    };

    console.log('[cron] Data retention job completed:', response);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[cron] Data retention job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/data-retention
 * 
 * Alternative endpoint for POST-based cron services
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
