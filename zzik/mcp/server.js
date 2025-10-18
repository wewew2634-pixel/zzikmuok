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
