# 🔌 ZZIK MCP Server

**Model Context Protocol (MCP)** implementation for ZZIK Creator Verification system.

This server provides ChatGPT Developer Mode with secure access to:
- File system (read-only, scoped to `/data` directory)
- HTTP requests (whitelisted domains only)
- SQLite databases (read-only queries)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/user/webapp/zzik/mcp
npm install
```

### 2. Start Server

```bash
npm start
# Server runs on http://localhost:8080
```

### 3. Test Connection

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "server": "zzik-mcp-server",
  "version": "1.0.0",
  "rootPath": "/home/user/webapp/zzik/data",
  "whitelist": ["instagram.com", "facebook.com", "tiktok.com", "kakao.com", "naver.com", "google.com"]
}
```

---

## 🛠️ Available Tools

### 1. `fs_read` - Read File

Read file content from the `/data` directory.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "fs_read",
  "params": {
    "path": "geojson/seoul.json",
    "encoding": "utf-8"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "path": "geojson/seoul.json",
    "encoding": "utf-8",
    "size": 12345,
    "content": "{ ... }"
  }
}
```

**Security:**
- ✅ Path must be within `/data` directory
- ✅ File size limit: 10MB
- ✅ Access to parent directories (`../`) is blocked

---

### 2. `http_get` - HTTP GET Request

Make HTTP GET requests to whitelisted domains.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "http_get",
  "params": {
    "url": "https://www.instagram.com/qetta_t/",
    "headers": {
      "User-Agent": "ZZIK-Bot/1.0"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "url": "https://www.instagram.com/qetta_t/",
    "status": 200,
    "ok": true,
    "contentType": "text/html",
    "body": "<html>...</html>"
  }
}
```

**Whitelisted Domains:**
- ✅ `instagram.com`
- ✅ `facebook.com`
- ✅ `tiktok.com`
- ✅ `kakao.com`
- ✅ `naver.com`
- ✅ `google.com`

**Security:**
- ✅ Only whitelisted domains allowed
- ✅ Request timeout: 30 seconds
- ✅ Response size limit: 10MB

---

### 3. `sqlite_query` - SQLite Query

Execute SELECT queries on SQLite databases.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "sqlite_query",
  "params": {
    "db": "checkpoints/db.sqlite",
    "sql": "SELECT * FROM checkpoints WHERE node = ? LIMIT 10",
    "params": ["HARVEST"]
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "db": "checkpoints/db.sqlite",
    "sql": "SELECT * FROM checkpoints WHERE node = ? LIMIT 10",
    "rows": [
      { "state_id": "abc123", "node": "HARVEST", "input": "{...}", "output": "{...}" }
    ],
    "count": 1
  }
}
```

**Security:**
- ✅ Only `SELECT` queries allowed (write operations blocked)
- ✅ Database must be within `/data` directory
- ✅ Connection is read-only

---

## 🔐 Security Model

### Path Traversal Prevention

```javascript
// ✅ Allowed
fs_read({ path: "geojson/seoul.json" })
fs_read({ path: "commercial/gangnam.json" })

// ❌ Blocked
fs_read({ path: "../../../etc/passwd" })
fs_read({ path: "/etc/hosts" })
```

### HTTP Whitelist Enforcement

```javascript
// ✅ Allowed
http_get({ url: "https://www.instagram.com/qetta_t/" })

// ❌ Blocked
http_get({ url: "https://evil.com/malware" })
http_get({ url: "http://localhost:22/ssh" })
```

### SQL Injection Prevention

```javascript
// ✅ Allowed (read-only)
sqlite_query({ sql: "SELECT * FROM users WHERE id = ?", params: [123] })

// ❌ Blocked (write operations)
sqlite_query({ sql: "DELETE FROM users WHERE id = 1" })
sqlite_query({ sql: "DROP TABLE users" })
```

---

## 📡 ChatGPT Developer Mode Integration

### Step 1: Expose Server (Local Development)

Use **ngrok** or **cloudflared** to expose the local server:

```bash
# Option 1: ngrok
ngrok http 8080

# Option 2: cloudflared
cloudflared tunnel --url http://localhost:8080
```

You'll get a public URL like:
```
https://abc123.ngrok-free.app
```

### Step 2: Register MCP Connector

In ChatGPT Developer Mode settings:

1. Go to **Settings** → **Beta Features** → **Developer Mode**
2. Click **Add MCP Server**
3. Enter:
   - **Name**: `ZZIK Creator Verification`
   - **URL**: `https://abc123.ngrok-free.app`
   - **Description**: `Access to ZZIK data files, HTTP requests, and SQLite databases for creator verification`

### Step 3: Test Connection

In ChatGPT, type:
```
Use the ZZIK MCP server to read the file "geojson/seoul.json"
```

ChatGPT will call:
```json
{
  "method": "fs_read",
  "params": { "path": "geojson/seoul.json" }
}
```

---

## 🧪 Testing

### Manual Test (cURL)

```bash
# Initialize connection
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'

# List available tools
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'

# Test fs_read
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "fs_read",
    "params": {
      "path": "test.txt"
    }
  }'
```

### Automated Test Suite (TODO)

```bash
npm test
```

---

## 📊 Monitoring

### Logs

Server logs all requests:
```
[INFO] POST / - method: fs_read - path: geojson/seoul.json - 200 OK
[ERROR] POST / - method: fs_read - path: ../etc/passwd - Access denied
```

### Metrics (Future)

- Request count by tool
- Error rate
- Response time (p50, p95, p99)

---

## 🔧 Configuration

### Environment Variables

```bash
# Server port (default: 8080)
export MCP_PORT=8080

# Root data path (default: ../data)
export MCP_ROOT_PATH=/home/user/webapp/zzik/data

# HTTP timeout (default: 30000ms)
export HTTP_TIMEOUT=30000

# Max response size (default: 10MB)
export MAX_TEXT_SIZE=10485760
```

---

## 🚨 Error Codes

| Code | Message | Cause |
|------|---------|-------|
| `-32600` | Invalid Request | Malformed JSON-RPC |
| `-32601` | Method not found | Unknown tool name |
| `-32000` | Server error | General error |
| Custom | `Access denied: Path outside root boundary` | Path traversal attempt |
| Custom | `URL not whitelisted` | Non-whitelisted domain |
| Custom | `File too large` | File > 10MB |
| Custom | `Only SELECT queries allowed` | Attempted write operation |

---

## 📚 JSON-RPC 2.0 Specification

This server implements [JSON-RPC 2.0](https://www.jsonrpc.org/specification):

- **Request**: `{ jsonrpc: "2.0", id, method, params }`
- **Success Response**: `{ jsonrpc: "2.0", id, result }`
- **Error Response**: `{ jsonrpc: "2.0", id, error: { code, message } }`

---

## 🛣️ Roadmap

### v1.0 (Current)
- ✅ `fs_read` (read-only)
- ✅ `http_get` (whitelisted)
- ✅ `sqlite_query` (SELECT only)

### v1.1 (Week 2)
- [ ] `fs_write` (with approval modal)
- [ ] `sqlite_exec` (with approval modal)
- [ ] Rate limiting (per IP)

### v1.2 (Week 3)
- [ ] Request logging to SQLite
- [ ] Metrics dashboard
- [ ] Retry logic with exponential backoff

---

## 📞 Support

- **Documentation**: This README
- **Issues**: GitHub Issues (link TBD)
- **Discord**: ZZIK Community (link TBD)

---

**Built with ❤️ for ZZIK Creator Verification**

**Protocol**: JSON-RPC 2.0  
**Runtime**: Node.js 18+  
**License**: MIT
