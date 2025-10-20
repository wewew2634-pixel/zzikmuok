/**
 * Event Tracking API Endpoint
 * 
 * Receives batched events from track() library and stores them in SQLite.
 * Implements rate limiting and validation.
 * 
 * @route POST /api/track
 * @body { events: TrackEvent[] }
 * @returns 204 No Content on success
 * 
 * Security:
 * - Rate limiting: 60 requests/minute per IP
 * - Event validation (max 50 events per batch)
 * - Property sanitization (remove PII)
 * - IP anonymization (hash with daily salt)
 * 
 * Phase 7: Monitoring System
 * Created: 2025-10-18
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getDb } from '@/lib/db/sqlite';

interface TrackEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  session_id: string;
  page_url: string;
  user_agent: string;
}

interface TrackRequestBody {
  events: TrackEvent[];
}

const MAX_EVENTS_PER_BATCH = 50;
const MAX_PROPERTY_VALUE_LENGTH = 1000;
const RATE_LIMIT_PER_MINUTE = 60;

// In-memory rate limiting (production would use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting check
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    // Create new rate limit window
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + 60000, // 1 minute
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Anonymize IP address (hash with daily salt)
 */
function anonymizeIp(ip: string): string {
  const today = new Date().toISOString().split('T')[0];
  const salt = process.env.IP_HASH_SALT || 'zzik-default-salt';
  const hash = createHash('sha256');
  hash.update(`${ip}-${today}-${salt}`);
  return hash.digest('hex').substring(0, 16);
}

/**
 * Sanitize event properties (remove potential PII)
 */
function sanitizeProperties(properties: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const blockedKeys = ['email', 'phone', 'password', 'token', 'secret', 'api_key'];

  for (const [key, value] of Object.entries(properties)) {
    // Skip blocked keys
    if (blockedKeys.some((blocked) => key.toLowerCase().includes(blocked))) {
      continue;
    }

    // Truncate long strings
    if (typeof value === 'string' && value.length > MAX_PROPERTY_VALUE_LENGTH) {
      sanitized[key] = value.substring(0, MAX_PROPERTY_VALUE_LENGTH) + '...';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate track event
 */
function validateEvent(event: TrackEvent): boolean {
  if (!event.event || typeof event.event !== 'string') return false;
  if (!event.timestamp || typeof event.timestamp !== 'number') return false;
  if (!event.session_id || typeof event.session_id !== 'string') return false;
  if (!event.page_url || typeof event.page_url !== 'string') return false;
  if (!event.properties || typeof event.properties !== 'object') return false;

  return true;
}

/**
 * Store events in SQLite database
 */
async function storeEvents(events: TrackEvent[], anonymizedIp: string): Promise<void> {
  const db = await getDb();

  const stmt = db.prepare(`
    INSERT INTO events (
      event,
      properties,
      timestamp,
      session_id,
      page_url,
      user_agent,
      ip_hash,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  for (const event of events) {
    const sanitizedProps = sanitizeProperties(event.properties);

    stmt.run(
      event.event,
      JSON.stringify(sanitizedProps),
      event.timestamp,
      event.session_id,
      event.page_url,
      event.user_agent,
      anonymizedIp,
      now
    );
  }

  stmt.finalize();
}

/**
 * POST /api/track
 * 
 * Accepts batched events and stores them in database
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    const anonymizedIp = anonymizeIp(ip);

    // Rate limiting check
    if (!checkRateLimit(anonymizedIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: TrackRequestBody = await request.json();

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid request: events array required' },
        { status: 400 }
      );
    }

    // Validate batch size
    if (body.events.length > MAX_EVENTS_PER_BATCH) {
      return NextResponse.json(
        { error: `Batch size exceeds maximum (${MAX_EVENTS_PER_BATCH})` },
        { status: 400 }
      );
    }

    // Validate each event
    const validEvents = body.events.filter(validateEvent);

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid events in batch' },
        { status: 400 }
      );
    }

    // Store events in database
    await storeEvents(validEvents, anonymizedIp);

    console.log(`[track] Stored ${validEvents.length} events from session ${validEvents[0]?.session_id}`);

    // Return 204 No Content (success, no body)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[track] Error processing events:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
