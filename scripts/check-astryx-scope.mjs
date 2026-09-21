// Astryx scope guard (TW-150 adoption).
//
// Enforces the hard rule Justynn approved: Astryx is adopted for INTERACTIVE
// SURFACES ONLY. The marketing site never touches Astryx.
//
// Rules:
//   1. Marketing routes (src/pages/index.astro, src/pages/products/**) must not
//      mention astryx, import the ui/ wrapper layer, or mount React islands.
//   2. Astryx component imports ('@astryxdesign/core' JS, not CSS) may only
//      appear inside src/components/ui/** — the swizzle boundary — plus the
//      grandfathered TW-140 evaluation pilot (src/components/AstryxPilot.tsx).
//   3. Astryx CSS (reset/theme/tokens) may only be imported by routes under
//      src/pages/surfaces/** and src/pages/demo/**.
//   4. Those interactive routes must stay noindex + unlinked (noindex meta).
//   5. ui/ modules may only import react and '@astryxdesign/core'.
//
// Run: `npm run guard`. Non-zero exit = violation.
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const failures = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = walk(p, out);
    else if (/\.(astro|tsx?|mjs|cjs)$/.test(name)) out.push(p);
  }
  return out;
}
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');
const read = (p) => readFileSync(p, 'utf8');

const MARKETING_PAGES = [
  'src/pages/index.astro',
  ...walk(join(ROOT, 'src/pages/products')).map(rel),
];
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
    /from ['"]@astryxdesign\/core['"]/.test(src) ||
    /from ['"]@astryxdesign\/core\//.test(src) ||
    /require\(['"]@astryxdesign\/core['"]\)/.test(src);
  const importsAstryxCss =
    /['"]@astryxdesign\/core\/reset\.css['"]/.test(src) ||
    /['"]@astryxdesign\/theme-neutral\/theme\.css['"]/.test(src) ||
    /styles\/astryx-twistor-tokens\.css/.test(src);

  if (importsAstryxJs && !(r.startsWith('src/components/ui/') || GRANDFATHERED.has(r))) {
    failures.push(`${r}: imports @astryxdesign JS outside the ui/ boundary`);
  }
  if (importsAstryxCss && !/^src\/pages\/(surfaces|demo)\//.test(r)) {
    failures.push(`${r}: imports Astryx CSS outside surfaces/ or demo/ routes`);
  }
  if (/^src\/pages\/(surfaces|demo)\//.test(r) && r.endsWith('.astro') && !/noindex/.test(src)) {
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
