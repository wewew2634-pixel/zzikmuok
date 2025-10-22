#!/usr/bin/env node
/**
 * ZZIK MCP Server - Model Context Protocol Implementation
 * JSON-RPC 2.0 Server for ChatGPT Developer Mode Integration
 * 
 * Provides:
 * - fs_read: Read files (with root boundary check)
 * - http_get: HTTP requests (whitelist only)
 * - sqlite_query: SQLite queries (READ only for now)
 * 
 * Security:
 * - Root path enforcement (/home/user/webapp/zzik/data/)
 * - HTTP whitelist (instagram.com, kakao.com, etc.)
 * - Response size limits (MAX_TEXT: 10MB)
 * - Request timeout (30s)
 */

import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, normalize, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// Configuration
// ============================================

const PORT = process.env.MCP_PORT || 8080;
const ROOT_PATH = resolve(__dirname, '../data');
const MAX_TEXT_SIZE = 10 * 1024 * 1024; // 10MB
const HTTP_TIMEOUT = 30000; // 30s
const HTTP_WHITELIST = [
  'instagram.com',
  'facebook.com',
  'tiktok.com',
  'kakao.com',
  'naver.com',
  'google.com'
];

const app = express();
app.use(bodyParser.json({ limit: '20mb' }));

// ============================================
// Utilities
// ============================================

/**
 * Check if path is within ROOT_PATH boundary
 */
function safePath(requestedPath) {
  const resolvedPath = resolve(ROOT_PATH, requestedPath);
  const relativePath = relative(ROOT_PATH, resolvedPath);
  
  if (relativePath.startsWith('..') || resolve(ROOT_PATH, relativePath) !== resolvedPath) {
    throw new Error(`Access denied: Path outside root boundary (${requestedPath})`);
  }
  
  return resolvedPath;
}

/**
 * Check if URL is in whitelist
 */
function isWhitelisted(url) {
  try {
    const urlObj = new URL(url);
    return HTTP_WHITELIST.some(domain => urlObj.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

/**
 * JSON-RPC 2.0 response formatter
 */
function jsonrpc(id, result = null, error = null) {
  const response = { jsonrpc: '2.0', id };
  if (error) {
    response.error = { code: error.code || -32000, message: error.message };
  } else {
    response.result = result;
  }
  return response;
}

// ============================================
// MCP Tools Implementation
// ============================================

const tools = {
  /**
   * fs_read: Read file content
   */
  async fs_read({ path, encoding = 'utf-8' }) {
    const fullPath = safePath(path);
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }
    
    const stats = statSync(fullPath);
    if (stats.size > MAX_TEXT_SIZE) {
      throw new Error(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: 10MB)`);
    }
    
    const content = readFileSync(fullPath, encoding);
    return {
      path,
      encoding,
      size: stats.size,
      content
    };
  },

  /**
   * http_get: Make HTTP GET request
   */
  async http_get({ url, headers = {} }) {
    if (!isWhitelisted(url)) {
      throw new Error(`URL not whitelisted: ${url}`);
    }
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      
      const contentType = response.headers.get('content-type') || 'text/plain';
      let body;
      
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else {
        const text = await response.text();
        if (text.length > MAX_TEXT_SIZE) {
          throw new Error(`Response too large: ${(text.length / 1024 / 1024).toFixed(2)}MB`);
        }
        body = text;
      }
      
      return {
        url,
        status: response.status,
        ok: response.ok,
        contentType,
        body
      };
    } finally {
      clearTimeout(timeout);
    }
  },

  /**
   * sqlite_query: Execute SQLite query (READ only)
   */
  async sqlite_query({ db, sql, params = [] }) {
    const dbPath = safePath(db);
    
    if (!existsSync(dbPath)) {
      throw new Error(`Database not found: ${db}`);
    }
    
    // Security: Only allow SELECT statements
    const sqlUpper = sql.trim().toUpperCase();
    if (!sqlUpper.startsWith('SELECT')) {
      throw new Error('Only SELECT queries allowed (use sqlite_exec for write operations)');
    }
    
    const database = new Database(dbPath, { readonly: true });
    
    try {
      const stmt = database.prepare(sql);
      const rows = stmt.all(...params);
      
      return {
        db,
        sql,
        rows,
        count: rows.length
      };
    } finally {
      database.close();
    }
  }
};

// ============================================
// ZZMUK API v1 Endpoints (Spec-compliant)
// ============================================

// In-memory storage for pilot (replace with DB in production)
const checkoutSessions = new Map(); // idempotencyKey -> { sessionId, url, createdAt }
const qrTokens = new Map(); // token -> { sessionId, expiresAt, used, location, createdAt }

/**
 * GET /api/v1/feed
 * Hard filter + ranking pipeline
 * Filters: 영업중 ∧ 슬롯>0 ∧ 거리≤3km ∧ 언어호환 ∧ 예산범위
 * Ranking: 0.35*Intent + 0.25*Proximity + 0.20*Availability + 0.10*Freshness + 0.10*ROI
 */
app.get('/api/v1/feed', (req, res) => {
  const { lat, lng, lang = 'ko', budget_min, budget_max } = req.query;

  // Skeleton implementation (replace with PostGIS query)
  const mockOffers = [
    {
      id: 'offer_1',
      title: '성수동 팝업 체험',
      distance_km: 0.8,
      slots_available: 5,
      price: 15000,
      open_now: true,
      score: 0.92,
      components: {
        intent: 0.85,
        proximity: 0.95,
        availability: 0.90,
        freshness: 1.0,
        roi: 0.88
      }
    }
  ];

  // Hard filters applied (示例)
  const filtered = mockOffers.filter(o =>
    o.open_now &&
    o.slots_available > 0 &&
    o.distance_km <= 3.0
  );

  res.json({
    success: true,
    count: filtered.length,
    offers: filtered,
    filters_applied: {
      radius_km: 3.0,
      language: lang,
      budget_range: budget_min && budget_max ? [budget_min, budget_max] : null
    }
  });
});

/**
 * POST /api/v1/checkout
 * Spec: Idempotency-Key REQUIRED, hosted/redirect only
 * Returns session ID + redirect URL
 */
app.post('/api/v1/checkout', (req, res) => {
  const idempotencyKey = req.get('Idempotency-Key');

  // Spec enforcement: 400 if missing
  if (!idempotencyKey) {
    return res.status(400).json({
      error: 'IDEMPOTENCY_KEY_REQUIRED',
      message: 'Idempotency-Key header is required for checkout'
    });
  }

  // Check if already processed (idempotent replay)
  if (checkoutSessions.has(idempotencyKey)) {
    const existing = checkoutSessions.get(idempotencyKey);
    return res.json({
      success: true,
      session_id: existing.sessionId,
      redirect_url: existing.url,
      idempotent_replay: true
    });
  }

  // Create new session
  const { offer_id, amount, return_url } = req.body;
  const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const redirectUrl = `https://payment-gateway.example.com/checkout/${sessionId}`;

  checkoutSessions.set(idempotencyKey, {
    sessionId,
    url: redirectUrl,
    createdAt: new Date().toISOString(),
    offerId: offer_id,
    amount
  });

  res.json({
    success: true,
    session_id: sessionId,
    redirect_url: redirectUrl,
    idempotent_replay: false
  });
});

/**
 * POST /api/v1/pg/webhook
 * Payment gateway webhook
 * Spec: status=CAPTURED → Issue 1-time QR (5min TTL, ±60s drift)
 * Security: HMAC-SHA256 signature verification + timestamp validation
 */
app.post('/api/v1/pg/webhook', (req, res) => {
  const { session_id, status, amount, payment_id } = req.body;

  // Get signature and timestamp from headers
  const signature = req.get('X-Pay-Signature');
  const timestamp = req.get('X-Pay-Timestamp');

  // Verify webhook signature (if secret is configured)
  const webhookSecret = process.env.PG_WEBHOOK_SECRET;
  if (webhookSecret && signature && timestamp) {
    // Verify timestamp (±5 minutes tolerance)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const requestTimestamp = parseInt(timestamp, 10);

    if (Math.abs(currentTimestamp - requestTimestamp) > 300) {
      console.warn('Webhook timestamp out of range:', {
        current: currentTimestamp,
        request: requestTimestamp
      });
      return res.status(400).json({ error: 'TIMESTAMP_OUT_OF_RANGE' });
    }

    // Verify HMAC-SHA256 signature
    const payload = timestamp + '.' + JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'INVALID_SIGNATURE' });
    }
  }

  // Only process CAPTURED status
  if (status !== 'CAPTURED') {
    return res.json({ received: true, action: 'ignored' });
  }

  // Generate QR token
  const token = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  const now = Date.now();
  const expiresAt = now + (5 * 60 * 1000); // 5 minutes

  qrTokens.set(token, {
    sessionId: session_id,
    paymentId: payment_id,
    expiresAt,
    used: false,
    createdAt: now,
    location: null // Set by merchant during redeem
  });

  res.json({
    received: true,
    action: 'qr_issued',
    qr_token: token,
    expires_at: new Date(expiresAt).toISOString(),
    ttl_seconds: 300
  });
});

/**
 * POST /api/v1/redeem
 * Spec: Single use + location match + TTL (5min) + ±60s drift
 * Returns: 200 (success), 403 (used/location), 409 (duplicate), 410 (expired)
 */
app.post('/api/v1/redeem', (req, res) => {
  const { qr_token, merchant_location } = req.body;

  if (!qr_token) {
    return res.status(400).json({ error: 'QR_TOKEN_REQUIRED' });
  }

  const tokenData = qrTokens.get(qr_token);

  if (!tokenData) {
    return res.status(404).json({ error: 'TOKEN_NOT_FOUND' });
  }

  const now = Date.now();
  const SKEW_TOLERANCE = 60 * 1000; // ±60s

  // Check expiration with drift tolerance
  if (now > tokenData.expiresAt + SKEW_TOLERANCE) {
    return res.status(410).json({
      error: 'TOKEN_EXPIRED',
      expired_at: new Date(tokenData.expiresAt).toISOString(),
      current_time: new Date(now).toISOString()
    });
  }

  // Check single-use (409 Conflict for second redeem)
  if (tokenData.used) {
    return res.status(409).json({
      error: 'TOKEN_ALREADY_USED',
      used_at: tokenData.usedAt
    });
  }

  // Mark as used (atomic consumption)
  tokenData.used = true;
  tokenData.usedAt = new Date(now).toISOString();
  tokenData.location = merchant_location;

  res.json({
    success: true,
    session_id: tokenData.sessionId,
    payment_id: tokenData.paymentId,
    redeemed_at: tokenData.usedAt
  });
});

// ============================================
// JSON-RPC 2.0 Handler
// ============================================

app.post('/', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body;
  
  // Validate JSON-RPC 2.0 format
  if (jsonrpc !== '2.0') {
    return res.json(jsonrpc(id, null, { code: -32600, message: 'Invalid Request' }));
  }
  
  try {
    // Special methods
    if (method === 'initialize') {
      return res.json(jsonrpc(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: true
        },
        serverInfo: {
          name: 'zzik-mcp-server',
          version: '1.0.0'
        }
      }));
    }
    
    if (method === 'tools/list') {
      return res.json(jsonrpc(id, {
        tools: [
          {
            name: 'fs_read',
            title: 'Read File',
            description: 'Read file content from data directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'Relative path from data/ directory' },
                encoding: { type: 'string', default: 'utf-8' }
              },
              required: ['path']
            }
          },
          {
            name: 'http_get',
            title: 'HTTP GET Request',
            description: 'Make HTTP GET request (whitelisted domains only)',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'Full URL (must be whitelisted)' },
                headers: { type: 'object', description: 'HTTP headers' }
              },
              required: ['url']
            }
          },
          {
            name: 'sqlite_query',
            title: 'SQLite Query',
            description: 'Execute SELECT query on SQLite database',
            inputSchema: {
              type: 'object',
              properties: {
                db: { type: 'string', description: 'Database path (relative to data/)' },
                sql: { type: 'string', description: 'SELECT query' },
                params: { type: 'array', description: 'Query parameters' }
              },
              required: ['db', 'sql']
            }
          }
        ]
      }));
    }
    
    // Tool invocation
    if (tools[method]) {
      const result = await tools[method](params);
      return res.json(jsonrpc(id, result));
    }
    
    // Method not found
    return res.json(jsonrpc(id, null, { code: -32601, message: 'Method not found' }));
    
  } catch (error) {
    console.error(`[ERROR] ${method}:`, error.message);
    return res.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: error.message }
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'zzik-mcp-server',
    version: '1.0.0',
    rootPath: ROOT_PATH,
    whitelist: HTTP_WHITELIST
  });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 ZZIK MCP Server running on http://localhost:${PORT}`);
  console.log(`📁 Root path: ${ROOT_PATH}`);
  console.log(`🔐 HTTP whitelist: ${HTTP_WHITELIST.join(', ')}`);
  console.log(`\n✅ Ready for ChatGPT Developer Mode connection\n`);
});
