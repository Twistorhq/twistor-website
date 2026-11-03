# TW-907 Score History: twistor-website homepage hero (.hero)

Prepared by Twistor Holdings LLC

Level `faithful` · viewports 1440x900 (desktop) and 390x844 (mobile)
· motion axis not scored (static hero, no motion recorded)

| round | overall | layout (>= 95) | style (>= 95) | pixels (>= 85) | verdict |
|---|---|---|---|---|---|
| 1 | 88.9 | 97.1 | 100 | 69.6 | NOT YET |
| 2 | 100.0 | 100 | 100 | 100 | PASS |
| 3 (gate wrapper run) | 100.0 | 100 | 100 | 100 | PASS |

Round 1 fix-next #1: span "does it all." 14px too far right, 12px too
wide (+2.5 layout). Root cause: cross-origin `@font-face` (fonts are
CORS-gated) silently fell back to a wider system bold. Fix: bundle
Twistor's own built Bricolage Grotesque woff2 inside the clone.
Round 2: 0.00% pixels differ at both viewports; the 1440x900 clone
screenshot is byte-identical to the reference (sha256
`503ca13b7493d7b619ee6abb38a2a712026df15ad8cc4c41b1c69196b16cb7bb`).

Machine-readable history: `evidence/history.jsonl`, per-round
`evidence/round-*-score.json` and reports.
