# TW-1214 unslop audit note

Prepared by Twistor Holdings LLC.

Scope of the change: eight film files dropped into `public/demos/` and
one data-field change in `src/pages/index.astro` (Social: `status`
string replaced by the existing `link` shape). No new markup patterns,
no new styles, no new copy beyond the link label.

Sign-by-sign pass over the changed surface (home page):

- Uppercase tracked micro-labels: none introduced; none on the page.
- Off-grid one-off spacing: none; the rows reuse the TW-1208 layout
  untouched.
- Mixed number formats: none introduced.
- Greeting headlines: none.
- Nested-radius math: the native video element inherits the slot's
  existing radius; no new nesting.
- Template look: the slots render the native player in the same frame
  the stills occupied; the page's editorial rhythm is unchanged.
- Copy: the one new string, "Open Twistor Social", follows the
  existing label pattern ("See Twistor Trades", "Open the live demo").
  Zero em-dashes in the built home page (verified by grep: 0).

No fixes required. Before/after screenshots: `after-1440.png`,
`after-375.png` in this folder (before state is the TW-1208 build on
main at 4099efc, screenshots in `qa-tw1208/`).
