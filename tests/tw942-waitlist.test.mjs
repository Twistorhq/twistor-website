/* Prepared by Twistor Holdings LLC.
 * TW-942: contract + storage tests for the stored Twistor Social
 * waitlist (replaces the TW-737 mailto hand-off).
 * Run: node tests/tw942-waitlist.test.mjs (no dependencies)
 * All signup data below is clearly synthetic (example.com / 555 numbers).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = path.join(root, 'src', 'pages', 'social', 'index.astro');
const corePath = path.join(root, 'src', 'lib', 'waitlist', 'waitlist-core.mjs');
const serverPath = path.join(root, 'server', 'waitlist-server.mjs');
const exportPath = path.join(root, 'scripts', 'export-waitlist.mjs');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; } else { fail++; console.log('FAIL:', name); }
}

const src = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : '';
const lower = src.toLowerCase();

// --- Page contract: stored handler, phone, consent ---
ok('page file exists', !!src);
ok('stored handler marker present', src.includes('TW942_STORED_HANDLER'));
ok('old local-handler marker gone', !src.includes('TW737_LOCAL_HANDLER'));
ok('form posts to the waitlist endpoint via fetch', src.includes("fetch('/api/waitlist'") || src.includes('fetch("/api/waitlist"'));
ok('no mailto navigation in the submit handler', !src.includes("window.location.href = 'mailto:"));
ok('phone input present, labelled and required', (() => {
  const label = src.match(/<label for="([^"]+)">Phone for launch news<\/label>/);
  const input = src.match(/<input[^>]*type="tel"[^>]*>/);
  return !!label && !!input && /\brequired\b/.test(input[0]) && input[0].includes(`id="${label[1]}"`);
})());
ok('consent checkbox present, labelled and required', (() => {
  const input = src.match(/<input[^>]*type="checkbox"[^>]*>/);
  return !!input && /\brequired\b/.test(input[0]) && /name="consent"/.test(input[0]);
})());
ok('consent text is shown on the page', lower.includes('i agree that twistor may contact me'));
ok('consent covers email and phone contact', lower.includes('by email and by phone'));
ok('stored-copy note replaces the old does-not-store note',
  !lower.includes('does not collect or store your email on a server') &&
  lower.includes('are stored by twistor'));
ok('joining is still not an account and not verification', lower.includes('not an account') && lower.includes('not verification'));
ok('verification still framed as mission/design, never live',
  lower.includes('being built') && !lower.includes('verification is live') && !lower.includes('verified members'));
ok('zero em-dashes anywhere in the file', !src.includes('—'));
ok('two waitlist forms kept (hero and final panel)', (src.match(/class="waitlist-form"/g) || []).length === 2);
ok('each form carries email, phone and consent fields',
  (src.match(/<input[^>]*type="email"/g) || []).length === 2 &&
  (src.match(/<input[^>]*type="tel"/g) || []).length === 2 &&
  (src.match(/<input[^>]*type="checkbox"/g) || []).length === 2);

// --- Core module: validation, storage, duplicates, CSV ---
ok('core module exists', fs.existsSync(corePath));
ok('server exists', fs.existsSync(serverPath));
ok('export script exists', fs.existsSync(exportPath));
if (fs.existsSync(corePath)) {
  const core = await import(corePath);
  ok('core exports the consent text shown on the page',
    typeof core.CONSENT_TEXT === 'string' && lower.includes(core.CONSENT_TEXT.toLowerCase()));
  ok('core exports a consent version', typeof core.CONSENT_VERSION === 'string' && core.CONSENT_VERSION.length > 0);

  // Fix round 1 (Rosa must-fix 6): consent single-source as a MECHANISM.
  // EACH visible checkbox label must equal CONSENT_TEXT verbatim (exact
  // case, byte for byte), and so must the page JS constant that is
  // actually posted. Label drift now fails this suite, not just a
  // page-contains-it-once check that the JS const alone could satisfy.
  const consentLabels = [...src.matchAll(/<label for="(?:hero|final)-consent">([^<]*)<\/label>/g)].map((m) => m[1]);
  ok('fix6: exactly two consent labels are on the page (one per form)', consentLabels.length === 2);
  ok('fix6: EACH consent label equals CONSENT_TEXT verbatim',
    consentLabels.length === 2 && consentLabels.every((label) => label === core.CONSENT_TEXT));
  const jsConst = src.match(/var CONSENT_TEXT = "([^"]*)";/);
  ok('fix6: the posted JS CONSENT_TEXT constant equals the core text verbatim',
    !!jsConst && jsConst[1] === core.CONSENT_TEXT);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw942-'));
  const file = path.join(dir, 'waitlist.jsonl');
  const store = core.createWaitlistStore(file);
  const good = {
    email: 'Sofia.Check@Example.com ',
    phone: '+1 (720) 555-0101',
    consent: true,
    consentText: core.CONSENT_TEXT,
    source: 'test:tw942',
  };
  const first = store.add(good);
  ok('first synthetic signup is created', first.status === 'created');
  ok('created record normalizes the email', first.record.email === 'sofia.check@example.com');
  ok('created record normalizes the phone to digits with country code', first.record.phone === '+17205550101');
  ok('created record stores consent flag, text and version',
    first.record.consent === true && first.record.consentText === core.CONSENT_TEXT &&
    first.record.consentVersion === core.CONSENT_VERSION);
  ok('created record stores a timestamp', typeof first.record.createdAt === 'string' && !Number.isNaN(Date.parse(first.record.createdAt)));
  ok('count is one after the first signup', store.count() === 1);

  const dupe = store.add({ ...good, email: 'sofia.check@example.com', phone: '+1 720 555 0199' });
  ok('duplicate email is reported, not stored twice', dupe.status === 'duplicate' && store.count() === 1);

  ok('missing consent is rejected', store.add({ ...good, email: 'a@example.com', consent: false }).status === 'invalid');
  ok('mismatched consent text is rejected', store.add({ ...good, email: 'b@example.com', consentText: 'other text' }).status === 'invalid');
  ok('invalid email is rejected', store.add({ ...good, email: 'not-an-email' }).status === 'invalid');
  ok('invalid phone is rejected', store.add({ ...good, email: 'c@example.com', phone: '12' }).status === 'invalid');
  ok('rejections do not change the count', store.count() === 1);

  const reloaded = core.createWaitlistStore(file);
  ok('a fresh store over the same file sees the persisted signup (proof of storage)', reloaded.count() === 1 && reloaded.list()[0].email === 'sofia.check@example.com');

  const csv = core.toCsv(reloaded.list());
  ok('csv export has a header and the signup row',
    csv.startsWith('email,phone,consent,consent_version,consent_text,source,created_at') &&
    csv.includes('sofia.check@example.com,+17205550101,true,'));
  ok('csv export quotes the consent text safely', csv.includes('"' + core.CONSENT_TEXT.replace(/"/g, '""') + '"') || !core.CONSENT_TEXT.includes(','));
}

// --- Handler execution: shipped inline script against DOM stubs ---
{
  const scriptMatch = src.match(/<script is:inline>([\s\S]*?)<\/script>/);
  ok('inline script block found for execution test', !!scriptMatch);
  if (scriptMatch) {
    const status = { textContent: '', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
    const email = { value: '', focus() { this.focused = true; } };
    const phone = { value: '', focus() { this.focused = true; } };
    const consent = { checked: false, focus() { this.focused = true; } };
    const button = { disabled: false, textContent: 'Get launch news' };
    let submitHandler = null;
    const fakeForm = {
      addEventListener(name, fn) { if (name === 'submit') submitHandler = fn; },
      querySelector(sel) {
        if (sel.includes('email')) return email;
        if (sel.includes('tel')) return phone;
        if (sel.includes('checkbox')) return consent;
        if (sel.includes('form-status')) return status;
        if (sel.includes('button')) return button;
        return null;
      },
    };
    const fetchCalls = [];
    // Fix round 1 (Rosa must-fix 7): the stub response is switchable so
    // the handler's DUPLICATE branch is exercised, not only 'created'
    // (the original evidence claimed both; only created was covered).
    let stubResult = { status: 'created', count: 1 };
    let stubStatus = 201;
    const fakeWindow = {
      matchMedia: () => ({ matches: true }),
      location: {},
      fetch(url, opts) {
        fetchCalls.push({ url, opts });
        return Promise.resolve({
          ok: stubStatus >= 200 && stubStatus < 300, status: stubStatus,
          json: () => Promise.resolve(stubResult),
        });
      },
    };
    const fakeDocument = {
      querySelectorAll(sel) { return sel === '.waitlist-form' ? [fakeForm] : []; },
    };
    const run = new Function('window', 'document', 'fetch', scriptMatch[1]);
    run(fakeWindow, fakeDocument, fakeWindow.fetch);
    ok('submit handler registered', typeof submitHandler === 'function');
    if (submitHandler) {
      const event = { preventDefault() {} };
      email.value = 'not-an-email'; phone.value = '+1 720 555 0101'; consent.checked = true;
      await submitHandler(event);
      ok('invalid email is rejected inline with no fetch', status.attrs['data-state'] === 'error' && fetchCalls.length === 0);
      email.value = 'sofia.check@example.com'; phone.value = '12';
      await submitHandler(event);
      ok('invalid phone is rejected inline with no fetch', status.attrs['data-state'] === 'error' && fetchCalls.length === 0);
      phone.value = '+1 720 555 0101'; consent.checked = false;
      await submitHandler(event);
      ok('missing consent is rejected inline with no fetch', status.attrs['data-state'] === 'error' && fetchCalls.length === 0);
      consent.checked = true;
      await submitHandler(event);
      ok('valid signup posts json to the waitlist endpoint',
        fetchCalls.length === 1 && fetchCalls[0].url === '/api/waitlist' &&
        JSON.parse(fetchCalls[0].opts.body).email === 'sofia.check@example.com');
      ok('posted body carries phone and consent',
        JSON.parse(fetchCalls[0].opts.body).phone === '+1 720 555 0101' &&
        JSON.parse(fetchCalls[0].opts.body).consent === true);
      ok('created response is reported as stored', status.attrs['data-state'] === 'ok' && status.textContent.toLowerCase().includes('stored'));
      stubResult = { status: 'duplicate', count: 1 };
      stubStatus = 200;
      await submitHandler(event);
      ok('duplicate response branch is exercised over the handler',
        fetchCalls.length === 2 && status.attrs['data-state'] === 'ok' &&
        status.textContent.toLowerCase().includes('already on the launch list'));
    }
  }
}

console.log(`tw942-waitlist: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
