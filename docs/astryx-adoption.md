# Astryx adoption guide (TW-150)

**Prepared by Twistor Holdings LLC**

Owner: Sofia Reyes, Frontend Engineer · 2026-09-21
Decision: Justynn approved **adopt with caveats** 2026-09-21 (TW-150 item 5,
sub-ticket TW-143; evaluation in `docs/evaluations/astryx-tw-140.md`, Rosa APPROVE).
Rollout branch: `rollout/tw-150-astryx`. **Do not merge without Justynn's exact approval.**

## The rule

Astryx is adopted **for interactive surfaces only** — dashboards, dispatch
boards, internal tools. **The marketing site never touches Astryx**: no Astryx
code, tokens, or imports on any marketing route. Ever.

| Kind | Routes | Astryx? |
|---|---|---|
| Marketing | `src/pages/index.astro`, `src/pages/products/**` | **NEVER** — zero Astryx, zero React islands |
| Interactive surfaces | `src/pages/surfaces/**` | Yes, through `src/components/ui` |
| Evaluation sandbox | `src/pages/demo/**` (noindex, unlinked) | Yes (TW-140 pilot, grandfathered) |

Enforced by `npm run guard` (`scripts/check-astryx-scope.mjs`): marketing
pages fail the build check if they mention `astryx`, import `ui/`, or mount a
React island; Astryx JS imports are confined to `src/components/ui/**` (plus
the grandfathered eval pilot); Astryx CSS may only load on
`surfaces/`/`demo/` routes, which must stay `noindex`.

## Dependency manifest (pinned)

| Package | Version | Why |
|---|---|---|
| `@astryxdesign/core` | `0.6.2` (exact, no caret) | Component library |
| `@astryxdesign/theme-neutral` | `0.6.2` (exact, no caret) | Theme CSS |
| `@stylexjs/stylex` | `^0.19.1` | Astryx's styling engine (peer) |
| `react`, `react-dom` | `^19.3.0` | Astryx requires React ≥ 19 |
| `@astrojs/react` | `^4.4.2` | Island integration (surfaces only) |

Pre-1.0: expect API churn. Upgrades are deliberate, never `npm update` drive-bys.

## Theming

Twistor brand = 9 CSS custom-property overrides in
`src/styles/astryx-twistor-tokens.css`, scoped to
`[data-astryx-theme="neutral"].twistor-brand` — no fork, no component wrapping.
Dark mode rides the theme's built-in `light-dark()`. Import order per route:
`reset.css` → `theme.css` → `astryx-twistor-tokens.css`.

Contrast under Twistor tokens (computed, light mode): accent `#2563eb` on
white **5.17:1**, ink `#0f172a` 17.85:1, muted `#475569` 7.58:1 — all pass WCAG
AA for normal text. Warning badge fill `#ffce2f` with `#111111` text:
**12.7:1**. Vendor posture: 51 dedicated a11y spec files in the published
package (Playwright/Chromium axe runs, keyboard-navigation specs, public
known-failure lists with WCAG 2.2 references) — best-in-class for an
open-source system.

## The wrapper boundary (`src/components/ui`)

Interactive surfaces import **only** from `src/components/ui` — never from
`@astryxdesign/core` directly. Each wrapper owns a small Twistor-named prop API
(`TwButton`, `TwCard`, `StatusBadge`, `PriorityBadge`, `SearchInput`,
`FilterSelect`, `NoticeBanner`) and delegates rendering to Astryx today.

Why: this is the seam that makes the exit cheap. Call sites speak Twistor
vocabulary (`status="urgent"`, not `variant="error"`); the Astryx dependency
lives in exactly one directory.

## Swizzle exit strategy (Meta governance risk)

Caveat 7 of the evaluation names the risk plainly: Astryx is pre-1.0 **and**
Meta-owned — the roadmap answers to a corporate maintainer, not a community.
A deprecation, pivot, or re-license could strand adopters. The explicit exit
strategy is **swizzle**: Astryx's CLI ejects any component's source into our
own tree, so if the library ever goes sideways we keep the components we
depend on, fully owned, with zero runtime dependency on Meta's release
cadence.

Rip-out procedure, in order:

1. **Inventory** — every Astryx touchpoint is enumerable: `grep -r
   '@astryxdesign' src/` returns only `src/components/ui/**`,
   `src/components/AstryxPilot.tsx` (eval artifact, deletable),
   `src/styles/astryx-twistor-tokens.css`, and the CSS imports in
   `src/pages/surfaces/**` + `src/pages/demo/**`. `npm run guard` codifies
   this list as assertions.
2. **Swizzle or reimplement the boundary** — for each `ui/` module, either run
   the Astryx CLI's swizzle to eject the owned component source into
   `src/components/ui/`, or hand-roll a replacement. The exported prop types
   in `src/components/ui/index.ts` **do not change**, so zero call sites are
   touched.
3. **Drop the dependency** — remove `@astryxdesign/core`,
   `@astryxdesign/theme-neutral`, `@stylexjs/stylex` from `package.json`;
   delete `src/styles/astryx-twistor-tokens.css` and the CSS imports on
   surface routes; move the brand tokens into our own stylesheet if surfaces
   keep the look.
4. **React decision** — if no interactive surface needs React anymore, remove
   `@astrojs/react`; otherwise keep it (it was ours, not Astryx's).
5. **Marketing site** — untouched throughout. It never imported Astryx, so it
   keeps building and shipping while surfaces are reworked.

Blast radius on this branch: 8 `ui/` modules + 1 token CSS + 2 surface/demo
routes + the eval pilot. Estimated effort: **under a day** for a surface this
size, because the boundary already exists. The estimate grows with each new
surface that skips the boundary — which is why the guard exists.

## Caveats (carried from the evaluation — all still apply)

1. **Justynn's exact approval required** before anything merges or goes live.
2. Versions pinned; budget for pre-1.0 API churn (0.6.2 today).
3. Charts are canary-only (`@canary` dist-tag) — Maya's dashboard charting
   needs a separate decision; do not adopt the canary charts package.
4. React ≥ 19 is a hard peer requirement — locks our React major version.
5. Demo/pilot forms submit nowhere; the dispatch board runs on fictional
   sample data. Production surfaces need Dre's API contracts first — **TW-152**
   (dispatch-board jobs contract) is open and assigned to Dre Coleman.
6. Rollback of the evaluation: delete the branch; `main` is untouched.
7. Meta governance risk — see swizzle exit strategy above.

## First adopted surface: dispatch board

Route: `/surfaces/dispatch-board` (`src/pages/surfaces/dispatch-board.astro`,
noindex, unlinked). Renders six fictional jobs as cards with status/priority
badges, live search + status filter, and per-job status advancement — all
through the `ui/` boundary, all client-side state, zero network I/O.

## Verification log (this rollout run)

- `npm run guard` — **passes**: marketing routes Astryx-free, boundary intact.
- `npm run build` — **passes**: 8/8 pages built, including `/surfaces/dispatch-board`.
- Built-HTML checks: both interactive routes carry `noindex`; dispatch board
  has exactly 2 `<label>` elements ("Search jobs", "Status"), each with `for`
  matching a real control id, zero empty labels; the status filter renders as
  `<button role="combobox" aria-haspopup="listbox" aria-expanded="false">`;
  job cards use `<article aria-labelledby>` + `<h3>` + `<dl>` for metadata; the
  filter-result count sits in `role="status"`; marketing homepage ships zero
  Astryx/React script references.
- Bundle: dispatch-board page client JS ≈ 471 kB raw / ~137 kB gzip
  (5 kB board + 205 kB React runtime + 250 kB lazy TextInput chunk) —
  consistent with the evaluation's ~147 kB figure; cost stays quarantined to
  interactive routes via Astro islands.
- Keyboard/contrast: structural a11y verified from SSR HTML + vendor a11y
  suites; Twistor-token contrasts computed above (all AA). One caveat: the
  status filter's combobox `aria-controls` references a listbox that the
  vendor Selector renders only on interaction — it is absent from the SSR
  HTML, so interactive-listbox behavior could not be verified without a live
  browser.
- **Limitation (honest):** no live-browser run was available to this agent
  (no browser control in this environment) — no screenshots, no manual
  keyboard walkthrough. Same limitation was logged and accepted in TW-140.

## Open items

- **TW-152** — Dre: dispatch-board jobs API contract (nothing goes live without it).
- **Maya's charts** — separate decision needed; Astryx charts are canary-only.
- Future surfaces must go through `src/components/ui` — the guard enforces it.
