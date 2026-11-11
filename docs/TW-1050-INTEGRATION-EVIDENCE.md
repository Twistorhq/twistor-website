# TW-1050 Integration Evidence: cinematic rebuild ported to twistor-website

Prepared by Twistor Holdings LLC. Builder: Sofia Reyes, Twistor frontend.
Branch: `sofia/tw-1050-rebuild-port` (own worktree, from main e08a44c).
Status: READY FOR ROSA REVIEW. Not merged, not pushed.

## What the port is

The Rosa-approved TW-1050 rebuild (web-standards/twistor-co-rebuild/)
is now the site's home page in Astro structure:

- `src/pages/index.astro`: the rebuild page, generated from the
  approved page by `build/port_to_astro.py` (in the rebuild folder).
  Body markup is byte-identical to the approved page after the asset
  prefix change (`media/` -> `cinematic/media/`); the style block is
  the approved styles plus one rule wiring the site's display face
  (Bricolage Grotesque, loaded per the site pattern) to headings and
  the kinetic headline; body type stays system-ui as built. Head
  carries the site's favicon and OG/Twitter tags verbatim.
- `src/scripts/cinematic-home.js`: the page's module script verbatim
  except the engine import (now `src/lib/cinematic/cinematic.js`,
  copied from the kit) and the media URL prefix.
- `public/cinematic/`: `scene.json` (copied verbatim, meta updated
  for the re-render below), `manifest.json` (CS-P3), the full media
  ladder (a/b/c/d + poster + work stills), the engine CSS, and
  `PHOTO-MANIFEST.md`. All page asset URLs are document-relative, so
  the page works at the domain root and under the project-pages base.

The rest of the site is untouched: all other pages, the TW-942
waitlist wiring, and the server are byte-identical to main.

**One product surface leaves the home page, flagged plainly:** the
old home page carried the Trade View teaser (TW-446/448: Leaflet map
+ sample leak ledger). The approved rebuild is the whole home page,
so the teaser no longer renders at `/`. Its code survives intact
(`public/scripts/tv-overlays.js`, `public/vendor/leaflet/`, both test
suites pass), and the live Trade View app link lives on in the
product pages. Re-homing the teaser (e.g. under /trades) is a
follow-up decision for the founder, not something this port decided
silently in either direction.

## Rosa's photography ruling, applied in the port

- **Walmart sign + crew shirt text/phone number (5463577, ESTABLISH):
  FIXED by blur.** `build/fix_establish_photo.py` (rebuild folder,
  ruff check + format clean) applies a heavy feathered Gaussian blur
  to both regions on the source photo (sign face at source pixels
  (940,500)-(1760,800); shirt back at (2240,1060)-(2820,1600);
  regions located by visual grounding and confirmed by direct read).
  The untouched original is preserved at
  `photos/originals/5463577.jpg` in the rebuild folder. The ESTABLISH
  segment was re-rendered (`render_frames.py establish`) and
  re-encoded through the kit ladder; the Tier D poster was
  re-encoded at q50 to match the gate-state treatment of the poster
  set, and `scene.mp4` was re-concatenated. Verified by direct read
  of the shipped poster and of Tier A frame 0047 (deepest push-in):
  both marks are illegible and read as photographic softness.
  CS-Q6 note: the guide badge is composited downstream of the photo,
  so the fix cannot touch it; the badge renders crisp in both reads.
- **Carrier badge (road frame): kept**, per Rosa's ruling
  (authentic service context).
- **Observed, outside the ruling, left for this gate:** a partial DQ
  sign sliver at the establish frame's extreme left edge (letters
  "DQ" on a cut-off oval). Not fixed; Rosa's call.

## License badge check (Rosa's pre-deploy condition 3): COMPLETE

Each assigned photo's Pexels page was read live on 2026-11-11
(page header = "Free Stock Photo" / "Free download" / photographer
credit). Full record in `public/cinematic/PHOTO-MANIFEST.md`:

- VERIFIED (8): 5463577, 5463581, 5463587, 5463575, 5463576,
  5463580 (all Jose Andres Pacheco Cortes), 8867479 (Yan Krukau;
  resolves the build-stage UNVERIFIED), 8486972 (Kindel Media).
- **NOT VERIFIABLE (1): 8005397 (DWELL data). The photo page has been
  REMOVED from Pexels**: the canonical slugged URL returns Pexels'
  "The photo you clicked on isn't around anymore" and the bare-ID
  URL 404s. The file still resolves on the CDN (downloaded
  2026-11-11). Photographer Emmanuel Ikwuegbu and the Pexels
  provenance are corroborated by two independent publications citing
  the canonical URL with his credit (Harlem World Magazine
  2024-09-18; FindTheHomePros). The manifest states this plainly and
  leaves the keep-or-swap decision to this gate; a swap means
  re-rendering one 24-frame dwell plus ladder and manifest.

## Weights after the photo fix (manifest.json, CS-P3, re-measured)

| Tier | Gate value | Port value | Delta | Ceiling |
| --- | --- | --- | --- | --- |
| A streamed (AVIF) | 15,353,992 | 14,919,582 | -434,410 | 45,000,000 |
| B (WebP) | 13,226,968 | 12,904,160 | -322,808 | 16,000,000 |
| C (scene.mp4 set) | 2,228,573 | 2,191,487 | -37,086 | 10,000,000 |
| D (poster set) | 299,710 | 292,922 | -6,788 | 400,000 |
| Page poster | 82,296 | 75,508 | -6,788 | 250,000 |
| Pre-scrub (CS-B1) | 611,472 | 550,634 | -60,838 | 3,500,000 |

Every delta is negative (blurred regions compress better); every
tier stays inside its ceiling. scene.json meta was updated to the
new poster/pre-scrub figures and re-validates 27/27 PASS; the
rebuild scene tests pass 2/2.

## Build and runtime verification (this worktree)

- `npm run build` (astryx scope guard + astro build): PASS, 12 pages.
- Site suites: `npm test` PASS (tv-overlays + fallback);
  `npm run test:waitlist` PASS (waitlist 47/47, server 37/37,
  social page 59/59).
- Runtime spot-check against `dist/` (`qa-cinematic/run-port-qa.mjs`,
  screenshots alongside it): Tier A desktop: Flight initializes,
  state establish, 21/21 structured facts in the DOM; scroll drives
  the state machine to the trades dwell (state "trades", settled);
  mobile 375 Tier A: Flight initializes; Tier D: poster set displays,
  21/21 facts. Screenshots: port-A-1440-top.png,
  port-A-1440-trades.png, port-A-375-top.png, port-D-1440-top.png.
- Accessibility: the ported page is the gate-approved page (semantic
  structure, aria labels, reduced-motion and Tier D floors unchanged);
  the site's a11y test scripts are untouched and not affected by this
  diff (home page markup they scan is generated at build; no a11y
  suite covers index.astro content directly).
- Faithful-port note: at 375px the persistent nav wraps (links stack,
  CTA wraps), identical to the approved rebuild's own 375 snapshot
  (qa/snapshot-B-375.png in the rebuild folder). Port behavior, not a
  port defect; a mobile-nav tightening pass is a follow-up if wanted.

## Pipeline incidents (honest record)

- The first establish ladder launch used the wrong output dir (the
  ladder writes `<out>/a/...`; out must be `media/`, not the rebuild
  root). Caught by timestamp inspection before any file was trusted;
  stray `a/ b/ c/ d/` folders at the rebuild root were deleted and
  the ladder re-run correctly. One detached (nohup) ladder process
  later died silently mid-run after writing one frame; the ladder
  was re-run as a tracked foreground process to completion
  (exit 0, 48 frames). No partial media ships: manifest_gen
  re-measured every file and the frame counts match the scene
  (48/72/24/36/24/24 = 228).

## Not claimed

- CS-Q2 on GPU hardware: still outstanding per Rosa's pre-deploy
  condition 1; the sandbox has no GPU and the founder's merge word
  carries it as a known outstanding item (ticket record, 2026-11-11).
- No merge, push, or deploy was performed or is implied by this
  branch. Marcus merges on the founder's word after this gate.
