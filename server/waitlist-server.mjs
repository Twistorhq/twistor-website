// Prepared by Twistor Holdings LLC.
// TW-942: minimal stored-waitlist server for social.twistor.co.
// Zero dependencies (node:http only), same JS stack as this repo.
//
//   node server/waitlist-server.mjs
//
// Env:
//   PORT                  listen port (default 8787)
//   WAITLIST_DATA_FILE    JSONL store path (default ./data/waitlist.jsonl)
//   WAITLIST_ADMIN_TOKEN  when set, GET count/export require the header
//                         x-waitlist-admin-token to match it. Production
//                         MUST set this; without it the read endpoints
//                         are open, which is only acceptable locally.
//
// Routes:
//   POST /api/waitlist            public signup (email, phone, consent)
//   GET  /api/waitlist/count      admin: { count }
//   GET  /api/waitlist/export.csv admin: CSV export for seeding counts
//
// NOT deployed in TW-942. Deploy rides Justynn's separate TW-737 words;
// the host must run this process (or an equivalent port of it) next to
// the static site so /api/waitlist resolves on the subdomain.

import http from 'node:http';
import { createWaitlistStore, defaultDataFile, toCsv } from '../src/lib/waitlist/waitlist-core.mjs';

const store = createWaitlistStore(defaultDataFile());
const adminToken = process.env.WAITLIST_ADMIN_TOKEN || '';

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function isAdmin(req) {
  return !adminToken || req.headers['x-waitlist-admin-token'] === adminToken;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/api/waitlist') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 16384) req.destroy();
    });
    req.on('end', () => {
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
    });
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/waitlist/count') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'admin token required' });
    return sendJson(res, 200, { count: store.count() });
  }
  if (req.method === 'GET' && url.pathname === '/api/waitlist/export.csv') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'admin token required' });
    res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8' });
    return res.end(toCsv(store.list()));
  }
  return sendJson(res, 404, { error: 'not found' });
});

const port = Number(process.env.PORT || 8787);
if (process.env.WAITLIST_NO_LISTEN !== '1') {
  server.listen(port, () => {
    console.log(`tw942 waitlist server listening on ${port}, store: ${store.filePath}`);
  });
}

export { server, store };
