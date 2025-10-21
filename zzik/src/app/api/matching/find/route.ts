/**
 * ZZMUK Matching API Endpoint
 *
 * POST /api/matching/find
 *
 * Find matching creators or shops within 3km radius
 *
 * Performance Target: p95 < 200ms
 * Error Rate Target: < 1%
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findMatches,
  createMatchRequest,
  storeMatchResults,
  type MatchQuery,
} from '@/lib/matching-engine-pg';
import { GeoPerformanceTracker } from '@/lib/geo-utils';

// Global performance tracker
const perfTracker = new GeoPerformanceTracker();

/**
 * POST /api/matching/find
 *
 * Request body:
 * {
 *   userId: string;
 *   targetRole: 'creator' | 'shop';
 *   maxDistance?: number; // km, default 3.0
 *   category?: string;
 *   minFollowers?: number;
 *   limit?: number; // max results, default 20
 * }
 *
 * Response:
 * {
 *   matchRequestId: string;
 *   matches: MatchCandidate[];
 *   count: number;
 *   stats: {
 *     durationMs: number;
 *     p95: number;
 *     p50: number;
 *     avg: number;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.targetRole) {
      return NextResponse.json(
        {
          error: 'Missing required fields: userId and targetRole',
          code: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    // Validate targetRole
    if (!['creator', 'shop'].includes(body.targetRole)) {
      return NextResponse.json(
        {
          error: 'targetRole must be either "creator" or "shop"',
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Build query
    const query: MatchQuery = {
      userId: body.userId,
      targetRole: body.targetRole,
      maxDistance: body.maxDistance || 3.0,
      category: body.category,
      minFollowers: body.minFollowers,
    };

    const limit = body.limit || 20;

    // Create match request record
    const matchRequest = await createMatchRequest(query);

    // Execute matching algorithm
    const matches = await findMatches(query, limit);

    // Store match results
    await storeMatchResults(matchRequest.id, matches);

    const duration = performance.now() - startTime;
    perfTracker.record(duration);

    // Get performance stats
    const stats = perfTracker.getStats();

    // Log performance warning if p95 exceeds target
    if (stats.p95 > 200) {
      console.warn(
        `[Matching API] Performance degradation: p95=${stats.p95.toFixed(2)}ms (target: <200ms)`
      );
    }

    return NextResponse.json(
      {
        matchRequestId: matchRequest.id,
        matches,
        count: matches.length,
        stats: {
          durationMs: Math.round(duration),
          p95: Math.round(stats.p95),
          p50: Math.round(stats.p50),
          avg: Math.round(stats.avg),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const duration = performance.now() - startTime;
    perfTracker.record(duration);

    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Matching API] Error:', errorMessage);

    // Return appropriate error response
    if (errorMessage.includes('does not have location')) {
      return NextResponse.json(
        {
          error: 'User location not set. Please update your profile with location.',
          code: 'MISSING_LOCATION',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/matching/find/stats
 *
 * Get performance statistics for monitoring
 */
export async function GET() {
  const stats = perfTracker.getStats();

  return NextResponse.json({
    performance: {
      ...stats,
      target: {
        p95: 200,
        errorRate: 1.0,
      },
      status:
        stats.p95 < 200 ? 'healthy' : stats.p95 < 300 ? 'degraded' : 'unhealthy',
    },
    timestamp: new Date().toISOString(),
  });
}
