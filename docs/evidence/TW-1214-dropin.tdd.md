# TW-1214: twistor.co demo drop-in, eight films plus the Social live flip

Prepared by Twistor Holdings LLC.

## What this ships

The eight TW-1212 walkthrough films, Rosa-approved as a set (98
percent on the re-gate, 2026-11-19), land in the TW-1208 demo slots on
the twistor.co home page, and the Social product row stops saying the
app is offline. Per the slot convention in
`docs/demos-slot-convention.md`, dropping the `.mp4` files into
`public/demos/` is the whole integration: the build renders the native
player where a film exists and the fallback panel where one does not.
One page edit rides along, the Social row flip below.

## Films landed

Source: `~/workspace/twistor-lab/content-queue/tw1212-demo-films/final/`
(Nia's TW-1212 handoff). All eight are h264, 1920x1080, with AAC audio
(ffprobe). Two files land under site slugs that differ from their
handoff names, per the convention's slug list.

| Site file | Source file | Bytes | Duration | md5 |
|---|---|---|---|---|
| trades.mp4 | trades.mp4 | 6,375,701 | 131.48s | d06df637d33842db711395ae652d21fd |
| social.mp4 | social.mp4 | 8,311,575 | 119.38s | 3f48a68b5115af5d4ed232feb86932e2 |
| tori.mp4 | tori.mp4 | 10,530,512 | 130.41s | a15abed4727102b55e0a0eff5d7742b6 |
| clips.mp4 | clips.mp4 | 10,693,857 | 128.00s | dda63bbffc20c5b23471cedfd7631dce |
| 4szns.mp4 | szns.mp4 | 6,559,324 | 119.62s | c90ef34a7f8743ef86e6ad061a77abf2 |
| our-lgcy.mp4 | lgcy.mp4 | 13,672,010 | 131.95s | 5da35686156079f879bb4f6a9ec02d5b |
| data.mp4 | data.mp4 | 7,526,643 | 119.02s | 483cd1cbda59d06b70d322484b302baf |
| cinematic.mp4 | cinematic.mp4 | 8,039,393 | 126.93s | 062b26c6c771feb381abcd7bdce4bdb8 |

Total: 71,708,612 bytes. The social.mp4 md5 matches the corrected
film Rosa re-verified in the TW-1212 fix round, so the version that
ships is the one whose on-screen note reads that the app is live.

Posters (`.jpg`) and caption tracks (`.vtt`) are optional under the
convention and were not supplied by the film lane; the slots render
without them, `preload="none"` keeps the page weight unchanged until
a visitor presses play.

## The Social row flip

`src/pages/index.astro`, Social entry: the `status` field ("Temporarily
offline while hosting is restored. It comes back here when it is live
again.") is replaced by a `link` field in the exact shape the other
live external product uses (Our LGCY): `href`
`https://social.twistor.co`, label "Open Twistor Social",
`external: true`, which renders through the existing `.product-link`
pattern with `target="_blank" rel="noopener"`. Five insertions, one
deletion; no other row touched.

Live-state basis: TW-1144 is closed. The app had been suspended when
the founder's Fly trial ended with no payment method; he added the
card on 2026-11-19 and the app came back the same morning (~11:28
MST), verified live then at 200 on both `social.twistor.co` and the
Fly origin. Re-checked during this build (2026-11-19, this run):
`https://social.twistor.co` returns 200 and
`https://twistor-social.fly.dev` returns 200.

## Slot verification

- Build output (`dist/index.html`): 8 `<video>` elements, 8 distinct
  `/demos/<slug>.mp4` sources matching the slug list exactly, 8
  "Watch: the ... demo film." captions, 0 fallback panels, 0
  occurrences of "Demo film in production", 0 occurrences of the stale
  "Temporarily offline" text, 0 em-dashes.
- Served check (built site on a local server): all eight
  `/demos/<slug>.mp4` URLs return 200 with byte counts identical to
  the source files.
- Browser runtime (Chromium, local build): 8 video elements in the DOM
  at 1440 and at 375; the Social link resolves to
  `https://social.twistor.co/` with rendered height 44px, holding the
  tap-target minimum from the TW-1208 fix round.
- Visual: full-page screenshots at 1440 and 375 in `qa-tw1214/`
  (`after-1440.png`, `after-375.png`). The Social row shows the link
  in the brand accent under its proof line, and its slot shows the
  native player with the "Watch: the Twistor Social demo film."
  caption.

## Gate results

- Build: `npm run build` passes, including the Astryx scope guard
  (13 pages).
- Repo suites, same counts as the TW-1208 baseline Rosa verified:
  tv-overlays PASS, fallback-path PASS, accessibility 19/19, waitlist
  47/47, server 37/37, social page 59/59.
- Impeccable: detector on the built home page and the changed source
  reports 0 anti-patterns. One advisory, pre-existing TW-1208 copy in
  the work-with-us band ("no pitch deck theater"), untouched by this
  diff and left as shipped; changing founder-approved copy is outside
  this ticket. Manual 15-tell audit: the change introduces no new
  visual pattern at all (native players in existing slots, one link in
  an existing style), so no tells arise; the kept-on-purpose warm
  paper background from TW-1208 stands as recorded there.
- Unslop pass: audit note in `qa-tw1214/unslop-audit.md`, no findings
  requiring fixes.
- Agent-eyes runtime pass, home route at 1440, 390, and 375, strict:
  "no page errors, no console errors, no server errors, no horizontal
  scroll, actions ok." Screenshots in `qa-tw1214/` (`agent-eyes-*.png`).
  Overflow measured directly as well: document scrollWidth equals
  clientWidth at 1440 and 375.
- Surface class: the home page remains Standard, reclassed by the
  founder directive recorded in TW-1208; the slots keep poster-first,
  click-to-play delivery, so the cinematic exclusion carries unchanged.

## Accessibility

Every player is a native `<video controls>` with an aria-label naming
its film ("Twistor Trades demo film", "Twistor Social demo film",
"Tori demo film", "Twistor Clips demo film", "4SZNS demo film", "Our
LGCY demo film", "Twistor Data demo film", "Twistor Cinematic demo
film"), and every slot caption names the film in text. The Social link
text is meaningful out of context. The repo accessibility suite passes
19/19.

## Not done, on purpose

- No merge and no push to main. twistor.co deploys on merge; the
  founder's word after Rosa's spot-gate is the go-live.
- No posters or caption tracks: the film lane did not supply them and
  the convention makes them optional. Adding them later is the same
  drop-in with no page edit.
- The Cinematic section still runs under the name Twistor Cinematic;
  the founder's one-word pick remains his open call, and the film
  re-renders in one compose pass when it lands (TW-1212).
