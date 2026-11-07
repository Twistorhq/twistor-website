// Prepared by Twistor Holdings LLC.
// TW-942: minimal stored-waitlist server for social.twistor.co.
// Zero dependencies (node:http only), same JS stack as this repo.
//
//   node server/waitlist-server.mjs
//
// Env:
//   PORT                  listen port (default 8787)
//   WAITLIST_DATA_FILE    JSONL store path (default ./data/waitlist.jsonl)
//   WAITLIST_ADMIN_TOKEN  GET count/export require the header
//                         x-waitlist-admin-token to match it.
//                         TW-942 fix round 1 (Rosa must-fix 1): the gate
//                         FAILS CLOSED. When no token is configured the
//                         admin routes refuse with 503, never open.
//   WAITLIST_AUDIT_FILE   audit log path (default: the store path with
//                         ".audit.jsonl" appended, alongside the store)
//
// Routes:
//   POST /api/waitlist            public signup (email, phone, consent)
//   GET  /api/waitlist/count      admin: { count }
//   GET  /api/waitlist/export.csv admin: CSV export for seeding counts
//
// Audit (Rosa must-fix 4, TW-801 gate): every admin read and every
// failed admin auth attempt appends one JSON line to the audit log:
// timestamp, route, outcome (ok/denied/disabled), and for a successful
// export the row count. The audit log never contains signup PII.
//
// NOT deployed in TW-942. Deploy rides Justynn's separate TW-737 words;
// the host must run this process (or an equivalent port of it) next to
// the static site so /api/waitlist resolves on the subdomain.

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createWaitlistStore, defaultDataFile, toCsv } from '../src/lib/waitlist/waitlist-core.mjs';

const store = createWaitlistStore(defaultDataFile());
const adminToken = process.env.WAITLIST_ADMIN_TOKEN || '';
const auditFile = process.env.WAITLIST_AUDIT_FILE || store.filePath + '.audit.jsonl';

function audit(route, outcome, extra = {}) {
  try {
    fs.mkdirSync(path.dirname(auditFile), { recursive: true });
    const event = { ts: new Date().toISOString(), route, outcome, ...extra };
    fs.appendFileSync(auditFile, JSON.stringify(event) + '\n', 'utf8');
  } catch {
    // Auditing must never take the request path down with it.
    console.error('tw942: audit append failed for', route, outcome);
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

// Rosa must-fix 3: timing-safe compare with a length guard.
// Rosa must-fix 1: no token configured means NOT admin, always.
function isAdmin(req) {
  if (!adminToken) return false;
  const given = String(req.headers['x-waitlist-admin-token'] || '');
  const a = Buffer.from(given, 'utf8');
  const b = Buffer.from(adminToken, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Returns true when the request may proceed; otherwise the refusal
// (503 when the gate is disabled, 401 when the token is wrong) has
// already been sent and audited.
function requireAdmin(req, res, route) {
  if (!adminToken) {
    audit(route, 'disabled');
    sendJson(res, 503, { error: 'admin endpoints disabled: WAITLIST_ADMIN_TOKEN is not set' });
    return false;
  }
  if (!isAdmin(req)) {
    audit(route, 'denied');
    sendJson(res, 401, { error: 'admin token required' });
    return false;
  }
  return true;
}

const MAX_BODY = 16384;

const server = http.createServer((req, res) => {
  // Rosa must-fix 2 (HTTP half): a store or handler error returns 500.
  // It never propagates out of the request handler and kills the process.
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'POST' && url.pathname === '/api/waitlist') {
      let body = '';
      let tooLarge = false;
      req.on('data', (chunk) => {
        if (tooLarge) return;
        body += chunk;
        if (body.length > MAX_BODY) tooLarge = true;
      });
      req.on('error', () => { /* client went away; nothing to answer */ });
      req.on('end', () => {
        try {
          if (tooLarge) {
            // Nit (Rosa): answer 413 instead of destroying the socket
            // and leaving the client with an empty reply.
            sendJson(res, 413, { status: 'invalid', errors: ['payload-too-large'] });
            return;
          }
          let input;
          try {
            input = JSON.parse(body || '{}');
          } catch {
            sendJson(res, 400, { status: 'invalid', errors: ['json'] });
            return;
          }
          const result = store.add(input);
          if (result.status === 'invalid') {
            sendJson(res, 400, result);
          } else if (result.status === 'duplicate') {
            sendJson(res, 200, { status: 'duplicate', count: store.count() });
          } else {
            sendJson(res, 201, { status: 'created', count: store.count() });
          }
        } catch {
          sendJson(res, 500, { error: 'internal error' });
        }
      });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/waitlist/count') {
      if (!requireAdmin(req, res, '/api/waitlist/count')) return;
      const count = store.count();
      audit('/api/waitlist/count', 'ok', { count });
      return sendJson(res, 200, { count });
    }
    if (req.method === 'GET' && url.pathname === '/api/waitlist/export.csv') {
      if (!requireAdmin(req, res, '/api/waitlist/export.csv')) return;
      const records = store.list();
      audit('/api/waitlist/export.csv', 'ok', { rows: records.length });
      res.writeHead(200, {
        'content-type': 'text/csv; charset=utf-8',
        'cache-control': 'no-store',
      });
      return res.end(toCsv(records));
    }
    return sendJson(res, 404, { error: 'not found' });
  } catch {
    if (!res.headersSent) sendJson(res, 500, { error: 'internal error' });
    return undefined;
  }
});

const port = Number(process.env.PORT || 8787);
if (process.env.WAITLIST_NO_LISTEN !== '1') {
  server.listen(port, () => {
    console.log(`tw942 waitlist server listening on ${port}, store: ${store.filePath}`);
  });
}

export { server, store };
