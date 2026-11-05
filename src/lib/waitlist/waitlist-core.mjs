// Prepared by Twistor Holdings LLC.
// TW-942: stored waitlist core for the Twistor Social landing page.
// Zero dependencies. Storage is an append-only JSON Lines file that
// lives OUTSIDE the built site (never under dist/ or public/), so no
// signup data is ever published with the static pages. One record per
// line: email, phone, consent flag, the exact consent text shown,
// consent version, source form, and an ISO timestamp.
//
// FOR ROSA / DEPLOY (flagged, not gold-plated): this file plus
// server/waitlist-server.mjs is the minimal backend piece. The Astro
// site in this repo is static, so at deploy time the host must run the
// small Node server (or port these two files behind any host that can
// answer POST /api/waitlist). No deploy happens in TW-942.

import fs from 'node:fs';
import path from 'node:path';

export const CONSENT_VERSION = 'tw942-v1';
export const CONSENT_TEXT =
  'I agree that Twistor may contact me by email and by phone (call or text) at the email and phone number I provide, with Twistor Social launch news. Message and data rates may apply. Joining this list is not an account and it is not verification.';

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizePhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return (raw.startsWith('+') ? '+' : '') + digits;
}

export function validateSignup(input) {
  const errors = [];
  const email = normalizeEmail(input && input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
  const phone = normalizePhone(input && input.phone);
  const phoneDigits = phone.replace(/[^\d]/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) errors.push('phone');
  if (!input || input.consent !== true) errors.push('consent');
  if (!input || input.consentText !== CONSENT_TEXT) errors.push('consentText');
  return { errors, email, phone };
}

export function createWaitlistStore(filePath) {
  function list() {
    if (!fs.existsSync(filePath)) return [];
    return fs
      .readFileSync(filePath, 'utf8')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  }
  function count() {
    return list().length;
  }
  function add(input) {
    const { errors, email, phone } = validateSignup(input);
    if (errors.length) return { status: 'invalid', errors };
    const existing = list().find((record) => record.email === email);
    if (existing) return { status: 'duplicate', record: existing };
    const record = {
      email,
      phone,
      consent: true,
      consentText: CONSENT_TEXT,
      consentVersion: CONSENT_VERSION,
      source: String((input && input.source) || 'social-landing').slice(0, 64),
      createdAt: new Date().toISOString(),
    };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf8');
    return { status: 'created', record };
  }
  return { add, list, count, filePath };
}

function csvCell(value) {
  const text = String(value == null ? '' : value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export function toCsv(records) {
  const header = 'email,phone,consent,consent_version,consent_text,source,created_at';
  const rows = records.map((r) =>
    [r.email, r.phone, r.consent, r.consentVersion, r.consentText, r.source, r.createdAt]
      .map(csvCell)
      .join(','),
  );
  return [header, ...rows].join('\n') + '\n';
}

export function defaultDataFile() {
  return process.env.WAITLIST_DATA_FILE || path.join(process.cwd(), 'data', 'waitlist.jsonl');
}
