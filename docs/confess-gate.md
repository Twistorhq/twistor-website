# The Confess gate: a pre-push comprehension check for AI-assisted work

Prepared by Twistor Holdings LLC

## What this is

This repo carries a local Git pre-push gate called Confess. When a commit
about to be pushed carries an AI co-author marker in its message (for
example `Co-Authored-By: Claude`, Copilot, Cursor, Codex, or Aider, or a
`Generated-By:` / `Generated-With:` trailer), the push pauses until the
person pushing answers three questions in their own words:

1. What does this code do?
2. If this breaks in production tomorrow, what is the most likely cause?
3. How would you verify it is correct in under 5 minutes?

The answers are appended to `CONFESSIONS.md` at the repo root and staged.
Commit that file, push again, and the push proceeds: the recorded commit
SHA is never blocked twice. Commits without an AI marker are never paused.
The gate is a human comprehension trace, not a code review. Rosa's review
still gates every merge, exactly as before.

## Why Twistor runs it

Twistor ships AI-assisted work every day. The trust story we sell is
audited AI: a named human can explain every AI-assisted change, how it
most likely breaks, and how to check it fast. Confess turns that claim
into a habit with an artifact. `CONFESSIONS.md` is the evidence file:
every AI-marked push carries its explanation with it, and every
deliberate skip is recorded too.

## Provenance and license

- Upstream: https://github.com/yesterdayfuture/confess (v0.1)
- Vendored at upstream commit `cb98b885c5a4c6e77b24fe03e21c3d4cedb007c8`
- License: MIT, verified live from the upstream LICENSE file on
  2026-10-24. The full text is at `tools/confess/LICENSE`.
- The hook at `.githooks/pre-push` is byte-identical to upstream
  `confess/data/pre-push` (sha256
  `d98638230a34d156e36d4885ef4feffbf381ca5987e6e84db526959fce090dba`).
- Pure Python standard library. No runtime dependencies, no network
  calls, no LLM. It never amends history and never scores answers.

## Enable it (per checkout)

Git hooks are not cloned, so each checkout opts in once:

```bash
sh tools/confess/enable.sh
# or by hand:
git config core.hooksPath .githooks
```

Requirements: Git and Python 3.9 or newer. Set `$EDITOR` before pushing
an AI-marked commit; the hook opens it once per question.

Disable for a checkout with `git config --unset core.hooksPath`.

## The skip path (hotfixes)

```bash
CONFESS_SKIP=1 CONFESS_SKIP_REASON="hotfix: restore checkout page" git push
```

The push proceeds immediately and a `SKIPPED` entry with your reason is
written to `CONFESSIONS.md`. Skips are first-class and auditable by
design: a skip you cannot see is a gate you cannot trust.

## Honest limits

- Detection reads commit messages only. Strip the trailer and the gate
  stays silent. That is a deliberate upstream choice, and it makes
  trailer discipline a team habit, not a technical guarantee.
- The gate proves a human paused and explained. It does not prove the
  explanation is right. Rosa's review and CI still carry that weight.
- `CONFESSIONS.md` is append-only by convention. Do not edit past
  entries; corrections go in as new entries.

## Live proof (TW-696, 2026-10-24)

Wired and fired in this repo on branch `jalen/tw-696-confess-gate`:

- Push of a marker-free commit: silent pass, no pause (selectivity).
- Push of a `Co-Authored-By: Claude` commit: blocked, three answers
  recorded to `CONFESSIONS.md`, push held until the confession was
  committed.
- Re-push after committing the confession: passed with no second pause
  (the recorded SHA is never blocked twice).

Full transcript: `docs/evidence/TW-696-confess-gate.tdd.md`.
