# TW-907 Evidence: Replica Scored Rebuild Loop Implant

Prepared by Twistor Holdings LLC

## What was implanted

- Upstream: https://github.com/albertirgi/replica
- Pinned commit: `e01e6a86a56ea276d3f18e73fc931d06fe538782`
  (verified with `git rev-parse HEAD` on the clone, 2026-11-03)
- License: MIT (`MIT License, Copyright (c) 2026 albertirgi`), read live
  from the cloned repo before implant. Full text vendored at
  `~/workspace/custom-skills/local-twistor-replica/LICENSE`.
- Vendor location (per the TW-850 unslop convention): the upstream
  `skills/replica` folder copied verbatim into
  `~/workspace/custom-skills/local-twistor-replica/upstream/`
  (SKILL.md, references, scripts, tests), plus upstream README and
  LICENSE. The `.github` demo assets (gif/mp4/png) were not vendored:
  binary bulk, not needed by the gate. Twistor wrapper skill:
  `~/workspace/custom-skills/local-twistor-replica/SKILL.md` +
  `skill.yaml`.

## FOSS / paid-API audit

- Upstream README, read live: "No API keys." Requirements: Node 20+,
  Playwright's Chromium (or an installed Google Chrome), ffmpeg only
  for video/GIF references.
- Grep of the vendored code and docs for paid-service names and
  API-key patterns (OpenAI, Anthropic, fal, Replicate, ElevenLabs,
  `api_key`) found no paid code path.
- Model used by the loop: none external. The measuring/scoring is
  deterministic local code (Playwright/Chromium 156.0.8078.4 per
  `replica.mjs doctor`, plus the vendored scoring libraries). The
  building agent is the Twistor stack's own agent (this run: Sofia).
  No paid vision model was wired in or needed.

## Wiring point (frontend gate)

Replica is a named step in Sofia's frontend gate, after Impeccable and
unslop, complementing rather than replacing them:

1. `~/workspace/custom-skills/local-twistor-frontend-engineer/SKILL.md`
   step 7 (TW-907): capture a reference, build from the measured
   blueprint, `compare` and iterate in report order until the level
   gate passes or remaining findings are reported plainly.
2. `~/workspace/custom-skills/local-twistor-replica/SKILL.md`: the
   wrapper skill documenting the loop, levels, hard rules, and the
   evidence rule for every run.
3. This repo: `scripts/replica-gate.mjs` wraps the vendored CLI's
   `compare`, prints the axis scores, and exits with replica's own
   exit code (0 pass, 1 not yet, 2 error). Proven live in round 3
   below. `.replica/` added to `.gitignore` per upstream convention;
   curated evidence is committed under `qa-replica/` instead.

## Real run (ADD MEANS USE proof)

- Target surface: twistor-website homepage hero, the `.hero` section
  of `src/pages/index.astro`, captured from the built site
  (`npm run build`, then served locally over HTTP).
  Why this surface: it is the brand-critical first screen of the
  corporate site, self-contained (headline, lede, two CTAs, no
  external data), and scoped capture is upstream's recommended mode
  (whole pages produce huge blueprints). Browser-first desktop
  1440x900 plus the mobile view at 390x844 were both captured and
  scored.
- Capture lesson recorded: capturing `dist/index.html` via `file://`
  silently lost the page CSS (Astro emits an absolute `/_astro/*.css`
  path), producing an unstyled blueprint (Times New Roman, 32px h1).
  The capture was discarded and redone over HTTP, giving the true
  blueprint: root 1032x394.8, Bricolage Grotesque 48/51.8, tokens
  `--bg #FAF7F2`, `--ink #1C1A17`, `--muted #5F5A54`,
  `--accent #FF5A1F`, `--accent-text #B5430E`, `--line #E5DFD5`.
  File-protocol captures of built Astro sites are not valid evidence.
- Rebuild: standalone clone built from the blueprint measurements in
  `qa-replica/tw907-home-hero/clone/index.html` (scratch, never over
  the production surface). Twistor's own copy and its own built
  Bricolage Grotesque woff2 are reused; no third-party assets.
- Level: `faithful` (gates: layout >= 95, style >= 95, pixels >= 85,
  motion >= 90). Motion axis: not scored, the hero is static and the
  capture recorded no motion (`--motion 0`); motion gating applies
  when a reference has motion to clone.

### Score history

| round | overall | layout | style | pixels | verdict |
|---|---|---|---|---|---|
| 1 | 88.9 | 97.1 | 100 | 69.6 (3.04% differ) | NOT YET |
| 2 | 100.0 | 100 | 100 | 100 (0.00% differ) | PASS |
| 3 (via `scripts/replica-gate.mjs`) | 100.0 | 100 | 100 | 100 (0.00% differ) | PASS, gate exit 0 |

- Round 1 top finding (report order): the span "does it all." sat
  14px too far right and 12px too wide. Root cause, found from the
  sheet: the clone's `@font-face` pointed at the reference server's
  origin (port 8931) from a page served on port 8932; web fonts are
  CORS-gated, so Chromium silently fell back to a wider system bold.
- Round 2 fix: bundle Twistor's own built woff2 inside the clone
  (same origin). One fix, +11.1 overall, all axes 100.
- Independent check: the final clone screenshot at 1440x900 is
  byte-identical to the reference screenshot (same sha256:
  `503ca13b7493d7b619ee6abb38a2a712026df15ad8cc4c41b1c69196b16cb7bb`).
  Same result at 390x844 (0.00% pixels differ).
- Accessibility note: the clone keeps the production hero's semantic
  structure (one `h1`, real links with the same hrefs and text), so
  the rebuild carries the surface's existing a11y properties; no new
  interactive elements were introduced.

### Artifacts (this folder)

- `evidence/blueprint.md`: the measured blueprint the clone was built from.
- `evidence/reference-1440x900.png`, `evidence/reference-390x844.png`:
  reference screenshots.
- `evidence/before-clone-*.png`, `evidence/before-sheet-*.png`:
  round 1 clone and reference|clone|diff sheets.
- `evidence/after-clone-*.png`, `evidence/after-sheet-*.png`:
  round 2 (final) clone and sheets.
- `evidence/round-1-report.md`, `evidence/round-2-report.md`,
  `evidence/round-3-gate-run-report.md`, matching `*-score.json`
  files, and `evidence/history.jsonl`: the full score history.
- `clone/index.html` + `clone/fonts/`: the rebuild itself.

## Known differences / limits

- The clone is a section-level rebuild of the hero only, by design
  (scoped capture). It is proof the loop runs in the real gate, not a
  replacement homepage.
- Upstream self-test (`upstream/scripts/test/selftest.mjs`): the
  doctor check reported `ready` (browser 156.0.8078.4, ffmpeg
  present). A full-log rerun of the self-test passed: "4 passed",
  exit 0. A first invocation exited 1, but that command's output was
  truncated by a `tail` pipe in the invoking command, so no failure
  detail survived to diagnose; the untruncated rerun is the recorded
  result. The TW-907 real run above is independent of the self-test
  fixtures either way.

## Status

REVIEW-READY. Not merged to main. Rosa review not dispatched by the
author; the coordinator dispatches it.
