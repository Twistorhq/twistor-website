# Astryx design-system evaluation (TW-140)

**Prepared by Twistor Holdings LLC**
Evaluator: Sofia Reyes, Frontend Engineer · 2026-09-21
Candidate: [facebook/astryx](https://github.com/facebook/astryx) — Meta's open-source design system (Diego Ramos 9/21 sweep, score 82)
Pilot branch: `sofia/tw-140-astryx` (twistor-website) — demo route `/demo/astryx-pilot`, not linked from any live page, `noindex`

## License verdict: PASS

- MIT License, Copyright (c) 2026 Meta Platforms, Inc. — read directly from the
  `LICENSE` file of a `--depth 1` clone at `~/workspace/vendor-eval/astryx`.
- Matches GitHub's stated license. Published npm packages (`@astryxdesign/core`,
  `@astryxdesign/theme-neutral`) also declare `MIT`. Commercial-clean; no patent
  carve-outs, no usage restrictions.

## What the pilot does

Installed `@astryxdesign/core@0.6.2`, `@astryxdesign/theme-neutral@0.6.2`,
`@stylexjs/stylex`, `react@^19`, `react-dom@^19`, `@astrojs/react@^4` on the
branch (33 packages, ~40s install, zero issues). Rendered a representative set
— **buttons** (primary/secondary/tertiary/disabled), **form inputs**
(TextInput, TextArea, Selector with labels/descriptions/required states),
**cards** (three real Twistor product cards), **navigation** (Breadcrumbs) —
plus a Banner for form feedback, all under Twistor brand tokens. `npm run build`
passes; page server-renders (Astro SSR) with client hydration.

## Component coverage vs Twistor needs

- **110 component source dirs** in `packages/core/src` (AlertDialog, AppShell,
  Button, Card, Chat, Dialog, DateInput, FormLayout, Selector, TopNav, Switch,
  Tabs, Breadcrumbs, Banner, Avatar, EmptyState, CommandPalette, etc.) — covers
  everything Twistor's product surfaces need: marketing CTAs, lead-capture
  forms, dispatch boards, dashboards, settings pages.
- API ergonomics are good: `TextInput` **requires** a `label` prop (always
  rendered), `Button` takes `label`/`clickAction`/`variant`/`isLoading`/`href`,
  `Selector` takes plain string options. Stable `astryx-*` class names + data
  attributes as the documented styling surface.
- **Gap: charts.** `@astryxdesign/charts` and `@astryxdesign/vega` are published
  only under the `@canary` dist-tag — no stable release. Maya's dashboards
  would need a separate charting decision. `lab` (experimental) is not published.
- **Version risk:** 0.6.2, pre-1.0. They document deprecation windows (e.g.
  class aliases removed at 0.7.0), but expect API churn. Pin versions.

## Accessibility posture: best-in-class for an open-source system

- **51 dedicated a11y spec files** in core — per-component Playwright/Chromium
  specs (axe runs), keyboard-navigation specs, and `*.a11y.known-failures.ts`
  files that record remaining gaps as runnable debt with WCAG 2.2 references
  (e.g. a Checkbox `aria-readonly` gap, a Dialog focus-timing edge). Debt is
  public and precise, not hidden.
- Pilot build evidence (from SSR HTML): `<label for>` correctly wired to
  `<input id>`, `aria-required="true"` from `isRequired`,
  `aria-describedby` linking helper text, `focus-visible` outlines in the
  component styles.
- Contrast under Twistor tokens (computed): accent #2563eb on white **5.17:1**,
  white on accent 5.17:1, ink #0f172a 17.85:1, muted #475569 7.58:1 — all pass
  WCAG AA for normal text.

## Bundle cost (measured)

Demo page client JS from `astro build`:
- AstryxPilot island (components actually used): **282.8 kB / 81.6 kB gzip**
- React 19 shared runtime chunk: **210.4 kB / 65.9 kB gzip**
- **Total ≈ 493 kB raw / ~147 kB gzip** for the demo page only.

Notes: ESM + `sideEffects` declarations mean tree-shaking works (unused
components don't ship). The npm tarball is 21 MB unpacked but that's the full
dist — irrelevant at runtime. Astro islands scope the React cost to pages that
use it; other twistor-website pages ship zero React.

## Theming effort: ~15 minutes, no fork

Twistor branding = a **9-token CSS custom-property override** scoped to
`[data-astryx-theme="neutral"].twistor-brand` (accent, text, backgrounds,
fonts, radius). Verified in the built CSS: our selector wins over the theme's
by specificity — no component wrapping, no fork, no build plugin. Dark mode is
built in via `light-dark()`. A designer can re-theme without touching component
source, exactly as advertised.

## Agent-fit (relevant to how Twistor builds)

- CLI (`@astryxdesign/cli`) with component docs, scaffolding, codemods, theme
  builder; `swizzle` ejects component source into your project to own.
- MCP server confirmed — served from the docsite (`apps/docsite/src/app/mcp/`);
  it's a docs/component-metadata server so AI assistants build from the same
  reference as people. Aligns with Twistor's agent-built workflow.

## Recommendation: ADOPT WITH CAVEATS

**Adopt Astryx as the shared UI base for Twistor's interactive product
surfaces** (dashboards, dispatch boards, internal tools — anything React).
**Do not put it on the static marketing site** — twistor-website stays
hand-rolled Astro; ~147 kB gzip of React runtime is not justified for content
pages, and the pilot proves the island model keeps the cost quarantined.

Caveats before any production use:
1. **Justynn's exact approval required** — this is an evaluation, not an
   integration. Nothing here is production.
2. Pin versions; budget for pre-1.0 API churn (0.6.2 today).
3. Charts are canary-only — Maya's dashboard charting needs a separate call.
4. React ≥19 becomes a hard peer requirement — locks our React major version.
5. The demo form's "submit" goes nowhere: a real lead-capture API contract
   belongs to Dre and does not exist yet — ticket it before any production form.
6. If rejected: delete the branch; `git checkout main` leaves the site
   untouched (only new files + config on the branch; `dist/` is gitignored).
7. **Meta governance risk** — Astryx is pre-1.0 AND Meta-owned, so the
   roadmap answers to a corporate maintainer, not a community. A
   deprecation, pivot, or re-license could strand adopters on a dead-end
   component set; budget for it before any adopt decision. The explicit
   exit strategy is `swizzle`: Astryx's CLI ejects any component's source
   into our own tree, so if the library ever goes sideways we keep the
   components we depend on, fully owned, with zero runtime dependency on
   Meta's release cadence.

## Workarounds / limitations (honest log)

- No live-browser testing available to this run: no screenshots, no manual
  keyboard walkthrough. Structural a11y verified from SSR HTML + source
  inspection of the a11y suites instead.
- Installed the published npm packages rather than building from the 540 MB
  monorepo — consumer-path install, which is the documented integration.
- `example-vite` requires Node 22+/pnpm 11; our site built fine on the
  existing toolchain with plain npm.
