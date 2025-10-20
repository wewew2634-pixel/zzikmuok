/**
 * Health Check Endpoint
 * 
 * Provides service health status for monitoring and load balancers.
 * Checks database connectivity, external service availability.
 * 
 * @route GET /api/health
 * @returns Health status with detailed checks
 * 
 * Response:
 * - 200 OK: All systems operational
 * - 503 Service Unavailable: Critical service down
 * 
 * Phase 9: Monitoring
 * Created: 2025-10-18
 */

/* eslint-disable no-restricted-globals */

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getEventStats } from '@/lib/db/sqlite';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  checks: HealthCheck[];
  stats?: {
    total_events: number;
    unique_sessions: number;
    db_size_mb: number;
  };
}

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const startTime = Date.now();

/**
 * Check database health
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    const db = getDb();
    
    // Simple query to test connectivity
    db.prepare('SELECT 1').get();
    
    const latency = Date.now() - start;

    return {
      service: 'database',
      status: latency < 100 ? 'healthy' : 'degraded',
      latency_ms: latency,
    };
  } catch (error: any) {
    return {
      service: 'database',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

/**
 * Check external API connectivity (Instagram)
 */
async function checkInstagramApi(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Simple connectivity check (no auth required)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://graph.instagram.com/', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const latency = Date.now() - start;

    return {
      service: 'instagram_api',
      status: response.ok ? (latency < 1000 ? 'healthy' : 'degraded') : 'unhealthy',
      latency_ms: latency,
    };
  } catch (error: any) {
    return {
      service: 'instagram_api',
      status: 'degraded', // External API issues don't make our service unhealthy
      error: error.message,
    };
  }
}

/**
 * Check TikTok API connectivity
 */
async function checkTikTokApi(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://open.tiktokapis.com/', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const latency = Date.now() - start;

    return {
      service: 'tiktok_api',
      status: response.ok ? (latency < 1000 ? 'healthy' : 'degraded') : 'unhealthy',
      latency_ms: latency,
    };
  } catch (error: any) {
    return {
      service: 'tiktok_api',
      status: 'degraded', // External API issues don't make our service unhealthy
      error: error.message,
    };
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
  const criticalServices = ['database'];
  
  // Check critical services
  for (const check of checks) {
    if (criticalServices.includes(check.service) && check.status === 'unhealthy') {
      return 'unhealthy';
    }
  }

  // Check for any degraded services
  if (checks.some((c) => c.status === 'degraded' || c.status === 'unhealthy')) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * GET /api/health
 * 
 * Returns service health status
 */
export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    // Run health checks
    const checks: HealthCheck[] = await Promise.all([
      checkDatabase(),
      checkInstagramApi(),
      checkTikTokApi(),
    ]);

    // Get database stats
    let stats;
    try {
      const eventStats = getEventStats();
      const db = getDb();
      
      // Get database file size (rough estimate)
      const dbSize = db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get() as { size: number };

      stats = {
        total_events: eventStats.total_events,
        unique_sessions: eventStats.unique_sessions,
        db_size_mb: Math.round((dbSize.size / 1024 / 1024) * 100) / 100,
      };
    } catch (error) {
      console.error('[health] Failed to get stats:', error);
    }

    // Determine overall status
    const overallStatus = determineOverallStatus(checks);

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      checks,
      stats,
    };

    const totalLatency = Date.now() - start;

    // Log health check (only if degraded or unhealthy)
    if (overallStatus !== 'healthy') {
      console.warn('[health]', overallStatus, JSON.stringify(response, null, 2));
    }

    // Return appropriate status code
    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Duration': `${totalLatency}ms`,
      },
    });
  } catch (error: any) {
    console.error('[health] Health check failed:', error);

    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      checks: [
        {
          service: 'health_check',
          status: 'unhealthy',
          error: error.message,
        },
      ],
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * HEAD /api/health
 * 
 * Lightweight health check (for load balancers)
 */
export async function HEAD(request: NextRequest) {
  try {
    // Quick database check only
    const db = getDb();
    db.prepare('SELECT 1').get();

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
