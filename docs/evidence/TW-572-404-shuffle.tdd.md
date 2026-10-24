# TW-572 Evidence — Snake + car lane-dodger + 404 randomizer

## What changed
- New: `public/games/tw-553-snake.js` (`mountSnake(container, opts)`, themes corporate/trades)
- New: `public/games/tw-553-car.js` (`mountCar(container, opts)`, themes corporate/trades)
- `src/pages/404.astro`: random pick of 4 games per load + "Another game" shuffle button
- `src/pages/trades/404.astro`: same, trades-matched colors
- lbt-os `frontend/src/lib/games/`: added `tw-553-car.js`, `tw-553-snake.js`, `tw-553-runner.js`
- lbt-os `frontend/src/pages/NotFound.jsx`: random pick of 4 + shuffle button (React state)

Final 4 (per Justynn 2026-10-16 correction): car dodger, snake, hoops, boot-jump runner (trades theme). Corporate runner dropped from the rotation.

## Checks
- `node --check` on all game files (web and app copies): pass
- Em-dash grep on all touched files: zero matches
- Headless logic test (`/tmp/tw572-headless-test.mjs` run against the WEB copies,
  `/tmp/tw572-headless-test-app.mjs` run against the APP copies — minimal DOM stub): 9/10 on both
  - Caught and fixed a real bug: snake array uninitialized at mount (steer-before-restart crashed `step()`); fixed by calling `reset()` at mount end
  - Rosa round 1 caught that the fix initially landed only in the web copy; the app copy was re-synced byte-identical and re-tested against the app copy (same 9/10)
  - The 1 non-pass: "best persisted" — wall-death with score 0 correctly skips the localStorage write (`score > best` is `0 > 0`); persist path is byte-identical to the TW-553-verified runner pattern
  - Car: 10 simulated seconds, score advanced to 340 m, tap steering clean, destroy clean
  - Snake: wall death shows game-over card, restart button resets, swipe steering clean
- Rosa round-1 nit fixed: "new best." no longer shows on a score tie (both games now use an `isBest` flag captured before the best update); web and app copies verified byte-identical for snake and car

## Builds
- Astro build (`npx astro build`): PASS — 11 pages, both 404s built, all 4 game files in dist/games/
- Vite build (lbt-os frontend): PASS — built in 21.63s

## Impeccable
- Detector (`impeccable detect --quiet`) on all touched files, both repos: exit 0, zero findings
- Manual 15-tell audit: clean — solid brand colors (no gradients), system font stacks, no pill badges (shuffle reuses 8px btn-ghost), game-over overlay dim is functional (TW-553-approved pattern), HUD is contextual game score, zero em-dashes, trades warm-bone is the brand token

## Accessibility notes
- Canvas has role="img" + descriptive aria-label; HUD is aria-live="polite"
- Game-over card is role="alertdialog" with focus moved to the restart button
- Keyboard: arrows + WASD (snake), arrows + A/D (car); key handler skips when a button has focus so Space/Enter still activate the restart button
- Touch: swipe (snake) and tap-half (car), `touch-action: none/manipulation`, 44px min button height
- `prefers-reduced-motion`: snake runs fixed slow pace (no speed ramp); car runs slower with no ramp
- Tab-hide pauses both games via visibilitychange
