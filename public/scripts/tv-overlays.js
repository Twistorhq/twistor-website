/* Prepared by Twistor Holdings LLC.
 *
 * Mini Trade View — public overlay loader (TW-448, consumes TW-446).
 *
 * Contract: docs/tv-overlay-contract.md
 *
 * Tries to load the real TW-446 overlay modules from
 * /scripts/tv-overlays-real.js (window.TwistorTvOverlaysReal). Any layer that
 * is missing, invalid, times out, or errors falls back — per layer — to
 * clearly-labeled sample pins. One bad layer never breaks the map.
 *
 * Framework-agnostic vanilla JS. No dependencies.
 */
(function () {
  'use strict';

  var REAL_SRC = '/scripts/tv-overlays-real.js';
  var LAYER_TIMEOUT_MS = 8000;

  // ---- stub layers (sample data, always labeled) ---------------------------
  // Used when the real TW-446 modules are not present or a layer fails.
  // Every stub pin carries isSample=true and a "Sample:" label prefix.
  function stubLayers() {
    return [
      {
        id: 'permits',
        label: 'Building permits',
        color: '#c2410c',
        attribution: 'Sample data',
        sourceUrl: '',
        isSample: true,
        fetch: function () {
          return Promise.resolve({
            pins: [
              { lat: 39.7362, lng: -104.9847, label: 'Sample: HVAC rough-in', kind: 'permit' },
              { lat: 39.7294, lng: -104.8319, label: 'Sample: water heater replace', kind: 'permit' },
              { lat: 39.7661, lng: -105.0772, label: 'Sample: furnace install', kind: 'permit' }
            ],
            asOf: null
          });
        }
      },
      {
        id: 'weather',
        label: 'Weather alerts',
        color: '#155e63',
        attribution: 'Sample data',
        sourceUrl: '',
        isSample: true,
        fetch: function () {
          return Promise.resolve({
            pins: [
              { lat: 39.7047, lng: -105.0814, label: 'Sample: heat advisory', kind: 'alert' },
              { lat: 39.6132, lng: -104.8827, label: 'Sample: storm watch', kind: 'alert' }
            ],
            asOf: null
          });
        }
      }
    ];
  }

  // ---- validation -----------------------------------------------------------
  function isValidLayer(l) {
    return !!(l && typeof l.id === 'string' && l.id &&
      typeof l.label === 'string' && l.label &&
      typeof l.attribution === 'string' && l.attribution &&
      typeof l.sourceUrl === 'string' && l.sourceUrl &&
      typeof l.fetch === 'function' &&
      typeof l.color === 'string' && l.color);
  }

  function normalizePin(p, layer) {
    var lat = Number(p.lat), lng = Number(p.lng);
    if (!isFinite(lat) || !isFinite(lng)) return null;
    return {
      lat: lat,
      lng: lng,
      label: String(p.label || layer.label),
      kind: String(p.kind || layer.id),
      detail: p.detail ? String(p.detail) : '',
      isSample: !!layer.isSample
    };
  }

  function formatAsOf(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  // ---- real module loading --------------------------------------------------
  function loadRealModule() {
    return new Promise(function (resolve) {
      // Already loaded (e.g. LBT-OS embeds it directly).
      if (window.TwistorTvOverlaysReal) { resolve(window.TwistorTvOverlaysReal); return; }
      var s = document.createElement('script');
      var done = false;
      function finish(mod) { if (!done) { done = true; resolve(mod || null); } }
      s.src = REAL_SRC;
      s.async = true;
      s.onload = function () { finish(window.TwistorTvOverlaysReal || null); };
      s.onerror = function () { finish(null); };
      // If the CDN/file 404s slowly, don't hang the map: 4s cap on load.
      setTimeout(function () { finish(window.TwistorTvOverlaysReal || null); }, 4000);
      document.head.appendChild(s);
    });
  }

  function fetchWithTimeout(layer, bounds) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) { settled = true; resolve({ ok: false, reason: 'timeout' }); }
      }, LAYER_TIMEOUT_MS);
      try {
        Promise.resolve(layer.fetch(bounds)).then(
          function (res) {
            if (settled) return; settled = true; clearTimeout(timer);
            resolve({ ok: true, res: res });
          },
          function (err) {
            if (settled) return; settled = true; clearTimeout(timer);
            resolve({ ok: false, reason: String((err && err.message) || err) });
          }
        );
      } catch (err) {
        if (!settled) { settled = true; clearTimeout(timer); resolve({ ok: false, reason: String((err && err.message) || err) }); }
      }
    });
  }

  function useLayer(layer, bounds) {
    return fetchWithTimeout(layer, bounds).then(function (out) {
      var pins = [];
      var asOf = null;
      var ok = false;
      if (out.ok && out.res && Array.isArray(out.res.pins)) {
        pins = out.res.pins.map(function (p) { return normalizePin(p, layer); })
          .filter(function (p) { return p !== null; });
        asOf = out.res.asOf || null;
        // Attribution + asOf are mandatory for real layers.
        ok = layer.isSample || (!!layer.attribution && !!asOf);
      }
      if (!ok) return { layer: layer, pins: [], asOf: null, live: false };
      // live means REAL data: stub layers succeed but are never "live".
      return { layer: layer, pins: pins, asOf: asOf, live: !layer.isSample };
    });
  }

  // ---- public API ------------------------------------------------------------
  // load(bounds) -> Promise<{ layers: [{ id, label, color, attribution,
  //   sourceUrl, isSample, live, pins, asOf, asOfLabel }] , anyLive: bool }>
  // bounds: { north, south, east, west }. Never rejects.
  function load(bounds) {
    var stubs = stubLayers();
    var stubById = {};
    stubs.forEach(function (s) { stubById[s.id] = s; });

    return loadRealModule().then(function (real) {
      var candidates = [];
      if (real && real.version === 1 && Array.isArray(real.layers)) {
        real.layers.forEach(function (l) {
          if (isValidLayer(l)) { l.isSample = false; candidates.push(l); }
        });
      }
      // Ensure both expected layers exist; fill gaps with stubs.
      ['permits', 'weather'].forEach(function (id) {
        var found = candidates.some(function (c) { return c.id === id; });
        if (!found) candidates.push(stubById[id]);
      });

      var jobs = candidates.map(function (layer) {
        return useLayer(layer, bounds).then(function (r) {
          // Per-layer fallback: real failed -> stub for that layer only.
          if (!r.live && !layer.isSample && stubById[layer.id]) {
            return useLayer(stubById[layer.id], bounds);
          }
          return r;
        });
      });

      return Promise.all(jobs).then(function (results) {
        var layers = results.map(function (r) {
          return {
            id: r.layer.id,
            label: r.layer.label,
            color: r.layer.color,
            attribution: r.layer.attribution,
            sourceUrl: r.layer.sourceUrl,
            isSample: !!r.layer.isSample || !r.live,
            live: r.live,
            pins: r.pins,
            asOf: r.asOf,
            asOfLabel: formatAsOf(r.asOf)
          };
        });
        return {
          layers: layers,
          anyLive: layers.some(function (l) { return l.live; })
        };
      });
    });
  }

  window.TwistorTvOverlays = {
    load: load,
    // exposed for unit tests (node): pure functions only
    _test: { isValidLayer: isValidLayer, normalizePin: normalizePin, formatAsOf: formatAsOf, stubLayers: stubLayers }
  };
})();
