/* Prepared by Twistor Holdings LLC.
 * TW-448: unit tests for public/scripts/tv-overlays.js pure functions.
 * Run: node tests/tv-overlays.test.js (no dependencies)
 */
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'scripts', 'tv-overlays.js'), 'utf8');

// Minimal browser stubs — pure functions only; load() is tested separately.
const window = {};
const document = { createElement: () => ({}), head: { appendChild: () => {} } };
eval(src);

const t = window.TwistorTvOverlays._test;
let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name); }
}

// --- isValidLayer ---
ok('rejects null', !t.isValidLayer(null));
ok('rejects missing attribution', !t.isValidLayer({ id: 'permits', label: 'x', color: '#c2410c', sourceUrl: 'https://x', fetch() {} }));
ok('rejects missing sourceUrl', !t.isValidLayer({ id: 'permits', label: 'x', color: '#c2410c', attribution: 'y', fetch() {} }));
ok('rejects non-https sourceUrl', !t.isValidLayer({ id: 'permits', label: 'x', color: '#c2410c', attribution: 'y', sourceUrl: 'http://x', fetch() {} }));
ok('rejects javascript: sourceUrl', !t.isValidLayer({ id: 'permits', label: 'x', color: '#c2410c', attribution: 'y', sourceUrl: 'javascript:alert(1)', fetch() {} }));
ok('rejects non-hex color', !t.isValidLayer({ id: 'permits', label: 'x', color: 'red', attribution: 'y', sourceUrl: 'https://x', fetch() {} }));
ok('rejects short hex color', !t.isValidLayer({ id: 'permits', label: 'x', color: '#fff', attribution: 'y', sourceUrl: 'https://x', fetch() {} }));
ok('rejects css-injection color', !t.isValidLayer({ id: 'permits', label: 'x', color: '#c2410c;}body{x:', attribution: 'y', sourceUrl: 'https://x', fetch() {} }));
ok('accepts full valid layer', t.isValidLayer({ id: 'permits', label: 'Building permits', color: '#c2410c', attribution: 'Denver Open Data Catalog', sourceUrl: 'https://denvergov.org/opendata', fetch() {} }));

// --- normalizePin ---
const layer = { id: 'permits', label: 'Building permits', isSample: false };
ok('normalizes pin', t.normalizePin({ lat: '39.7', lng: -104.9, label: 'HVAC' }, layer).lat === 39.7);
ok('rejects NaN lat', t.normalizePin({ lat: 'abc', lng: -104.9 }, layer) === null);
ok('rejects missing lng', t.normalizePin({ lat: 39.7 }, layer) === null);
ok('defaults label to layer label', t.normalizePin({ lat: 39.7, lng: -104.9 }, layer).label === 'Building permits');
ok('preserves isSample flag', t.normalizePin({ lat: 39.7, lng: -104.9 }, { ...layer, isSample: true }).isSample === true);

// --- formatAsOf ---
ok('empty on null', t.formatAsOf(null) === '');
ok('empty on garbage', t.formatAsOf('not-a-date') === '');
ok('formats ISO', t.formatAsOf('2026-10-12T20:00:00Z').length > 0);

// --- stubLayers ---
const stubs = t.stubLayers();
ok('two stub layers', stubs.length === 2);
ok('stub ids permits+weather', stubs[0].id === 'permits' && stubs[1].id === 'weather');
ok('stubs flagged sample', stubs.every(s => s.isSample === true));
ok('stub colors are 6-digit hex', stubs.every(s => /^#[0-9a-fA-F]{6}$/.test(s.color)));

(async () => {
  for (const s of stubs) {
    const r = await s.fetch();
    ok(`stub ${s.id} pins labeled Sample:`, r.pins.length > 0 && r.pins.every(p => p.label.indexOf('Sample:') === 0));
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
