# Accessibility evidence demo

Internal, local-only developer tooling. No production release, paid APIs,
customer accounts or automatic conformance claims. Added with Justynn's
October 10, 2026 authorization for the self-audit experiment.

## Run

```
npm ci
npx playwright install chromium
npm run build
npm run preview -- --host 127.0.0.1
# In a second terminal:
npm run test:a11y
npm run audit:a11y
```

`AUDIT_CHROMIUM` optionally selects an installed Chromium executable. The
collector permits only loopback targets and blocks cross-origin requests.
It pins the checked-out commit and refuses modified application sources.
Rebuild after changing commits; do not scan a server from another checkout.

Open `artifacts/accessibility/index.html`. The same directory contains the
20-record `bundle.json`, screenshots, DOM evidence, deduplicated `backlog.json`
and blocked `draft-acr.json`. Artifacts are ignored by Git; do not publish
customer evidence. These files contain Twistor's own public page content.

Five flows: home, compliance, trades, dispatch product and interactive dispatch
board. Four views: initial, eight Tab presses, 640px reflow proxy, and status
inventory (including the dispatch empty-search state). Keyboard observations
are not a complete keyboard audit; 640px is not actual 200% browser zoom.
Authenticated flows are explicitly excluded. Failed captures make the command
exit nonzero. Screenshot SHA-256 uses base64 bytes; HTML uses UTF-8 text.

## Human review and draft gate

An evaluator must review each record and add `manualReview.status: reviewed`,
`evaluator` and `rationale`. Preserve original evidence; record any disagreement
as `conflict: true` and any reopened finding as `reopened: true`. A separate
statement array supplies `status`, `rationale`, and `evidenceIds`.
Allowed statuses: supports, partially-supports, does-not-support, not-applicable.
An N/A statement still needs reviewed scope evidence and a rationale.

The corresponding approval array must contain `role: product-owner`, `reviewer`,
`bundleHash` and `statementHash`, calculated with the exported `hash` function
over the exact parsed JSON objects. Any change requires fresh approval.

```
node scripts/accessibility/review.mjs bundle.json statements.json approvals.json CURRENT_SHA reviewed-draft.json
```

This command verifies evidence files against their hashes before checking the
approvals. Local reviewer assertions are **not authenticated signatures**.
Do not use this CLI as a production authorization boundary. It never calls the
result certified, never signs for an owner, and does not create an official
ITI VPAT. Human evaluation, full criterion coverage, assistive-technology tests
and customer-specific standards remain required.

## Ownership and integration

Website/compliance owns this adapter and report. Core should own the future
provider-neutral evidence and authenticated approval contracts. The design
references Core's hash-pinned gate pattern at
`3905eeba6f0326dc2a75ce1a2671edcbb8f60131`,
`src/twistor_core/approval_gates/gates.py`; no private source is copied or
domain-specific content stages imported. No Core or LBT-OS code is changed.

Follow-up: real zoom and screen-reader evaluation; richer evaluator interface;
criterion-level coverage; authenticated owner approval; signed build manifest;
durable evidence storage with access control. These are pending, not demo claims.

Reference methods: https://www.w3.org/WAI/test-evaluate/ and
https://www.itic.org/policy/accessibility/vpat . Tool rules retain axe's own
versioned identifiers and help URLs in each evidence bundle.
