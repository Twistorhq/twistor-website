# twistor.co Rebuild: Photography Manifest (TW-1050)

Prepared by Twistor Holdings LLC. Curated by Sofia Reyes, 2026-11-11.
All photography is real stock photography. No AI imagery is used
anywhere in this build, as a substitute or otherwise.

## License basis, verified 2026-11-11

Every pick is a Pexels photo under the **Pexels License**: free to use
on websites, blogs, apps, and marketing, including commercial use;
attribution is not required by the license (Twistor credits anyway,
per the cinematic skill's film craft rule 6: real photos carry
credits). Terms read at the source: https://www.pexels.com/license/
(fetched 2026-11-11; the page's allowed uses name websites and
product promotion explicitly). License restrictions honored: no photo
is sold or redistributed as stock, no depicted person is presented as
endorsing Twistor, no photo is used as a trademark.

**Verification status: badge check COMPLETED 2026-11-11** (TW-1050
integration round, per Rosa's pre-deploy condition 3). Each assigned
photo's canonical page was read live; the page header ("Free Stock
Photo", "Free download", photographer credit) is the badge evidence.

| ID | Badge read 2026-11-11 | Photographer (per the photo page) |
|---|---|---|
| 5463577 | YES: Free Stock Photo, Free download | José Andrés Pacheco Cortes |
| 5463581 | YES: Free Stock Photo, Free download | José Andrés Pacheco Cortes |
| 5463587 | YES: Free Stock Photo, Free download | José Andrés Pacheco Cortes |
| 5463575 | YES: Free Stock Photo, Free download | José Andrés Pacheco Cortes |
| 5463576 | YES: Free Stock Photo, Free download ("Man Taping a Hose") | José Andrés Pacheco Cortes |
| 8867479 | YES: Free Stock Photo, Free download | Yan Krukau |
| 8486972 | YES: Free Stock Photo, Free download | Kindel Media |
| 5463580 | YES: Free Stock Photo, Free download | José Andrés Pacheco Cortes |
| 21812146 | YES: Free Stock Photo (page title/badge read live 2026-11-11) | Shameer Vayalakkad Hydrose |

At build time the photo pages could not be re-read from this sandbox
(HTTP 403 to the fetcher, ERR_TUNNEL_CONNECTION_FAILED in Chromium,
the TW-1037 wall); the build-stage verification was CDN resolution,
the full-size downloads from images.pexels.com on 2026-11-11, and a
visual read of every frame before assignment. The integration-round
check above superseded that status for eight of the nine picks. The
fix round then replaced the ninth pick (8005397) with 21812146, whose
page badge was also read live on 2026-11-11; the assigned set is now
fully badge-verified.

Canonical page URL for every pick: `https://www.pexels.com/photo/<id>/`
(Pexels' ID-addressable page; it redirects to the titled page in a
browser).

## Film picks (composited into the cinematic scene)

| ID | Photographer | Subject (Sofia's read of the downloaded original) | Size | Segment |
|---|---|---|---|---|
| 5463577 | José Andrés Pacheco Cortes | Two HVAC techs at an open rooftop package unit, backs to camera, big sky. Faces not visible. | 3200x2475 | ESTABLISH (poster frame) |
| 5463581 | José Andrés Pacheco Cortes | Tech drilling into an open rooftop condenser, hat over face. | 3200x2547 | TRAVEL first half |
| 5463587 | José Andrés Pacheco Cortes | Same unit, wider framing, drill in both hands. | 3200x2645 | TRAVEL second half |
| 5463575 | José Andrés Pacheco Cortes | Tech reading manifold gauges on a rooftop condenser, mask and glasses. | 3200x2273 | DWELL trades |
| 5463576 | José Andrés Pacheco Cortes | Tech taping insulation on a mini-split line set, face hidden by hat. (Founder-supplied title: "Man Taping a Hose".) | 3200x4800 | TRAVEL road |
| 8867479 | Yan Krukau (verified 2026-11-11) | Dispatcher in profile, Black woman, hand on headset mic, focused. Portrait. | 3200x4800 | DWELL dispatch |
| 21812146 | Shameer Vayalakkad Hydrose | Electrician in a blue hard hat inspecting a wired industrial control panel from the right side of frame; the cabinet and cable modules fill the left side, so the guide's lower-left DRIFT path stays clear of the subject's face and hand. | 3072x4080 | DWELL data |

## Structured-view picks (Selected Work, below the flight)

| ID | Photographer | Subject | Size | Use |
|---|---|---|---|---|
| 8486972 | Kindel Media | Plumber portrait, Black woman, yellow hard hat and hi-vis, pipe wrench in hand, looking up at the work. | 1600x1200 | Selected Work lead image |
| 5463580 | José Andrés Pacheco Cortes | Close-up: hands running a leak detector along a coil. The evidence shot. | 1600x2400 | Compliance card image |

## Alternates (verified, held in reserve)

| ID | Photographer | Subject | Note |
|---|---|---|---|
| 8486923 | Kindel Media series | Woman with pipe wrench, white hard hat, orange vest, portrait framing. | Alternate for 8486972 |
| 5467591 | UNVERIFIED | CSR at a laptop, Black woman, headset, looking at camera. | Alternate for 8867479 |
| 5463583 | José Andrés Pacheco Cortes | Tech seated on the ground leak-checking a coil, camo hat. | Alternate TRAVEL/DWELL texture |
| 5463585 | José Andrés Pacheco Cortes | Leak detector at a coil with fan blade, close. | Alternate for 5463580 |
| 5463578 | José Andrés Pacheco Cortes | Drill at the condenser, tighter than 5463587. | Alternate TRAVEL frame |
| 8681899 | UNVERIFIED | Dispatcher profile close-up, headset. | Alternate dispatch |

## Flags for Rosa and the founder

1. **5463577 (ESTABLISH): FIXED 2026-11-11 per Rosa's ruling.**
   The frame carried a clearly legible Walmart storefront sign
   mid-frame and the crew's shirt text with a phone number (a Mexican
   HVAC crew; the photographer shot his own trade). Rosa's TW-1050
   gate ruling: crop, replace, or blur both before deploy. Applied:
   a heavy feathered Gaussian blur over both regions on the source
   photo (`build/fix_establish_photo.py`; sign face at source pixels
   (940,500)-(1760,800), shirt back at (2240,1060)-(2820,1600)), then
   the ESTABLISH segment was re-rendered and re-encoded through the
   kit ladder, so every tier, the Tier D poster, and the page poster
   carry the fix. Both marks are illegible in the shipped frames and
   read as photographic softness at poster scale (verified by direct
   read of the fixed frame). The untouched original is preserved at
   `photos/originals/5463577.jpg`. Observed and left for the gate:
   a partial DQ sign sliver at the frame's extreme left edge, outside
   Rosa's ruling (only letters "DQ" on a cut-off oval); not fixed,
   Rosa's call.
2. **5463576** shows a Carrier badge on the unit being serviced:
   equipment branding in a service context, standard editorial use.
3. Faces: the brand's faceless rule binds depictions of the founder.
   These are stock models and working techs, shown as themselves;
   no pick depicts or implies the founder.
4. The set as assigned: HVAC crew (Latino techs), a Black woman
   dispatcher, a brown-skinned electrician, a Black woman plumber. People of
   color are the face of every segment; there is no white-only frame
   in the scene.
5. **8005397 (DWELL data): REPLACED 2026-11-11 per Rosa's integration
   gate.** Rosa's sole Major finding required a swap because the
   8005397 Pexels page had been removed, so its license badge could
   never be produced on demand. The replacement is 21812146 by
   Shameer Vayalakkad Hydrose. Its Pexels page was read live on
   2026-11-11 at
   https://www.pexels.com/photo/electrician-in-helmet-working-with-cables-21812146/
   and carries the title/badge "Electrician in Helmet Working with
   Cables · Free Stock Photo". Composition was checked against the
   rendered dwell before assignment: the electrician stands on the
   right, the wired control cabinet fills the left, and the guide's
   lower-left DRIFT path stays clear of the subject's face and hand.
   8005397 is no longer assigned to any segment and is not part of
   the shipped scene.

## Founder download list (only if a pick must be re-pulled at full size)

All assigned originals are downloaded into `photos/` in this folder
(film picks at 3200w where the source allows, structured view at
1600w; 21812146's source is 3072px wide). Nothing is owed. The
pre-deploy badge check is complete for the assigned set (table
above); flag 5 records the completed 8005397 replacement.
