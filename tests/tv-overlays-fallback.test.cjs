/* Prepared by Twistor Holdings LLC.
 * TW-448: fallback-path tests for public/scripts/tv-overlays.js load().
 * Covers: stub-only path (no real module), mixed path (one good real layer
 * + one failing real layer + one invalid layer), per-layer isolation.
 * Run: node tests/tv-overlays-fallback.test.js (no dependencies)
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'scripts', 'tv-overlays.js'), 'utf8');

function freshDom({ scriptFails = true, realModule = null } = {}) {
  const window = {};
  if (realModule) window.TwistorTvOverlaysReal = realModule;
  const document = {
    createElement: () => {
      const el = {};
      // simulate async 404
      setTimeout(() => el.onerror && el.onerror(), 5);
      return el;
    },
    head: { appendChild: () => {} }
  };
  return { window, document };
}

function loadWith(dom) {
  const fn = new Function('window', 'document', src + '\nreturn window.TwistorTvOverlays;');
  return fn(dom.window, dom.document);
}

(async () => {
  // --- 1. stub-only path: no real module on the page ---
  {
    const dom = freshDom();
    const api = loadWith(dom);
    const data = await api.load({ north: 40, south: 39, east: -104, west: -105 });
    assert.strictEqual(data.layers.length, 2, 'two layers');
    assert.strictEqual(data.anyLive, false, 'anyLive false with stubs only');
    assert.ok(data.layers.every(l => l.isSample), 'all layers sample');
    assert.ok(data.layers.every(l => l.live === false), 'no layer reports live');
    assert.ok(data.layers.every(l => l.pins.length > 0), 'stub pins present');
    assert.ok(data.layers.every(l => l.pins.every(p => p.label.startsWith('Sample:'))), 'stub labels prefixed');
    console.log('PASS: stub-only path (no real module -> all sample, anyLive=false)');
  }

  // --- 2. mixed path: good permits, throwing weather, invalid extra layer ---
  {
    const realModule = {
      version: 1,
      layers: [
        {
          id: 'permits', label: 'Building permits', color: '#c2410c',
          attribution: 'Denver Open Data Catalog', sourceUrl: 'https://denvergov.org/opendata',
          fetch: async () => ({
            pins: [{ lat: 39.73, lng: -104.99, label: 'HVAC rough-in #1234', kind: 'permit' }],
            asOf: '2026-10-12T20:00:00Z'
          })
        },
        {
          id: 'weather', label: 'Weather alerts', color: '#155e63',
          attribution: 'National Weather Service', sourceUrl: 'https://api.weather.gov',
          fetch: async () => { throw new Error('NWS 503'); }
        },
        { id: 'bogus', label: '', color: '', fetch: 'not-a-function' }
      ]
    };
    const dom = freshDom({ realModule });
    const api = loadWith(dom);
    const data = await api.load({ north: 40, south: 39, east: -104, west: -105 });
    const byId = {};
    data.layers.forEach(l => { byId[l.id] = l; });
    assert.strictEqual(data.layers.length, 2, 'invalid + extra layers dropped, still 2');
    assert.strictEqual(byId.permits.live, true, 'permits live');
    assert.strictEqual(byId.permits.isSample, false, 'permits not sample');
    assert.strictEqual(byId.permits.pins[0].label, 'HVAC rough-in #1234', 'real pin label kept');
    assert.ok(byId.permits.asOfLabel.length > 0, 'asOf formatted');
    assert.strictEqual(byId.permits.attribution, 'Denver Open Data Catalog');
    assert.strictEqual(byId.weather.live, false, 'failed weather not live');
    assert.strictEqual(byId.weather.isSample, true, 'failed weather fell back to stub');
    assert.ok(byId.weather.pins.every(p => p.label.startsWith('Sample:')), 'stub fallback labels');
    assert.strictEqual(data.anyLive, true, 'anyLive true when one layer live');
    console.log('PASS: mixed path (per-layer isolation, invalid dropped, failing -> stub)');
  }

  // --- 3. real layer missing asOf -> treated as failed -> stub ---
  {
    const realModule = {
      version: 1,
      layers: [{
        id: 'permits', label: 'Building permits', color: '#c2410c',
        attribution: 'Denver Open Data Catalog', sourceUrl: 'https://denvergov.org/opendata',
        fetch: async () => ({ pins: [{ lat: 39.73, lng: -104.99, label: 'x' }], asOf: null })
      }]
    };
    const dom = freshDom({ realModule });
    const api = loadWith(dom);
    const data = await api.load({ north: 40, south: 39, east: -104, west: -105 });
    const permits = data.layers.find(l => l.id === 'permits');
    assert.strictEqual(permits.live, false, 'missing asOf -> not live');
    assert.strictEqual(permits.isSample, true, 'missing asOf -> stub fallback');
    console.log('PASS: missing asOf treated as failed layer');
  }

  // --- 4. NaN-coordinate pins dropped, good pins kept ---
  {
    const realModule = {
      version: 1,
      layers: [{
        id: 'permits', label: 'Building permits', color: '#c2410c',
        attribution: 'Denver Open Data Catalog', sourceUrl: 'https://denvergov.org/opendata',
        fetch: async () => ({
          pins: [
            { lat: 39.73, lng: -104.99, label: 'good' },
            { lat: 'abc', lng: -104.99, label: 'bad lat' },
            { lat: 39.73, label: 'missing lng' }
          ],
          asOf: '2026-10-12T20:00:00Z'
        })
      }]
    };
    const dom = freshDom({ realModule });
    const api = loadWith(dom);
    const data = await api.load({ north: 40, south: 39, east: -104, west: -105 });
    const permits = data.layers.find(l => l.id === 'permits');
    assert.strictEqual(permits.pins.length, 1, 'only valid pin kept');
    assert.strictEqual(permits.pins[0].label, 'good');
    assert.strictEqual(permits.live, true, 'layer still live with 1 pin');
    console.log('PASS: invalid pins dropped, valid pins kept');
  }

  console.log('\nAll fallback-path tests passed.');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
