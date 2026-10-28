<!-- Prepared by Twistor Holdings LLC -->
# TW-737: social.twistor.co landing page, evidence

**Branch:** `sofia/tw-737-social-landing` in the twistor-website repo, off
`origin/main` @ `1c84234`. Built by Sofia Reyes. Not merged, not deployed,
no DNS touched. Rosa review is the next step, then Justynn's words.

## Deliverable

- `src/pages/social/index.astro`: the Twistor Social landing page,
  mobile first (the Social only exception), desktop layer complete.
  It builds to `dist/social/index.html`; at go live it is served as the
  root of the `social.twistor.co` subdomain (steps at the bottom).
- `tests/tw737-social-page.test.cjs`: contract tests, RED first.
- `docs/evidence/tw737/`: screenshots (mobile hero, desktop hero,
  desktop hero tall, mobile tall with reduced motion forced).

## Intake (vendored landing page design, Part A)

- **One offer:** launch news for Twistor Social.
- **One audience:** people who want real plans with real people,
  starting in Denver.
- **One primary action:** join the launch list (email).
- **Layout:** A, classic hero plus sections. The product needs a short
  argument, not a bare form: hero, tagline reveal (B11), problem, how
  it will work, the door (safety as design), why it is different, FAQ,
  final join panel. Same form and same action in the hero and the
  final panel; no competing CTA anywhere.
- **Hero copy:** headline "Your people are out there. Go meet them in
  person." Sub: "Twistor Social is the real social app we are building
  in Denver: groups first, meetups in real rooms, and identity checked
  at the door by design." The descriptive line stays descriptive,
  never the product name (trademark rule). Product name everywhere:
  Twistor Social.
- **SEO:** indexable teaser with canonical `https://social.twistor.co/`,
  full OG and Twitter tags, meta description. FAQ is written in plain
  question and answer form for AEO.

## Claims caveats applied (TW-736 legal register)

Read before building: `twistor-lab/legal/tw-654-legal-caveats-callout.md`.
On the page, verification is described only as the mission and the
design, in development, never as live or operating today. The door
section carries a plain status box: verification is being built and
tested, it is not live today, joining the list does not verify you and
does not create an account. That "not an account, not verification"
line sits under both forms and in the FAQ. No launch date is promised
anywhere (the FAQ answers the launch question with exactly that). Door
Pass appears once, in the FAQ, named a separate idea still at the
concept stage. No biometric claim of any kind. No invented stats,
testimonials, customers, or metrics; the hero visual is a sample
meetup panel labeled as a sample, with fictional names labeled
fictional, following the trades preview pattern on this site.

## Design system and precedence calls

Composed before building per the design intelligence lane:
`compose_design_system` on this brief returned style Warm Community,
palette Mofongo (`#141210 #1E1A16 #8A5A2B #C9A24B #E2572B #F5F2EA
#A8A29A`), typography Fraunces / Inter. The page uses the Mofongo
hexes exactly (near black ground, bone text, safety orange accent,
gold for step headings and focus). Precedence calls, brand board and
this repo's house system over the vendored and knowledge base rules,
each documented rather than silently resolved:

1. **Typeface.** Bricolage Grotesque headings plus system body, the
   stack of every marketing page in this repo, instead of the
   composed Fraunces / Inter. Inter is also banned by the vendored
   skill B1. `check_spec` flags this as one warning (uncurated
   typeface), kept on purpose for subdomain to parent site
   consistency and zero new font payload.
2. **No gradient text.** Vendored B5 asks for gradient hero text; the
   brand board bans it (same call as TW-728 on the data portal). The
   second headline line is solid accent `#E2572B` instead.
3. **Tagline reveal start state.** B11 wants words starting at 25 to
   35 percent opacity. The Impeccable HTML scan measured that start
   state at 1.9:1 contrast. Words now start at 0.55 opacity in the
   full ink color and activate one at a time in reading order via
   IntersectionObserver, which preserves the B11 mechanic and clears
   AA. Under `prefers-reduced-motion` the words render fully on.
4. **Button padding.** B2 says 8px by 12px; the buttons and inputs
   here are 12px by 24px with a 48px minimum height, because touch
   targets are an accessibility hard gate on a mobile first page.
   Radius is 8px per B3, spacing values come from the B2 table, type
   sizes snap to the B1 scale steps (16, 18, 20, 24, 30, 36, 48, 60).

`check_spec` result on the final spec (palette mofongo, the six hexes
above, contrast pairs below): **PASSES: True**, one warning (the
typeface call in item 1). Contrast ratios, computed by the package:
bone on near black 16.7, muted on near black 7.39, gold on near black
7.79, near black on accent 5.01, bone on surface 15.46, muted on
surface 6.83, accent on near black 5.01. Minimum 5.01, all AA.

## Waitlist capture: what it actually does today

There is no form backend or list service anywhere in this repo; every
existing page converts through a mailto CTA. The form is therefore a
clearly marked local handler (`TW737_LOCAL_HANDLER` comment in the
shipped script):

- Client side validation only (required, email shape), with an inline
  error in an `aria-live` region: "Enter a valid email address so we
  can reach you."
- On a valid address it hands off through the site mailto pattern:
  it opens the visitor's email app with a note to `holla@twistor.co`,
  subject "Twistor Social launch news", body carrying their address
  and the not an account, not verification line. Sending that note is
  what puts them on the launch list.
- The page itself collects nothing, stores nothing, and sends nothing
  to any server or third party, and the copy under both forms says so
  in plain words. A noscript fallback prints the direct mailto link.
- Honest limit: if a visitor has no mail client configured, the hand
  off cannot complete; the fallback address is printed on the page.
  A real form backend is a separate ticket if Justynn wants one.

## Verification receipts

**RED (before the page existed):**

```
$ node tests/tw737-social-page.test.cjs
FAIL: page file exists
tw737-social-page: 0 passed, 1 failed   (exit 1)
```

**GREEN (final):**

```
$ node tests/tw737-social-page.test.cjs
tw737-social-page: 52 passed, 0 failed   (exit 0)
```

The 52 checks cover: document standard line in the footer, zero
em-dashes, banned filler words absent, title and canonical and OG,
semantic landmarks and exactly one h1, skip link, focus visible,
reduced motion, desktop media query, every claims caveat string,
forbidden live claims absent, Door Pass caveat proximity, form
contract (local handler marker, no external form action, labeled
required email input, aria-live status), section structure, and the
marketing boundary (no Astryx, no React island). The last block
executes the shipped inline script against DOM stubs, the stub
pattern this repo already uses for its overlays tests: an invalid
address is rejected inline with no navigation; a valid address sets
the honest status text and navigates to a `mailto:holla@twistor.co`
URL carrying the encoded address.

**Build:**

```
$ npm run build        (Astryx scope guard, then astro build)
Astryx scope guard: OK, marketing routes Astryx-free, boundary intact.
[build] 12 page(s) built, /social/index.html generated.   exit 0
```

(One backgrounded build run reported a pipeline exit 1 through a
`tail` pipe while its own log showed completion; the build was re run
with output to a file, exit 0, and that clean receipt is the one
recorded here.)

**Impeccable detector.** Source scan on the `.astro` file: 0 findings,
with the detector's own caveat that `.astro` runs regex rules only.
The real scan is on the built HTML.

Before (first built HTML scan), 5 anti-patterns found:

```
[low-contrast] 1.9:1 (need 3:1), text #484440 on #141210
[hero-eyebrow-chip] eyebrow chip above h1
[kicker-above-heading] "Sample meetup" above h2
[kicker-above-heading] "The door" above h2
[kicker-above-heading] "Launch list" above h2
```

Fixes: hero eyebrow deleted (its facts moved to the status line under
the form), all three kickers deleted (the sample wording moved into
the panel heading itself), tagline start state raised per precedence
call 3. After (final built HTML scan):

```
$ npx impeccable detect dist/social/index.html
(no findings)   exit 0
```

**Manual 15-tell audit:** no gradients anywhere (backgrounds or text);
no pill badges; no decorative glassmorphism (the sticky nav blur is
the functional B7 floating bar, content stays readable behind it);
no icon in rounded squares (the crew marks are initials of labeled
fictional people, content, not icons); no identical card grids (steps
are unboxed columns, differences are hairline rows); no cards in
cards; no decorative side stripes; no hero stats; no fake numbered
sequences (the three steps are genuinely ordered and unnumbered); no
decorative animation (reveals fire once, reduced motion disables);
no generic copy or em-dash saturation; no default beige or cream
(near black Mofongo ground). Findings: none kept open.

**Repo regression check:** `npm test` (the existing overlays suites)
passes on this branch. `node --check` on the new test file passes.

**Style gate (pre-report):** no Python files were authored or edited
in this task, so the ruff gate has no files to run on; stated plainly
rather than claimed. The new JavaScript test file passes
`node --check`. During verification the worktree `node_modules` was a
symlink to the main checkout's install; it was removed before commit
and is not part of this diff.

**Accessibility checks performed:** semantic landmarks (nav, main,
section, footer), skip link, exactly one h1, labeled inputs with
described by notes and status, visible focus ring on links, buttons,
inputs, and summaries, all contrast pairs AA per the table above,
48px touch targets, keyboard reachable FAQ details elements, reduced
motion path verified in the tall mobile screenshot (forced reduced
motion, all reveal content fully visible), screenshots inspected at
390px and 1280px with no overlap, no horizontal scroll, no wrapped
wordmark after the nav fix.

## Screenshots

- `docs/evidence/tw737/mobile-hero.png` (390 by 844)
- `docs/evidence/tw737/desktop-hero.png` (1280 by 800)
- `docs/evidence/tw737/desktop-hero-tall.png` (1280 by 900)
- `docs/evidence/tw737/mobile-tall.png` (390 by 3400, reduced motion
  forced, shows hero through the different section)

Rendered from the built `dist/` served locally, headless Chromium.

## Go live steps that remain (all Justynn's separate words)

1. **Rosa review** of this branch, then **Justynn's merge word**.
2. **DNS:** a record for `social.twistor.co` pointing at the site's
   hosting (Porkbun), his word and his hand per the standing rule.
3. **Host routing:** serve the built `/social/` page as the subdomain
   root on the same static deploy as twistor.co (one host config
   step at deploy time; the page already carries the subdomain
   canonical and OG URLs).
4. **Deploy word** for the website, separate from the merge word.
5. Optional later ticket: a real waitlist backend, if mailto capture
   is ever outgrown. Nothing in this page depends on it.
