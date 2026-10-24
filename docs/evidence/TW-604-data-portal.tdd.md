# TDD Evidence: Twistor Data Portal (TW-604)

**Prepared by Twistor Holdings LLC**
**Sofia Reyes — 2026-10-18. Branch: sofia/tw-604-data-portal (twistor-website)**

Justynn 2026-10-18: build the data portal — a lightweight frontend storefront
for Twistor's scientific datasets, so universities can come to the website and
get what they need. Static, zero-dependency, hand-built HTML/CSS/JS in
`data-portal/`. Four pages: index + three dataset detail pages
(S2S-TRUST v1, CLIMATESHIFT-1 v1, CARBON-TRUST v1).

## RED

- A storefront that misstates the paywall ships pricing confusion to
  researchers. Written first as a checklist: every price, tier, endpoint,
  and row count on the portal must trace to an enforced backend fact
  (`paywall.py`, the three lane routers, the seed files). Anything without
  an enforced target gets no number on the page.
- The access form with no backend key-issuance endpoint (TW-605 open) must
  not pretend to provision. Written as a mailto-with-prefill fallback first,
  so the form degrades to a real action instead of a dead submit.
- Impeccable anti-patterns caught on first scan (13 findings): side-tab
  borders, dark-section hover contrast, eyebrow-chip hero pattern, near-miss
  contrast. Each fixed and re-scanned to zero before review.

## GREEN

- `data-portal/index.html` — landing: catalog (3 datasets, alternating
  editorial rows), trust story, pricing (dynamic volume curve, no hard
  numbers per TW-606), API quickstart with copy buttons, access form,
  FAQ. Zero em-dashes. All internal links and anchors verified.
- `data-portal/datasets/carbon-trust.html` — 36 rows verified against the
  carbon seed; endpoints match the carbon router exactly.
- `data-portal/datasets/s2s-trust.html` — 30 rows per the subseasonal seed
  docstring; endpoints match the subseasonal router.
- `data-portal/datasets/climateshift-1.html` — 70 rows (30 hemp + 40
  reference corpus) verified against backend seeds; endpoints match the
  crop_climate router.
- `data-portal/styles.css` — hand-built, brand tokens (near-black ink,
  solid indigo-violet, no gradients). Mobile responsive, hamburger nav with
  Escape-to-close, reduced-motion support. Contrast 5.94-16.01:1 (AA).
- `data-portal/app.js` — mobile nav, copy buttons, mailto-prefill access
  form (fully encodeURIComponent'd, no injection vector). `node --check`
  passes.

## Fix round (Rosa round 1, 4 majors)

1. Pricing re-aligned to TW-606 dynamic curve; all hard fee numbers
   ($6.00/$8.50/$22.50) stripped until Dre implements TW-606 in paywall.py.
2. Nonexistent "500,000 rows per download" cap sentence deleted.
3. CLIMATESHIFT-1 row count corrected 30 -> 70.
4. Subscription FAQ rewritten: binary gate + automatic metering, matching
   the backend's 402 fail-closed model.

## Verification

- Impeccable detector: 13 findings -> 0 (re-ran after every fix).
- Manual 15-tell audit: passed (no gradients, no pill badges, no identical
  card grids, no decorative animation, no em-dash saturation).
- HTML well-formed on all 4 pages (parser check); JS syntax checked.
- No secrets, credentials, or PII in the diff.
- Rosa round 1: REQUEST_CHANGES (4 majors, all addressed above).
- Rosa round 2: re-review of this fix round pending.
