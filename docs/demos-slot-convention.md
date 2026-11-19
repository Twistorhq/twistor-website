# Demo slot convention (TW-1208 / TW-1212)

Prepared by Twistor Holdings LLC.

The twistor.co home page renders one demo slot per product. Films are
produced by the walkthrough lane (TW-1212) and land in `public/demos/`:

- `public/demos/<slug>.mp4` — the film (required to switch the slot on)
- `public/demos/<slug>.jpg` — poster frame (optional, recommended)
- `public/demos/<slug>.vtt` — captions track (optional)

Slugs: trades, social, tori, clips, 4szns, our-lgcy, data, cinematic.

The home page checks for the .mp4 at build time. Present: the slot renders
the native player with poster and captions when supplied. Absent: the slot
renders the product still (or the name panel) with a "Demo film in
production" caption. Dropping a film in and rebuilding is the whole
integration; no page edit is needed.
