<!-- Prepared by Twistor Holdings LLC -->

# TW-448 — real-overlay swap prep: TDD evidence

Branch: `sofia/tw-448-real-overlays` (base `sofia/tw-415-impeccable`, untouched).
Ticket: TW-448 (surge TW-470). Builder: Sofia Reyes. Date: 2026-10-12/13.

## RED → GREEN

**RED (caught by tests, fixed before review):** stub layers reported
`live: true` from `useLayer()`, which would have flipped the page into
"Live public data" mode while showing sample pins. Fixed: `live` now means
`ok && !layer.isSample`. The e2e stub-path test asserts `anyLive === false`.

## Commands → results (all run 2026-10-13, node v24)

| Command | Result |
|---|---|
| `node --check public/scripts/tv-overlays.js` | OK |
| `node --check` on extracted inline script from `src/pages/index.astro` | OK |
| `node tests/tv-overlays.test.cjs` | 23 passed, 0 failed |
| `node tests/tv-overlays-fallback.test.cjs` | 4/4 suites pass (stub-only, mixed, missing-asOf, NaN pins) |
| `npx astro build` | 6 pages built, complete |
| `grep` built `dist/index.html` | toggles, legend, attrib, live panel, loader script ref all present; `dist/scripts/tv-overlays.js` copied |
| `impeccable detect .` (v4.0.0, bundle via proxy) | 1 finding: `public/vendor/leaflet/leaflet.css` overused-font — pre-existing (base commit 5e89523), third-party, kept on purpose. Zero findings in new/modified files. |

## Contrast (WCAG, computed)

- `#c2410c` (permits) vs white `#fff`: **5.18:1** ✓
- `#155e63` (weather) vs white `#fff`: **7.46:1** ✓
- Pin labels render white over layer colors (`--tv-pin-fg`).

## What the fallback tests prove

1. **Stub-only path:** no `tv-overlays-real.js` → both layers sample-labeled, `anyLive=false`, page shows honest sample copy.
2. **Mixed path:** good real permits layer → live with attribution + as-of; throwing real weather layer → per-layer stub fallback; invalid extra layer → dropped; page `anyLive=true`.
3. **Missing asOf:** real layer without `asOf` → treated as failed → stub (attribution+as-of are mandatory).
4. **Bad pins:** NaN/missing coordinates dropped; valid pins kept; layer stays live.

## Em-dash count (user-visible copy, nit 10 follow-up)

4 usages: "Sample data — fictional shops" (tag), "Live public data — Denver metro" (tag), and one each in the two lede variants. All in short labels/sentences, none in saturation. Builder's earlier "two" undercounted; corrected here.

## Outstanding (not this diff)

- Dre's TW-446 real modules at `public/scripts/tv-overlays-real.js` — the seam is documented in `docs/tv-overlay-contract.md`; zero page changes needed when they land.
- Website merge itself remains held on Justynn's call (package.json conflict with accessibility-demo draft).
