<!-- Prepared by Twistor Holdings LLC -->

# Mini Trade View — public overlay contract (TW-446 → TW-448)

The website's mini Trade View teaser consumes the TW-446 public-data overlay
modules through this contract. The modules are framework-agnostic vanilla JS so
both the Astro site and LBT-OS can use them.

## Drop point

Dre's TW-446 build provides **`public/scripts/tv-overlays-real.js`**.
When that file exists, the teaser uses real public data with zero page changes.
When it is missing (or any layer fails), the teaser degrades per-layer to
clearly-labeled sample pins — never a broken map.

## Module interface

`public/scripts/tv-overlays-real.js` must set:

```js
window.TwistorTvOverlaysReal = {
  version: 1,
  layers: [ /* one entry per overlay, see below */ ]
};
```

Each layer entry:

```js
{
  id: 'permits',                    // stable id: 'permits' | 'weather'
  label: 'Building permits',        // legend + toggle label (plain text)
  color: '#c2410c',                 // pin accent, trades palette (no violet)
  attribution: 'Denver Open Data Catalog',  // REQUIRED source attribution
  sourceUrl: 'https://…',           // REQUIRED link to the public source
  fetch: async function (bounds) {  // bounds: {north,south,east,west}
    return {
      pins: [                       // may be [] — empty is a valid state
        { lat: 39.73, lng: -104.99, label: 'HVAC rough-in', kind: 'permit', detail: '…' }
      ],
      asOf: '2026-10-12T20:00:00Z'  // REQUIRED ISO timestamp of the source data
    };
  }
}
```

## Rules the consumer enforces

- **Attribution + "as of" are mandatory.** A layer without them is treated as
  failed and falls back to sample.
- **Per-layer isolation.** One layer failing never blocks the other
  (self-healing: `Promise.allSettled`, 8s timeout per layer via AbortController).
- **CORS-friendly sources only.** The fetch runs browser-direct; NWS
  (`api.weather.gov`) and Denver's Socrata endpoint qualify. No API keys.
- **Honest labeling.** Real layers render with their attribution and "as of"
  time. Sample fallback pins are always labeled "Sample".
- **Teaser scope.** The page renders pins + toggles + legend only. No dossiers,
  no extra layers UI, no data connect. The CTA still routes to the live
  `/app/tradeview`.

## Current state (TW-448 prep)

`tv-overlays-real.js` does not exist yet (Dre leads TW-446 as of TW-470).
`public/scripts/tv-overlays.js` ships a stub implementing this exact interface
with labeled sample pins, so the swap is wired, tested, and demoable today.
Dropping in the real file activates live data with no page edits.
