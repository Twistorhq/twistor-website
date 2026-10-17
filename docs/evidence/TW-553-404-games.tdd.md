<!-- Prepared by Twistor Holdings LLC -->

# TW-553 — 404 Easter egg games: TDD evidence

Branch (website): `sofia/tw-553-404-games` (base `origin/main`).
Branch (lbt-os): `sofia/tw-553-lbtos-404` (base `origin/main`).
Ticket: TW-553. Builder: Sofia Reyes. Date: 2026-10-16/17.

## RED → GREEN

**RED (caught before merge, fixed on the branch):**
1. Em-dash in user-facing copy: `tw-553-runner.js` game-over card rendered `' — new best.'`. Caught by Rosa review (hard gate). Fixed: `' · new best.'`. Em-dashes in source comments also cleaned per TW-544 precedent.
2. Contrast failures: Impeccable flagged 5 (4 low-contrast, 1 sub-11px text) on first scan. Fixed with computed ratios; re-scan clean.
3. `visibilitychange` listener leak: anonymous handler could not be removed in `destroy()`. Caught by Rosa. Fixed: named `onVis`, removed on destroy, in both game files.
4. Hoops had no `prefers-reduced-motion` check (runner had one). Caught by Rosa. Fixed: ball rotation and float-text rise disabled under reduced motion.
5. Dynamic `import().then()` in both 404 pages had no `.catch()`. Caught by Rosa. Fixed: graceful fallback message in the game container.

## Commands → results (all run 2026-10-17, node v24)

| Command | Result |
|---|---|
| `node --check public/games/tw-553-runner.js` | OK |
| `node --check public/games/tw-553-hoops.js` (website copy) | OK |
| `node --check frontend/src/lib/games/tw-553-hoops.js` (lbt-os copy) | OK |
| `npx astro build` (website) | 11 pages built, complete; `dist/404.html` + `dist/trades/404/index.html` emitted |
| `npx vite build` (lbt-os frontend) | built in ~16s, complete |
| `impeccable detect dist/404.html dist/trades/404/index.html` (post-fix) | exit 0, zero findings |
| `grep —` over all touched files (js, astro, jsx) | zero em-dashes |
| Rosa independent verification | Astro builds at root and preview base, Vite build, headless smoke test of both games (start/jump/death/reset/restart, aim/shoot/settle), zero throws; `destroy()` removes keydown listener |

## Contrast (WCAG, computed from luminance)

- `#64748b` on `#ffffff` (corporate foot): **4.76:1** pass
- `#b23f0a` on `#f4efe4` (trades numeral): **5.08:1** pass
- `#ffffff` on `#b23f0a` (trades button): **5.82:1** pass
- `#6b6252` on `#f4efe4` (trades foot/HUD): **5.24:1** pass

## What the checks prove

1. **Both games load and run with zero throws** through full lifecycles (runner: start, jump, death, reset, restart; hoops: aim, shoot, rim/board/ground bounces, settle, ball reset).
2. **No listener leaks**: `destroy()` removes keydown + visibilitychange; React `useEffect` cleanup calls it on unmount.
3. **Keyboard + touch parity**: Space/ArrowUp jump, pointer drag shoots, arrows + Space aim/shoot; no hover-dependent interaction.
4. **Copy gates hold**: zero em-dashes in user-facing copy; contrast AA on all text.
5. **No collision** with Zeke's in-flight `tw-550-m1-flat-billing` branch (file-level verification).

## Kept on purpose

- `extreme-negative-tracking` (-5px) on the trades 404 numeral: consistent with the site's display type language; decorative oversized numerals, not body copy.
- Trades 404 page-scoped `.nav-cta` 12px override instead of editing the shared stylesheet's 10px media-query rule: leaves the landing page untouched; specificity verified to win.

## Open item (not mine to decide)

- `dist/trades/404/index.html` effectively never renders on GitHub Pages (only root `404.html` serves unmatched paths); /trades/* misses get the corporate 404. Keep or cut is Justynn's call. The twistor-trades mirror repo will want a `404.html` sync from `src/pages/trades/404.astro` at merge time.
