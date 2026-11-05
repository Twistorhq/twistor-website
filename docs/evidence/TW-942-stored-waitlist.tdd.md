<!-- Prepared by Twistor Holdings LLC -->
# TW-942: Twistor Social stored waitlist, evidence

**Branch:** `sofia/tw-942-waitlist` in the twistor-website repo, off
`main` @ `922e8e63a096614dba2b40c56f811d6f4276e0b5` (the merge that
landed TW-737 / TW-907). Built by Sofia Reyes. Not merged, not
deployed, no DNS touched, nothing external sent. Rosa review is the
next step, then Justynn's separate TW-737 deploy words.

## What changed

The TW-737 landing page (`src/pages/social/index.astro`) converted
through a mailto hand-off that stored nothing (stored count: zero).
TW-942 replaces it with a real stored waitlist:

- **Form (both hero and final panel):** email (required), phone
  (required, `type="tel"`), and a required consent checkbox whose
  label is the full consent text. The submit handler
  (`TW942_STORED_HANDLER`) validates all three inline in the existing
  `aria-live` status region, then POSTs JSON to `/api/waitlist`.
  Created and duplicate responses are reported in plain words
  ("stored" / "already on the list"); a failed save says nothing was
  stored and offers the holla@twistor.co address. The mailto link
  remains only as the noscript fallback.
- **Consent, shown and recorded:** the exact text on the page is the
  single source string in `src/lib/waitlist/waitlist-core.mjs`
  (`CONSENT_TEXT`, version `tw942-v1`); a contract test asserts the
  page contains it verbatim, and every stored record carries the
  flag, the full text, and the version. A signup whose consent text
  does not match is rejected server-side.
- **Storage:** append-only JSON Lines, one record per line (email,
  phone, consent flag/text/version, source form id, ISO timestamp),
  at `WAITLIST_DATA_FILE` or `./data/waitlist.jsonl` relative to the
  server process. The file lives outside the built site (never under
  `dist/` or `public/`) and `data/` is gitignored, so no signup data
  is published or committed.
- **Duplicates:** email is the unique key, normalized (trimmed,
  lowercased). A repeat email returns `duplicate` (HTTP 200) and is
  not stored twice; a first signup returns `created` (HTTP 201).
- **Export / admin query (the measurable seeding count):**
  `node scripts/export-waitlist.mjs --count` prints the count;
  the same script writes CSV (header plus quoted consent text) to
  stdout or `--out file`. The server also exposes
  `GET /api/waitlist/count` and `GET /api/waitlist/export.csv`,
  gated by `WAITLIST_ADMIN_TOKEN` when set (production must set it).
  This count is the number the Dec 15-30 seeding push measures
  against the 500 onboarded accounts target.

## Minimal backend piece, flagged for Rosa

This repo is a static Astro site with no backend; that is why
TW-737 shipped a mailto. The minimal piece in the same JS stack:

- `src/lib/waitlist/waitlist-core.mjs`: validation, normalization,
  store, CSV. Zero dependencies.
- `server/waitlist-server.mjs`: a zero-dependency `node:http` server
  answering `POST /api/waitlist` plus the two admin GETs.

**Deploy blocker, stated plainly:** the static build alone cannot
answer `/api/waitlist`. At deploy time (Justynn's separate TW-737
words, no deploy in this ticket) the host must run this Node server
next to the static site on social.twistor.co, or port these two
files behind any host that can answer the same routes. If Rosa or
Dre prefer the store behind the lbt-os backend instead, the core
module is the contract to port; nothing in the page depends on more
than the POST route and its three response states.

## Claims caveat (TW-736) honored

No copy claims changed beyond the form notes. Verification is still
described only as mission and design, being built, never as live.
The new form note and consent text both repeat that joining is not
an account and is not verification. The rewards positioning on the
page today is untouched; no new claims were invented.

## Verification receipts

**RED (before the build):** `node tests/tw942-waitlist.test.mjs`
failed 16 checks (no stored handler, no phone, no consent, no core,
no server, no export) and crashed on the missing fetch call.

**GREEN:**

```
$ node tests/tw942-waitlist.test.mjs
tw942-waitlist: 43 passed, 0 failed   (exit 0)

$ node tests/tw737-social-page.test.cjs
tw737-social-page: 59 passed, 0 failed   (exit 0)
```

The TW-737 suite went from 63 to 59 checks on purpose: the six
checks that drove the deleted mailto handler were replaced by two
TW-942 pointer checks, with the supersession commented in the file.
Full handler execution (stub DOM, validation, consent gate, fetch
POST, stored/duplicate responses) plus the real on-disk store
(create, persist across a fresh store instance, duplicate,
rejections, CSV) are covered by the 43 TW-942 checks.

**Live server proof (local only, synthetic data only:**
`sofia.check@example.com`, a 555 phone number):

```
POST /api/waitlist  -> 201 {"status":"created","count":1}
POST same email     -> 200 {"status":"duplicate","count":1}
GET  /count, no token (token set) -> 401
GET  /count, with token           -> 200 {"count":1}
GET  /export.csv, with token      -> header + the one stored row
node scripts/export-waitlist.mjs --count  -> 1
node scripts/export-waitlist.mjs --out export.csv -> wrote 1 row(s)
```

The stored JSONL line carries the normalized email and phone, the
consent flag, the full consent text, version `tw942-v1`, the source,
and the timestamp.

**Build and gates:**

```
$ npm run build
Astryx scope guard: OK, marketing routes Astryx-free, boundary intact.
[build] 12 page(s) built, /social/index.html generated.   exit 0

$ npx impeccable detect dist/social/index.html
(no findings)   exit 0

$ npm test        (repo overlays suites)   exit 0
$ npm run test:waitlist   (new script: TW-942 + TW-737 suites)   exit 0
```

**Manual 15-tell audit on the changed surface:** no gradients, no
pill badges, no glassmorphism added, no card nesting added, no
decorative animation added; the new fields reuse the page's existing
input, button, and note styles (Mofongo palette, 8px radius, 48px
touch targets, 24px consent checkbox). Unslop pass on the form
block: labels sentence case, spacing on the existing 8/12/16 grid,
one button style, no new typefaces or colors. Findings: none kept
open. Replica loop: not applicable, this build matches no external
reference; it extends the TW-737 page in its own system.

**Accessibility checks:** both forms keep labeled inputs (label
`for` matches input `id` for email and phone, enforced by tests),
the consent checkbox has its text as its label, all fields are in
the tab order with the existing gold focus ring, status feedback
stays in `aria-live="polite"` regions, and the layout is mobile
first (Social exception) with fields stacked full width at 390px
and the desktop layer unchanged above 48rem. Screenshots:
`docs/evidence/tw942/mobile-form.png` (390px) and
`docs/evidence/tw942/desktop-form.png` (1440px).

**Style gate:** no Python files were authored or edited, so the
ruff gate has no files to run on; stated plainly rather than
claimed. All new JS passes `node --check` (core, server, export
script, both test files).

## Fix round 1 (Rosa REQUEST CHANGES on 3a74b84)

Rosa's verdict was proven live by her, and she was right on all
seven must-fixes. Each was taken RED-first with a probe in the new
suite `tests/tw942-server.test.mjs` (HTTP-level, real server,
ephemeral port, temp store, synthetic data only), written before
the fixes: the RED run failed 11 named checks and the harness then
died on the oversized-body probe because the old server destroyed
the socket, which was itself one of the bugs.

1. **Admin gate fail-open (BLOCKER): closed.** `isAdmin` no longer
   returns true when `WAITLIST_ADMIN_TOKEN` is unset. With no token
   configured the admin routes refuse with 503 (`disabled`, audited);
   a wrong token is 401; the right token is 200. The unauthenticated
   export attempt from Rosa's probe now returns no PII (suite
   scenario B asserts the seeded email is absent from the body).
   Public signup still works with the token unset.
2. **Malformed store line (BLOCKER): closed.** `list()` in
   waitlist-core.mjs parses line by line, skips and counts
   unparseable lines (`store.badLineCount()`), so count/list/add all
   survive a torn write. `add()` also starts a new record on its own
   line when the file's last line is torn, so the new signup is not
   glued onto the fragment and lost. On the HTTP side the whole
   handler and the POST end-handler are wrapped: a store error
   returns 500 JSON, never process death (suite scenario C asserts
   count 200, POST 201, and the child process still alive).
3. **Timing-safe compare (MAJOR): closed.** The token check uses
   `crypto.timingSafeEqual` over UTF-8 buffers with an explicit
   length guard first.
4. **Audit trail (MAJOR, TW-801 gate): closed via the audit-event
   route.** Every admin read and every failed or disabled auth
   attempt appends one JSON line to `<store>.audit.jsonl` (override:
   `WAITLIST_AUDIT_FILE`): timestamp, route, outcome
   (ok/denied/disabled), signup count for count reads, row count for
   exports. Never the PII itself; the suite asserts the stored email
   and phone digits do not appear anywhere in the audit log. Audit
   append failures are logged to stderr and never fail the request.
5. **CSV formula injection (MAJOR): closed.** `csvCell` prefixes an
   apostrophe when a cell (after stripping leading tab/CR, which
   spreadsheets drop) leads with `=`, `+`, `-`, or `@`, per OWASP.
   One documented exception: a sign followed by digits only (a
   stored phone like +17205550101) is a plain number, not a formula
   expression, and stays dialable in the seeding export. Suite
   covers `=`, `+2+5`, `-2+5`, `@`, tab-led, and CR-led payloads via
   both the core export and the CLI export script.
6. **Consent single-source as mechanism (MAJOR): closed.** The
   TW-942 suite now asserts EACH of the two visible checkbox labels
   equals the core `CONSENT_TEXT` verbatim (exact case), and that
   the page JS `CONSENT_TEXT` constant posted with the signup also
   equals it verbatim. Label drift fails the suite.
7. **Server automated tests (MAJOR): closed.** New suite
   `tests/tw942-server.test.mjs` (37 checks) spawns the real server
   and covers the 401 gate (no token, wrong token, right token),
   the unset-token fail-closed case, HTTP duplicate behavior,
   malformed JSON (400), oversized body, the truncated-line case
   over HTTP, the audit assertions, and the CSV cases. Wired into
   `npm run test:waitlist`. Correction to the round-0 evidence
   above: it claimed handler "stored/duplicate responses" were
   covered; the DOM stub only ever returned `created`. The stub is
   now switchable and the duplicate branch is genuinely exercised
   in `tests/tw942-waitlist.test.mjs`.

Nits taken in the same round: oversized body now gets a real 413
response (the handler drains and answers instead of destroying the
socket); count and export responses carry `Cache-Control: no-store`;
the join-panel CSS tel selector is panel-scoped again. The rate
limit / whole-file re-read nit is left for the deploy ticket, as
Rosa scoped it.

**Fix-round rerun (all green):**

```
$ node tests/tw942-waitlist.test.mjs   -> 47 passed, 0 failed
$ node tests/tw942-server.test.mjs     -> 37 passed, 0 failed
$ node tests/tw737-social-page.test.cjs -> 59 passed, 0 failed
$ npm test                             -> pass (repo overlay suites)
$ npm run test:waitlist                -> 47 + 37 + 59, all pass
$ node --check on core, server, export script, both TW-942 suites -> clean
```

CLI probe against a store holding one good row, a torn trailing
line, and a formula-leading source: `--count` prints 1 and the CSV
export shows the source neutralized as `'=2+5` with the phone
number intact. Build not re-run in this round: this worktree has
no node_modules (the same limitation Rosa recorded on round 0);
the only page change is the one-selector CSS scoping fix, covered
by the contract suites. No Python authored, ruff N/A as before.
Not merged, not pushed, not deployed.

Prepared by Twistor Holdings LLC
