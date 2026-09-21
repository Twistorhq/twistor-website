// Astryx scope guard (TW-150 adoption).
//
// Enforces the hard rule Justynn approved: Astryx is adopted for INTERACTIVE
// SURFACES ONLY. The marketing site never touches Astryx.
//
// Marketing = every route under src/pages/** EXCEPT src/pages/surfaces/**
// and src/pages/demo/**. Defining it as an exclusion (not an allowlist)
// means a future marketing page (e.g. src/pages/pricing.astro) is guarded
// automatically instead of bypassing the check silently.
//
// Rules:
//   1. Marketing routes must not mention astryx, import the ui/ wrapper
//      layer, or mount React islands.
//   2. Astryx JS imports ('@astryxdesign/core', including side-effect
//      imports and dynamic import()) may only appear inside
//      src/components/ui/** — the swizzle boundary — plus the grandfathered
//      TW-140 evaluation pilot (src/components/AstryxPilot.tsx).
//   3. Astryx CSS (reset/theme/tokens) may only be imported by routes under
//      src/pages/surfaces/** and src/pages/demo/**.
//   4. Those interactive routes must stay noindex + unlinked (noindex meta).
//   5. ui/ modules may only import react and '@astryxdesign/core'.
//
// Run: `npm run guard` — and it runs automatically on every build because
// package.json sets "build": "npm run guard && astro build", so any deploy
// build enforces it. Non-zero exit = violation.
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const failures = [];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out; // tolerate a removed subdirectory
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = walk(p, out);
    else if (/\.(astro|tsx?|mjs|cjs)$/.test(name)) out.push(p);
  }
  return out;
}
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');
const read = (p) => readFileSync(p, 'utf8');

const isInteractiveRoute = (r) => /^src\/pages\/(surfaces|demo)\//.test(r);
const MARKETING_PAGES = walk(join(ROOT, 'src/pages')).map(rel).filter((r) => !isInteractiveRoute(r));
const GRANDFATHERED = new Set(['src/components/AstryxPilot.tsx']); // TW-140 eval artifact

// Rule 1: marketing routes stay Astryx-free.
for (const page of MARKETING_PAGES) {
  const src = read(join(ROOT, page));
  if (/astryx/i.test(src)) failures.push(`${page}: mentions astryx (marketing ban)`);
  if (/from ['"]\.\.?\/.*components\/ui/.test(src) || /components\/ui['"]/.test(src))
    failures.push(`${page}: imports the ui/ wrapper layer (marketing ban)`);
  if (/client:(load|idle|visible|media|only)/.test(src))
    failures.push(`${page}: mounts a React island (marketing pages ship zero React)`);
}

// Rules 2–5: scan all source.
for (const p of walk(join(ROOT, 'src'))) {
  const r = rel(p);
  const src = read(p);
  const importsAstryxJs =
    /from ['"]@astryxdesign\/core['"]/.test(src) || // named/default import
    /from ['"]@astryxdesign\/core\//.test(src) || // subpath import
    /require\(['"]@astryxdesign\/core['"]\)/.test(src) || // CJS require
    /^\s*import\s+['"]@astryxdesign\/core['"]/m.test(src) || // side-effect import
    /\bimport\s*\(\s*['"]@astryxdesign\/core['"]/.test(src); // dynamic import()
  const importsAstryxCss =
    /['"]@astryxdesign\/core\/reset\.css['"]/.test(src) ||
    /['"]@astryxdesign\/theme-neutral\/theme\.css['"]/.test(src) ||
    /styles\/astryx-twistor-tokens\.css/.test(src);

  if (importsAstryxJs && !(r.startsWith('src/components/ui/') || GRANDFATHERED.has(r))) {
    failures.push(`${r}: imports @astryxdesign JS outside the ui/ boundary`);
  }
  if (importsAstryxCss && !isInteractiveRoute(r)) {
    failures.push(`${r}: imports Astryx CSS outside surfaces/ or demo/ routes`);
  }
  if (isInteractiveRoute(r) && r.endsWith('.astro') && !/noindex/.test(src)) {
    failures.push(`${r}: interactive route must stay noindex`);
  }
  if (r.startsWith('src/components/ui/')) {
    const imports = [...src.matchAll(/from ['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const imp of imports) {
      if (
        imp !== 'react' &&
        !imp.startsWith('react/') &&
        imp !== '@astryxdesign/core' &&
        !imp.startsWith('./')
      ) {
        failures.push(`${r}: ui/ module imports '${imp}' (boundary allows react + @astryxdesign/core only)`);
      }
    }
  }
}

if (failures.length) {
  console.error('ASTRYX SCOPE GUARD: violations found\n');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('Astryx scope guard: OK — marketing routes Astryx-free, boundary intact.');
