## 2026-10-24T13:56:00.129034+00:00 — `a9e011fa78fa`
**Files**: README.md

### What does this code do? (your own words, not a paste of comments)
Adds a short Contributing section to the twistor-website README that tells contributors this repo runs the Confess pre-push gate, what it pauses on (AI co-author markers in commit messages), the one command to enable it, and where the full doc lives. Documentation only: no site code, styles, build config, or dependencies change.

### If this breaks in production tomorrow, what is the most likely cause?
The README renders as the public repo home page, so a broken relative link or malformed markdown would be visible to anyone landing on the repo, and the link would 404 if docs/confess-gate.md moved. Nothing executable ships, so the blast radius is one rendered page.

### How would you verify it's correct in under 5 minutes?
After the push, open the README on the branch, click the Confess gate link to confirm it lands on docs/confess-gate.md, and check git log for the branch to confirm the Co-Authored-By trailer survived. Two minutes, no build required.

