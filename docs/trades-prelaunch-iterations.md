# Trades prelaunch — section-by-section review

Owner direction October 10, 2026: iterate section by section and copy by copy.
No section below is owner-approved yet. Do not interpret the implementation of a
draft as copy approval, public launch authorization or readiness of live dispatch.

## Iteration 01 — header and hero only

Route: `/trades/`. The corporate homepage stays unchanged. No new dependencies,
external fonts, analytics, forms or network APIs. HTML/CSS only. It is noindex,
but noindex is not access control. Do not put private product/customer data here.

Review in this order:

1. Audience: property managers / housing operators and established trade firms.
2. Eyebrow: `DENVER PILOT IN PREPARATION`.
3. Headline: `Every request. A clear next step.`
4. Supporting line: `For the people managing properties. And the trades keeping them running.`
5. Description: `We're building a shared maintenance workflow—from a resident's first report to an approved provider and a documented closeout.`
6. CTA: `See the workflow concept`. It navigates to the illustrative card; it does
   not imply an open waitlist or a service booking.
7. Visual: midnight navy, existing Twistor blue, pale green accent; one clearly
   labeled fictional work order. This is a proposed direction, not approved brand.

Acceptance for this iteration: owner agrees with target audience and wording,
then desktop/mobile visual review, readable type, functioning anchor navigation
and keyboard focus. Keep this section revisable; do not expand until feedback.

## Queued iterations — not implemented

| Iteration | Section | Review decision |
|---|---|---|
| 02 | Interactive request walkthrough | Exact steps, claims and example text |
| 03 | Property-manager and provider value | Separate specific benefits without invented results |
| 04 | Signup and privacy copy | Fields, consent, endpoint, retention/contact and confirmed storage |
| 05 | Reveal/countdown | Owner-approved date and event; zero never unlocks the application |
| 06 | FAQ and footer | Pricing/availability limits, support path and legal identity |
| 07 | Whole-page launch check | Mobile/keyboard, real signup, HTTPS, approved DNS and protected app |

Implementation approach: draft one section; review its copy; revise; review
visuals/behavior; record approval with evidence; then proceed. An approval for one
section is not approval for the entire page or deployment.

## Activation boundaries

Domain ownership, hosting target and DNS are not verified. Signup storage and
email delivery remain unconnected. No date, waitlist count, testimonial, customer
logo, scarcity claim or payment promise may be fabricated. A future capture form
must return success only after durable server confirmation, with error/retry,
duplicate-submit protection, consent and a monitored opt-out/deletion contact.
LBT-OS stays behind authentication; do not expose admin functionality by DNS.

## Verification in this environment

Run `npm run build` and `git diff --check`. The existing marketing scope guard
must pass. Browser visual QA is unavailable in this managed runtime without its
supported browser-control capability. Do not label CSS breakpoints as tested
device screenshots. A self-contained HTML export supports owner visual review.
