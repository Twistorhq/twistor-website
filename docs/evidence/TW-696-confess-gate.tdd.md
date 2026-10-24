# TW-696 evidence: Confess pre-push gate, implanted and live-fired

Prepared by Twistor Holdings LLC

## Assignment

Implant yesterdayfuture/confess (Diego's 2026-10-23 sweep, score 73,
MIT) into one real Twistor repo's workflow and prove it firing on a real
AI-marked commit. ADD MEANS USE (TW-274): a shelved build is not done.

## License verification (live, 2026-10-24)

Fetched `LICENSE` from
`raw.githubusercontent.com/yesterdayfuture/confess/main` before adopting
any code: MIT License, Copyright (c) 2026 Confess Contributors. Full text
vendored at `tools/confess/LICENSE`.

## Target repo and isolation

- Repo: Twistorhq/twistor-website (public storefront; the DevEx lane).
- Checkout: fresh clone at `~/workspace/worktrees/jalen-tw696-website`,
  branch `jalen/tw-696-confess-gate` off origin/main `68ed13e`.
- A clone, not a shared worktree, on purpose: hook installation writes
  checkout-local state (`.git/config` core.hooksPath). A clone keeps
  that state physically separate from the fleet's shared checkouts, so
  the gate cannot bleed into another agent's lane. Branch isolation and
  the Rosa review flow are unchanged.

## What shipped on the branch

| File | What |
|---|---|
| `.githooks/pre-push` | Upstream hook, byte-identical (sha256 `d98638230a34d156e36d4885ef4feffbf381ca5987e6e84db526959fce090dba`) |
| `tools/confess/enable.sh` | One-command opt-in: sets `core.hooksPath=.githooks` for the local checkout only |
| `tools/confess/LICENSE` | Upstream MIT license |
| `docs/confess-gate.md` | What the gate is, how to enable, skip path, honest limits |
| `README.md` | New Contributing section pointing at the gate doc |
| `CONFESSIONS.md` | The live log the gate itself wrote during this proof |

Upstream provenance: yesterdayfuture/confess at commit
`cb98b885c5a4c6e77b24fe03e21c3d4cedb007c8`. Upstream's own test suite run
before vendoring: 13 passed.

## Before / after

- BEFORE: `git ls-tree origin/main` shows no `.githooks` entry. Zero
  comprehension trace existed for AI-marked pushes; nothing paused, and
  nothing was recorded.
- AFTER: gate vendored and enabled in the proof checkout; four push
  behaviors exercised live against origin (transcripts below).

## Live fire transcript (2026-10-24, all against origin)

Push 1, wiring commit `58033c4`, NO AI marker, gate enabled:
exit 0, no banner, no pause. Selectivity proven: marker-free work is
never touched, so the Rosa flow and normal pushes are unaffected.

Push 2, README commit `a9e011f` carrying
`Co-Authored-By: Claude <noreply@anthropic.com>`:
exit 1, push refused. Output:

```text
==============================================================
  CONFESS  —  AI-assisted code detected
==============================================================
  Commits: a9e011fa
  Files:   README.md
  Answer three questions before this push proceeds.

✓ Confession recorded in CONFESSIONS.md (staged).
```

The three answers were written by the pusher (via a scripted `$EDITOR`
holding the pusher's own words, the non-interactive equivalent of typing
them) and recorded under SHA prefix `a9e011fa78fa` in `CONFESSIONS.md`.

Push 3, confession commit `00fcd4d` plus the recorded README commit:
exit 0, no banner, no prompts. The recorded SHA is never blocked twice.

Push 4, docs commit `384d764` carrying the same AI trailer, with
`CONFESS_SKIP=1` and a stated reason: exit 0, push proceeded, and a
`**SKIPPED**: <reason>` entry was written to `CONFESSIONS.md` for
`384d7646eedd`. The hotfix path works and is on record.

Push 5, skip-record commit `65dcae0`: exit 0, silent.

## Rollout recommendation

1. Merge this branch after Rosa's review (Justynn's word per merge, as
   always). The gate is opt-in per checkout, so merging changes nothing
   for anyone until they run the enable script.
2. Fleet rollout, one repo at a time on separate tickets: vendor the
   same three files, run the enable script in each active checkout.
   lbt-os next, then twistor-data-portal and twistor-core.
3. Trailer discipline is the real adoption lever: the gate only sees
   commits that carry AI markers. Recommend Marcus makes the
   `Co-Authored-By` trailer standard on agent commits fleet-wide; until
   then the gate is a habit enforcer, not a guarantee (stated plainly in
   `docs/confess-gate.md`).
4. Rosa's checklist add-on: for any PR whose commits carry AI markers,
   confirm `CONFESSIONS.md` carries an entry (or a recorded skip) for
   each marked SHA. That closes the loop between the local gate and the
   merge gate.
5. The optional MCP server was NOT wired: the pre-push gate covers the
   trust story at $0 and zero dependencies. Revisit only if agents need
   to record confessions mid-task rather than at push time.

## Cost and risk

$0, FOSS only, no dependencies, no network calls from the hook. Risk is
limited to pusher friction on marked commits, with an auditable skip
for hotfixes. Nothing in this branch touches site code, dependencies,
or CI configuration.
