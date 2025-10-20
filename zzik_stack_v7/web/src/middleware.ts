/**
 * Next.js Middleware
 * 
 * Handles:
 * - Rate limiting (IP-based throttling)
 * - Security headers
 * - Request logging
 * - CORS (for API routes)
 * 
 * Phase 8: Rate Limiting
 * Created: 2025-10-18
 */

import { NextRequest, NextResponse } from 'next/server';

// ========================================
// Rate Limiting Configuration
// ========================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // API endpoints
  '/api/*': {
    windowMs: 60000, // 1 minute
    maxRequests: 60,
  },
  '/api/track': {
    windowMs: 60000,
    maxRequests: 30, // Lower limit for tracking endpoint
  },
  '/api/auth/*': {
    windowMs: 300000, // 5 minutes
    maxRequests: 10, // Strict limit for auth endpoints
  },
  '/oauth/*': {
    windowMs: 300000,
    maxRequests: 5, // Very strict for OAuth
  },
};

// In-memory rate limit store (production would use Redis/Upstash)
const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

/**
 * Get client identifier (anonymized IP)
 */
async function getClientIdentifier(request: NextRequest): Promise<string> {
  // Get IP from headers (works with proxies/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';

  // Anonymize IP using Web Crypto API (Edge Runtime compatible)
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.RATE_LIMIT_SALT || 'zzik-rate-limit-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16);
}

/**
 * Get rate limit config for path
 */
function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  // Check exact match first
  if (RATE_LIMITS[pathname]) {
    return RATE_LIMITS[pathname];
  }

  // Check pattern match
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (pathname.startsWith(prefix)) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Check rate limit
 */
function checkRateLimit(
  identifier: string,
  pathname: string
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const config = getRateLimitConfig(pathname);

  if (!config) {
    // No rate limit configured for this path
    return {
      allowed: true,
      limit: 0,
      remaining: 0,
      resetAt: 0,
    };
  }

  const key = `${identifier}:${pathname}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new rate limit window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment counter
  record.count++;

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Cleanup old rate limit entries (memory management)
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt + 60000) {
      // Remove entries older than 1 minute past reset
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[middleware] Cleaned up ${cleaned} old rate limit entries`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 300000);

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/robots.txt') ||
    pathname.includes('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // Get client identifier
  const clientId = await getClientIdentifier(request);

  // Check rate limit
  const rateLimit = checkRateLimit(clientId, pathname);

  if (!rateLimit.allowed) {
    // Rate limit exceeded
    console.warn(
      `[middleware] Rate limit exceeded for ${pathname} (client: ${clientId})`
    );

    // Return 429 Too Many Requests
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
        limit: rateLimit.limit,
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();

  if (rateLimit.limit > 0) {
    response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
  }

  // Add security headers (additional layer, Caddy also sets these)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'https://zzik.app',
      'https://www.zzik.app',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
  }

  return response;
}

// Matcher configuration (exclude static files and images)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
