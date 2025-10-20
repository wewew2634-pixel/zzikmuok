import http from "http";
import { readFile, writeFile } from "fs/promises";
import { createHash } from "crypto";
import { resolve, join, normalize } from "path";
import { URL } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { cors, basic } from "./CORS.mjs";

const PORT = Number(process.env.MCP_PORT || 8080);
const ROOT = process.env.MCP_ROOT || "/data";
const MAX_TEXT = Number(process.env.MAX_TEXT || 200000);
const ALLOW = (process.env.ALLOW_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const rootPath = resolve(ROOT);

const dbp = open({ filename: join(rootPath, "mcp.db"), driver: sqlite3.Database });

const withinRoot = (requestedPath) => {
  if (!requestedPath) {
    throw new Error("path_required");
  }

  const normalized = normalize(
    requestedPath.startsWith("/") ? requestedPath : `/${requestedPath}`
  );
  const target = resolve(rootPath, `.${normalized}`);

  if (!target.startsWith(rootPath)) {
    throw new Error("path_escape");
  }

  return target;
};

const allowHost = (targetUrl) => {
  try {
    const hostname = new URL(targetUrl).hostname;
    if (!ALLOW.length) return true;
    return ALLOW.includes(hostname);
  } catch (error) {
    return false;
  }
};

const tools = {
  async fs_read({ path }) {
    const fullPath = withinRoot(path);
    const text = await readFile(fullPath, "utf-8");

    if (text.length > MAX_TEXT) {
      return { text: text.slice(0, MAX_TEXT), truncated: true };
    }

    return { text };
  },

  async fs_write({ path, text }) {
    if (typeof text !== "string") {
      throw new Error("invalid_payload");
    }

    if (text.length > MAX_TEXT) {
      throw new Error("too_large");
    }

    const fullPath = withinRoot(path);
    await writeFile(fullPath, text, "utf-8");

    return {
      ok: true,
      sha256: createHash("sha256").update(text).digest("hex"),
    };
  },

  async http_get({ url }) {
    if (!allowHost(url)) {
      throw new Error("host_not_allowed");
    }

    const response = await fetch(url, { method: "GET" });
    const body = await response.text();

    return {
      status: response.status,
      ok: response.ok,
      body: body.slice(0, MAX_TEXT),
    };
  },

  async sqlite_exec({ sql, params = [] }) {
    if (typeof sql !== "string" || !sql.trim()) {
      throw new Error("sql_required");
    }

    if (/^\s*select/i.test(sql)) {
      throw new Error("select_not_allowed");
    }

    const db = await dbp;
    await db.run("PRAGMA busy_timeout=2000;");
    const result = await db.run(sql, params);

    return { changes: result.changes ?? 0 };
  },

  async health() {
    return { ok: true };
  },
};

const jsonResponse = (res, payload, status = 200) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
};

const handleRequest = async (req, res) => {
  if (req.method === "OPTIONS") {
    cors(req, res);
    return;
  }

  cors(req, res);

  if (!basic(req)) {
    res.writeHead(401, { "WWW-Authenticate": "Basic" });
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    return jsonResponse(res, { status: "ok" });
  }

  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end();
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_TEXT * 2) {
      return jsonResponse(
        res,
        {
          jsonrpc: "2.0",
          error: { code: -32001, message: "payload_too_large" },
        },
        413
      );
    }
  }

  try {
    const request = JSON.parse(raw);
    const { id = null, method, params } = request;

    if (method === "initialize") {
      return jsonResponse(res, {
        jsonrpc: "2.0",
        id,
        result: {
          mcp: "1.0",
          tools: Object.keys(tools),
        },
      });
    }

    if (method === "tools/list") {
      return jsonResponse(res, {
        jsonrpc: "2.0",
        id,
        result: { tools: Object.keys(tools) },
      });
    }

    const handler = tools[method];
    if (!handler) {
      return jsonResponse(
        res,
        { jsonrpc: "2.0", id, error: { code: -32601, message: "method_not_found" } },
        400
      );
    }

    const result = await handler(params || {});
    return jsonResponse(res, { jsonrpc: "2.0", id, result });
  } catch (error) {
    return jsonResponse(
      res,
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: error?.message || "unknown_error",
        },
      },
      500
    );
  }
};

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    jsonResponse(
      res,
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: error?.message || "unknown_error",
        },
      },
      500
    );
  });
});

server.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
