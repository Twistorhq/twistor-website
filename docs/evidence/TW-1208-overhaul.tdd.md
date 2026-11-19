# TW-1208: twistor.co overhaul, minimalist rebuild

Prepared by Twistor Holdings LLC.

## Founder directive (2026-11-19)

The founder changed his mind on the cinematic scroll: back to a normal
design with a minimalist layout. What he liked was the graphics and
effects quality, not the scroll mechanic. Two named defects: the site is
too blown up on his phone, and the copy reads terrible. Every product
gets a small demo slot and a link to what we built; the demo format is
the TW-1198 walkthrough film, one per product, built under TW-1212.

## Surface class declaration

The home page is reclassed from Cinematic to Standard for this build,
per the founder directive above, which supersedes the TW-1035 cinematic
default for this surface. The cinematic engine, its media, and
`src/scripts/cinematic-home.js` are left in place, unreferenced by the
home page; nothing is deleted. Poster-first media and structured-view
fact parity carry over: every fact on the page is plain HTML text, and
every demo slot renders a still or panel until its film exists.

Correction (fix round, 2026-11-19): the sentence above was false as
first shipped. The original branch had in fact regenerated
`public/cinematic/**` as a side effect of re-running the cinematic
tooling: segments renamed (trades to front-office, dispatch to
season), hotspot states rewritten, `manifest.json` regenerated, 150
files deleted net including the trades and dispatch frame sequences.
Rosa's gate caught the mismatch between this report and the diff
(REQUEST CHANGES, one blocker). The fix round restored
`public/cinematic/**` from main exactly: the branch diff against main
now touches zero files under `public/cinematic` (verified with
`git diff main...HEAD -- public/cinematic`, empty), so the archived
cinematic build, the graphics asset the founder asked to keep, is
byte-identical to main and the statement above holds as shipped. The
review unit drops from 868 files to 19, which is the change actually
being shipped.

## What changed

- `src/pages/index.astro` rewritten whole: sticky header, type-led hero,
  eight product sections in founder order (Trades, Social, Tori, Clips,
  4SZNS, Our LGCY, Data, Cinematic) as alternating editorial rows, a
  work-with-us band, and a footer with the credits link and the Twistor
  Holdings LLC byline. No scroll flight, no canvas, no overlay system,
  no JavaScript on the page.
- Copy rewritten end to end: plain, confident, zero em-dashes (verified
  in the built HTML: 0). Every claim is tied to a dated, real fact
  (pricing, ship dates, corpus counts). Products without a live surface
  carry an honest status line instead of a link. The Social entry links
  nowhere: the app is temporarily offline pending the TW-1144 restore,
  and the page says so.
- Mobile sizing: fluid type with capped clamps (H1 measures 54.4px at
  1440 wide, 33.6px at 375), a 1120px container with 20 to 24px gutters,
  single-column product rows under 760px. Tap targets, measured in
  Chromium on the built page after the fix round: primary buttons
  52px, product links 44px, header nav links 44px at 1440 and 48px at
  390/375. The footer's inline text link is standard text height
  (20px) and is not counted in that minimum. (Fix round: product links
  were padded with `inline-flex` and `min-height: 44px`, and desktop
  nav padding raised from 6px to 8px, after Rosa's nit showed the
  original blanket 44px claim did not hold for them.)
  Measured: document scrollWidth equals clientWidth at 1440, 390, and
  375 (no horizontal overflow).
- Demo slots: the build checks `public/demos/<slug>.mp4` (poster
  `<slug>.jpg`, captions `<slug>.vtt`) and renders the native player
  when a film exists, else the still or name panel with a "Demo film in
  production" caption. Convention documented in
  `docs/demos-slot-convention.md`. Drop-in proof below.
- Stills: the cinematic segment posters are composed frames (blank
  paper, the guide mark baked in) and read as broken in a plain slot, so
  the five homepage photographs were re-fetched as clean originals from
  Pexels, the same photos the credits page already credits, at 1200px
  wide in `public/stills/`. The Cinematic slot uses the archived
  build's own contact sheet at `/cinematic/media/contact-sheet.jpg`,
  restored byte-identical from main with the rest of the cinematic
  tree in the fix round; it loads from the built site (natural width
  1920 at 1440).
- `src/pages/credits.astro`: scene descriptions updated to match the
  stills' new use; photographers and license unchanged.

## Gate results

- Build: `npm run build` passes, including the Astryx scope guard.
- Repo tests: tv-overlays PASS, fallback-path PASS, accessibility suite
  19/19, waitlist 47/47, server 37/37, social page 59/59.
- Impeccable: detector clean on the built HTML (index and credits).
  Manual 15-tell audit: no gradients, no gradient text, no pill badges,
  no glassmorphism, no icon tiles, no card grids, no cards in cards, no
  side stripes, no hero stat band, no fake numbering, no decorative
  animation, no generic copy. Kept on purpose, one item: the warm paper
  background (#FAF7F2) is the shipped Twistor brand surface from
  TW-1050/TW-1146, not a template default; brand board wins the tie.
- Unslop pass (audit note in `qa-tw1208/unslop-audit.md`): no findings
  requiring fixes. Headings sit at weight 700, the brand display weight
  across the site; the slop sign targets 800/900.
- Agent-eyes runtime pass, home route at 1440 and 390, strict:
  "no page errors, no console errors, no server errors, no horizontal
  scroll, actions ok." Screenshots in `qa-tw1208/`.
- Drop-in proof: a dummy `public/demos/trades.mp4` plus rebuild renders
  exactly 1 video element; removing it and rebuilding returns 0 and the
  fallback still. Nia's real films (TW-1212) need no page edit.
- Before/after screenshots at 1440 and 375 in `qa-tw1208/` (before is a
  clean build of origin/main at 24bcfea, the live TW-1146 state).

## Fix round gate results (Rosa REQUEST CHANGES, 2026-11-19)

- Cinematic restore: 852 files restored to main exactly (148
  branch-added files removed, 150 deleted files restored, 554 modified
  files reverted). `git diff main...HEAD -- public/cinematic` is
  empty; the restored tree carries the original segment names
  (trades, dispatch) and the archived contact sheet serves from the
  built site.
- Build re-run: `npm run build` passes, including the Astryx scope
  guard (13 pages).
- Suites re-run: tv-overlays PASS, fallback-path PASS, accessibility
  19/19, waitlist 47/47, server 37/37, social page 59/59. Same numbers
  Rosa verified; no regressions from the restore or the tap-target
  padding.
- Agent-eyes strict re-run at 1440, 390, and 375: "no page errors, no
  console errors, no server errors, no horizontal scroll, actions ok."
  Screenshots in `qa-tw1208/fix-round-home-*.png`. H1 still measures
  54.4px at 1440 and 33.6px at 375; the layout Rosa verified is
  unchanged apart from the two padded link styles.

## Accessibility

Semantic landmarks with a skip link, one H1, ordered headings, alt text
on every still, labeled nav, focus-visible outlines at 3px in the
accessible accent (#B5430E on paper, also used for link text), native
video controls with an aria-label and an optional captions track wired
into the slot. The repo accessibility suite passes 19/19.

## Not done, on purpose

- No merge. twistor.co deploys on merge; the founder's word after
  Rosa's review is the go-live.
- The eight demo films are TW-1212 (Nia), still in production. The
  Cinematic product's one-word name is the founder's open call; the
  section runs under its current name, Twistor Cinematic, until he
  picks one.
- Other pages (trades, products, social, credits beyond the wording
  alignment) are untouched.
