/* Prepared by Twistor Holdings LLC.
 * TW-942 fix round 1: HTTP-level tests against the REAL waitlist
 * server (ephemeral port, temp store, synthetic data only), plus
 * core-level regressions for Rosa's live probes:
 *  1. admin gate fails CLOSED when WAITLIST_ADMIN_TOKEN is unset
 *  2. one truncated JSONL line must not brick count/list/add or kill
 *     the server process; internal errors return 500, never death
 *  3. admin token compare is timing-safe (mechanism check)
 *  4. audit events on count/export reads and failed auth, no PII
 *  5. CSV formula injection neutralized in csvCell output
 *  7. 401 gate, HTTP duplicate, malformed body, oversized body (413)
 * Run: node tests/tw942-server.test.mjs (no dependencies)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverPath = path.join(root, 'server', 'waitlist-server.mjs');
const corePath = path.join(root, 'src', 'lib', 'waitlist', 'waitlist-core.mjs');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; } else { fail++; console.log('FAIL:', name); }
}

const core = await import(corePath);
const goodRecord = {
  email: 'probe.one@example.com',
  phone: '+17205550101',
  consent: true,
  consentText: core.CONSENT_TEXT,
  consentVersion: core.CONSENT_VERSION,
  source: 'test:tw942-server',
  createdAt: '2026-11-05T00:00:00.000Z',
};

// --- Fix 2 (core): truncated line tolerated / quarantined ---
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw942-core-'));
  const file = path.join(dir, 'waitlist.jsonl');
  fs.writeFileSync(file, JSON.stringify(goodRecord) + '\n' + '{"email":"torn@example.com","pho', 'utf8');
  const store = core.createWaitlistStore(file);
  let listed = null, threw = false;
  try { listed = store.list(); } catch { threw = true; }
  ok('fix2: list() tolerates a truncated trailing line', !threw && Array.isArray(listed));
  ok('fix2: list() returns only the parseable records', listed && listed.length === 1 && listed[0].email === 'probe.one@example.com');
  let counted = -1; try { counted = store.count(); } catch { /* RED: throws today */ }
  ok('fix2: count() survives the bad line', counted === 1);
  ok('fix2: bad line is counted/quarantined, not silent', typeof store.badLineCount === 'function' && store.badLineCount() === 1);
  let added = { status: 'threw' };
  try { added = store.add({ email: 'probe.two@example.com', phone: '+1 720 555 0102', consent: true, consentText: core.CONSENT_TEXT, source: 'test:tw942-server' }); } catch { /* RED: throws today */ }
  let counted2 = -1; try { counted2 = store.count(); } catch { /* RED */ }
  ok('fix2: add() still works with a bad line in the store', added.status === 'created' && counted2 === 2);
}

// --- Fix 5 (core): CSV formula injection neutralized (OWASP) ---
{
  const evil = [
    { ...goodRecord, email: '=2+5@example.com', source: '=HYPERLINK("http://evil.example","x")' },
    { ...goodRecord, email: 'plus@example.com', source: '+2+5' },
    { ...goodRecord, email: 'minus@example.com', source: '-2+5' },
    { ...goodRecord, email: 'at@example.com', source: '@SUM(1+1)' },
    { ...goodRecord, email: 'tab@example.com', source: '\t=2+5' },
    { ...goodRecord, email: 'cr@example.com', source: '\r=2+5' },
  ];
  const csv = core.toCsv(evil);
  const lines = csv.trim().split('\n').slice(1);
  // Reconstruct each row's source cell (last-but-one field): simpler,
  // assert no cell in the raw output starts a field with a formula char.
  // Dialable phones (+ followed by digits only) are plain signed
  // numbers, exempt from neutralization; blank them before the sweep.
  const swept = csv.split('\n').slice(1).join('\n').replace(/,\+\d{7,15},/g, ',,');
  ok('fix5: no exported cell begins with =, +, -, @, tab or CR formula lead',
    !/(^|,)[=+\-@\t\r]/.test(swept));
  ok('fix5: formula-leading email is neutralized with a prefix', csv.includes("'=2+5@example.com") || csv.includes('"\'=2+5@example.com'));
  ok('fix5: formula-leading source is neutralized with a prefix', lines.some((l) => l.includes("'=HYPERLINK")));
  ok('fix5: tab-led source is neutralized', !csv.includes('\t=2+5') || csv.includes("'\t=2+5") || csv.includes('"\''));
  const normal = core.toCsv([goodRecord]);
  ok('fix5: ordinary rows are unchanged by neutralization', normal.includes('probe.one@example.com,+17205550101,true,'));
}

// --- Fix 3 (mechanism): timing-safe compare in the server source ---
{
  const serverSrc = fs.readFileSync(serverPath, 'utf8');
  ok('fix3: server uses crypto.timingSafeEqual for the admin token', serverSrc.includes('timingSafeEqual'));
  ok('fix1: server source has no fail-open token shortcut', !/return\s+!adminToken/.test(serverSrc));
}

// --- HTTP harness: spawn the real server ---
const children = [];
async function startServer({ token, seedLines }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw942-http-'));
  const file = path.join(dir, 'waitlist.jsonl');
  if (seedLines) fs.writeFileSync(file, seedLines, 'utf8');
  const port = 19000 + Math.floor(Math.random() * 2000);
  const env = { ...process.env, PORT: String(port), WAITLIST_DATA_FILE: file };
  if (token === undefined) delete env.WAITLIST_ADMIN_TOKEN; else env.WAITLIST_ADMIN_TOKEN = token;
  const child = spawn(process.execPath, [serverPath], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 50; i++) {
    if (child.exitCode !== null) break;
    try { await fetch(base + '/api/waitlist/count'); return { child, base, file, dir }; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  return { child, base, file, dir };
}
const signup = { email: 'http.one@example.com', phone: '+1 720 555 0110', consent: true, consentText: core.CONSENT_TEXT, source: 'test:tw942-server' };
const post = (base, body, raw) => fetch(base + '/api/waitlist', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: raw !== undefined ? raw : JSON.stringify(body),
});

// Scenario A: token set
{
  const { child, base, file } = await startServer({ token: 'test-admin-token' });
  const noTok = await fetch(base + '/api/waitlist/count');
  ok('fix7: count without token is 401 when a token is set', noTok.status === 401);
  const wrongTok = await fetch(base + '/api/waitlist/count', { headers: { 'x-waitlist-admin-token': 'wrong' } });
  ok('fix7: count with a wrong token is 401', wrongTok.status === 401);
  const exportNoTok = await fetch(base + '/api/waitlist/export.csv');
  ok('fix7: export without token is 401 and leaks no PII', exportNoTok.status === 401 && !(await exportNoTok.text()).includes('@example.com'));

  const created = await post(base, signup);
  ok('fix7: first POST over HTTP is 201 created', created.status === 201 && (await created.json()).status === 'created');
  const dupe = await post(base, signup);
  const dupeBody = await dupe.json();
  ok('fix7: duplicate POST over HTTP is 200 duplicate, count stays 1', dupe.status === 200 && dupeBody.status === 'duplicate' && dupeBody.count === 1);

  const bad = await post(base, null, '{"email": broken');
  ok('fix7: malformed JSON body is a clean 400', bad.status === 400);
  const big = await post(base, null, '{"email":"' + 'x'.repeat(20000) + '@example.com"}');
  ok('nit: oversized body gets a real 413 response, not an empty reply', big.status === 413);
  const alive = await fetch(base + '/api/waitlist/count', { headers: { 'x-waitlist-admin-token': 'test-admin-token' } });
  ok('fix7: server survives malformed and oversized bodies', alive.status === 200 && (await alive.json()).count === 1);
  ok('nit: count response carries Cache-Control: no-store', (alive.headers.get('cache-control') || '').includes('no-store'));

  const exp = await fetch(base + '/api/waitlist/export.csv', { headers: { 'x-waitlist-admin-token': 'test-admin-token' } });
  const expText = await exp.text();
  ok('fix7: export with the token returns the stored row', exp.status === 200 && expText.includes('http.one@example.com'));
  ok('nit: export response carries Cache-Control: no-store', (exp.headers.get('cache-control') || '').includes('no-store'));

  // Fix 4: audit trail alongside the store, no PII in it
  const auditFile = file + '.audit.jsonl';
  ok('fix4: an append-only audit log exists alongside the store', fs.existsSync(auditFile));
  if (fs.existsSync(auditFile)) {
    const audit = fs.readFileSync(auditFile, 'utf8');
    const events = audit.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    ok('fix4: successful count read is audited', events.some((e) => e.route === '/api/waitlist/count' && e.outcome === 'ok'));
    ok('fix4: successful export is audited with a row count and no PII payload',
      events.some((e) => e.route === '/api/waitlist/export.csv' && e.outcome === 'ok' && e.rows === 1));
    ok('fix4: failed auth attempts are audited as denied', events.some((e) => e.outcome === 'denied'));
    ok('fix4: audit log contains no signup PII', !audit.includes('http.one@example.com') && !audit.includes('5550110'));
    ok('fix4: every audit event carries a timestamp', events.every((e) => typeof e.ts === 'string' && !Number.isNaN(Date.parse(e.ts))));
  }
  ok('fix2-http: server process is still alive at the end of scenario A', child.exitCode === null);
  child.kill();
}

// Scenario B: token UNSET must fail closed (Rosa's unauthenticated export probe)
{
  const seed = JSON.stringify({ ...goodRecord, email: 'seeded@example.com' }) + '\n';
  const { child, base } = await startServer({ token: undefined, seedLines: seed });
  const count = await fetch(base + '/api/waitlist/count');
  const countText = await count.text();
  ok('fix1: count with NO token configured refuses (503), never opens', count.status === 503);
  const exp = await fetch(base + '/api/waitlist/export.csv');
  const expText = await exp.text();
  ok('fix1: unauthenticated export attempt with no token configured returns NO PII',
    exp.status === 503 && !expText.includes('seeded@example.com'));
  const pub = await post(base, { ...signup, email: 'http.two@example.com' });
  ok('fix1: public signup still works when the admin token is unset', pub.status === 201);
  ok('fix1: server process alive after fail-closed refusals', child.exitCode === null);
  child.kill();
}

// Scenario C: truncated store line over HTTP must not kill the process
{
  const seed = JSON.stringify(goodRecord) + '\n' + '{"email":"torn@example.com","pho';
  const { child, base } = await startServer({ token: 'test-admin-token', seedLines: seed });
  const count = await fetch(base + '/api/waitlist/count', { headers: { 'x-waitlist-admin-token': 'test-admin-token' } });
  ok('fix2: count over HTTP tolerates the truncated line (200, count 1)', count.status === 200 && (await count.json()).count === 1);
  const add = await post(base, { ...signup, email: 'http.three@example.com' });
  ok('fix2: POST over HTTP still creates with a bad line in the store', add.status === 201);
  ok('fix2: server process did NOT die from the malformed store line', child.exitCode === null);
  child.kill();
}

for (const c of children) { try { c.kill(); } catch { /* already dead */ } }
console.log(`tw942-server: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
