# Impeccable 15-Tell Audit — twistor-website

**Date:** 2026-10-13 · **Auditor:** Sofia Reyes · **Ticket:** TW-479
**Scope:** `src/` on `main` at `8711c7c` (post TW-444/TW-448, post base-path fixes)
**Method:** automated detector (`impeccable detect .`) + manual file-and-line
pass over all 15 tells. This is the paper trail missing from the TW-444 build.

**Prepared by Twistor Holdings LLC**

## Automated detector

```
1 anti-pattern found (vendored code — see below)
2 advisories (internal pages — see Tell 13)
```

The single anti-pattern is `public/vendor/leaflet/leaflet.css:275`
(`overused-font`: Helvetica Neue) — **third-party vendored code**, not a
Twistor tell. Zero anti-patterns in Twistor-authored code.

## Manual audit — the 15 tells

### 1. Purple/blue gradients — CLEAN
Zero `gradient` matches in `src/`. No linear/radial gradients anywhere.

### 2. Overused font stacks — CLEAN (kept on purpose)
Marketing routes use two stacks: `system-ui, -apple-system, 'Segoe UI',
sans-serif` (body) and `'Bricolage Grotesque', system-ui, sans-serif`
(display). Bricolage Grotesque is a distinctive display face — not Inter,
Roboto, or Space Grotesk. The detector's only font hit is the vendored
Leaflet CSS above. Kept on purpose: Bricolage is the brand's display voice.

### 3. Gradient text — CLEAN
Zero `background-clip` matches in `src/`.

### 4. Pill badges — CLEAN on marketing (kept on purpose elsewhere)
- Marketing routes: zero pill badges. `.sample-tag` / `.live-tag`
  (`src/pages/index.astro`) use `border-radius: 6px` — rectangular tags.
- `border-radius: 999px` appears twice in `index.astro`, both functional:
  - Line 241 (`.tv-legend .tv-dot`): 12px legend dot — a circle, not a badge.
  - Line 249 (`:global(.tv-pin)`): Leaflet map-pin labels — map markers.
- Functional status pills exist **only** on the internal dispatch-board
  surface (`src/components/ui/StatusBadge.tsx:18-27` — "Job-status pill"):
  urgent/en-route/on-site are meaningful dispatch states, not decorative
  marketing pills. That surface is noindex and unlinked. Kept on purpose.

### 5. Decorative glassmorphism — CLEAN
Zero `backdrop-filter` matches in `src/`.

### 6. Icon-in-rounded-square — CLEAN
Zero SVG/icon-image usage in pages. The logo is text (`Twistor.`).

### 7. Identical card grids — KEPT ON PURPOSE (documented)
`src/pages/index.astro` (~lines 358–368): one featured card + four product
cards in `.grid`. The structure is uniform, but: (a) the featured card breaks
the pattern (larger, first, distinct treatment); (b) every card carries real,
differentiated copy — distinct taglines, blurbs, and pricing links per
product; (c) it is a product index, not feature-slop. A grid of distinct
products is the honest pattern here.
`src/pages/surfaces/dispatch-board.astro` (~line 55, `.board-grid`): renders
data-driven job cards — each card is different job data. Functional, not
decorative.

### 8. Cards-in-cards — CLEAN
`.leak-card` contains layout sections (inputs/results), not nested cards.
`.tv-side` panels are siblings in `.tv-grid`, not nested.

### 9. Decorative side stripes — CLEAN
`.leak-results { border-left: 1px solid var(--line); }`
(`src/pages/index.astro` ~line 200) is a functional divider between the
calculator inputs and results — it becomes a top border on mobile. Not
decorative.

### 10. Context-free hero stats — CLEAN
No stats in the hero. The leak calculator's figures ship with full
methodology disclosure (`<details class="leak-math">` with the equation:
`leak / month = missed calls / week × 4.33 × avg job value × close rate`).

### 11. Fake numbered sequences — CLEAN
No decorative 01/02/03 sequences anywhere.

### 12. Decorative animation — CLEAN
Zero `@keyframes` in `src/`. The only motion is the leak calculator's 450ms
count-up easing number transitions (functional), and it respects
`prefers-reduced-motion` (`src/pages/index.astro` ~line 620: reduced-motion
users get instant values).

### 13. Generic copy / em-dash saturation — CLEAN (advisories documented)
Copy is specific throughout: "Thirty minutes, your numbers, our math.",
"$1,500 setup + $500/mo", real integration names (ServiceTitan, Housecall
Pro, Jobber), real product blurbs. Em-dashes on marketing routes:
`src/pages/index.astro` has 10 across 713 lines — below the detector's
density threshold (no advisory fired); all are legitimate prose, not cadence
filler.
The detector's 2 advisories are on internal noindex pages, all instances in
code comments, `<title>` tags, or banner labels — not marketing body copy:
- `src/pages/demo/astryx-pilot.astro` (lines 2, 18, 48, 55–56, 63)
- `src/pages/surfaces/dispatch-board.astro` (lines 2, 8, 23, 69, 78, 84)
Kept on purpose: legitimate punctuation in non-marketing contexts.

### 14. Default beige/cream — KEPT ON PURPOSE (documented)
`--bg: #FAF7F2` is the deliberate warm-bone base of the TW-417 trades-rugged
palette, deployed as a full token system (`--ink: #1C1A17`,
`--accent: #FF5A1F`, `--line: #E5DFD5`) — not a lazy default. It is the
brand's bone, shared with the social-template kit.

### 15. Violet — CLEAN
Zero matches for violet/purple/indigo across `src/` and `public/`
(TW-417). The palette is bone/concrete/safety-orange/ink only.

## Polish pass (static)

Per the polish reference, a full rendered pass needs screenshots this
environment can't produce — that pass is queued, not faked. Static pass
completed:
- Merged duplicate `@media (max-width: 720px)` blocks in
  `src/pages/index.astro` (~lines 252–259) into one.
- Re-ran detector after the edit: same result (1 vendored anti-pattern,
  2 internal advisories) — no regressions.

## Verdict

**11 clean, 4 kept-on-purpose with reasons above, 0 fixes required.**
The site carries no AI-design tells on any marketing route. The automated
detector agrees (0 anti-patterns in Twistor code).
