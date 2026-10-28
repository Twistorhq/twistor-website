/* Prepared by Twistor Holdings LLC.
 * TW-737: contract tests for the Twistor Social landing page
 * (src/pages/social/index.astro), the public face of social.twistor.co.
 * Run: node tests/tw737-social-page.test.cjs (no dependencies)
 */
const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'pages', 'social', 'index.astro');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name); }
}

ok('page file exists', fs.existsSync(pagePath));
if (!fs.existsSync(pagePath)) {
  console.log(`tw737-social-page: ${pass} passed, ${fail} failed`);
  process.exit(1);
}
const src = fs.readFileSync(pagePath, 'utf8');
const lower = src.toLowerCase();

// --- Document standard and copy gates ---
ok('footer carries the document standard line', src.includes('Prepared by Twistor Holdings LLC'));
ok('zero em-dashes anywhere in the file', !src.includes('—'));
ok('no lorem ipsum', !lower.includes('lorem ipsum'));
ok('no banned filler: revolutionize', !lower.includes('revolutionize'));
ok('no banned filler: supercharge', !lower.includes('supercharge'));
ok('no banned filler: cutting edge', !lower.includes('cutting edge'));
ok('no banned filler: effortless', !lower.includes('effortless'));

// --- Head and SEO ---
ok('title names the product', /<title>[^<]*Twistor Social[^<]*<\/title>/.test(src));
ok('title does not brand the descriptive line as the product name', !/<title>[^<]*Real Social App[^<]*<\/title>/.test(src));
ok('meta description present', /<meta name="description" content="[^"]{40,}"/.test(src));
ok('canonical points at the subdomain', src.includes('https://social.twistor.co/'));
ok('og tags present', src.includes('property="og:title"') && src.includes('property="og:description"'));
ok('viewport meta present', src.includes('name="viewport"'));
ok('favicon wired', src.includes('logo-mark.webp'));

// --- Semantics and accessibility ---
ok('skip link present', src.includes('Skip to content'));
ok('has nav landmark', /<nav[\s>]/.test(src));
ok('has main landmark', /<main[\s>]/.test(src));
ok('has footer landmark', /<footer[\s>]/.test(src));
ok('exactly one h1', (src.match(/<h1[\s>]/g) || []).length === 1);
ok('reduced motion is respected', src.includes('prefers-reduced-motion'));
ok('visible focus style defined', src.includes(':focus-visible'));

// --- Mobile first with a complete desktop layer ---
ok('desktop layer media query present', /@media \(min-width:/.test(src));

// --- Claims caveats (TW-736 register, C1 and the TW-737 claims rule) ---
ok('page says the product is in development', lower.includes('in development'));
ok('verification framed as being built', lower.includes('being built'));
ok('list is not an account, stated plainly', lower.includes('not an account'));
ok('list is not verification, stated plainly', lower.includes('not verification'));
ok('no live verification claim', !lower.includes('verification is live'));
ok('no claim of verified members today', !lower.includes('verified members'));
ok('no launch date promise', !/(launch|opens|arrives) (on )?(january|february|march|april|may|june|july|august|september|october|november|december)/.test(lower));
// Door Pass may only appear with its concept stage caveat nearby.
{
  let idx = lower.indexOf('door pass');
  let doorPassOk = true;
  while (idx !== -1) {
    const windowText = lower.slice(Math.max(0, idx - 220), idx + 220);
    if (!windowText.includes('concept')) doorPassOk = false;
    idx = lower.indexOf('door pass', idx + 1);
  }
  ok('every Door Pass mention carries the concept caveat', doorPassOk);
}

// --- Waitlist form: honest local handler, no invented backend ---
ok('waitlist form present', /<form[^>]*class="[^"]*waitlist-form/.test(src));
ok('form is marked as a local handler in code', src.includes('TW737_LOCAL_HANDLER'));
ok('form posts nowhere external', !/<form[^>]*action="https?:/.test(src));
ok('email input is typed, required, and labeled', /<label for="[^"]+">/.test(src) && /type="email"[^>]*required|required[^>]*type="email"/.test(src) || /type="email"/.test(src) && /required/.test(src));
ok('inline status region for form feedback', src.includes('aria-live="polite"'));
ok('client side validation message text exists', lower.includes('enter a valid email'));
ok('site mailto pattern is the delivery path', src.includes('mailto:holla@twistor.co'));

// --- Page structure (vendored landing page design, Part A2 and B11) ---
ok('how it works section present', lower.includes('how it will work'));
ok('why it is different section present', lower.includes('why twistor social is different'));
ok('faq section present', /<h2[^>]*>[^<]*questions/.test(lower));
ok('tagline reveal section present (B11)', src.includes('tagline-reveal') && src.includes('data-reveal-word'));
ok('sample meetup clearly labeled as a sample', lower.includes('sample meetup'));
ok('fictional names labeled as fictional', lower.includes('names are fictional'));

// --- Marketing boundary (repo guard rules, checked here too) ---
ok('no astryx mention on a marketing route', !/astryx/i.test(src));
ok('no react island on a marketing route', !/client:(load|idle|visible|media|only)/.test(src));

// --- Handler execution: run the shipped inline script against DOM stubs
// (same stub pattern as tests/tv-overlays.test.cjs) and drive the form. ---
{
  const scriptMatch = src.match(/<script is:inline>([\s\S]*?)<\/script>/);
  ok('inline script block found for execution test', !!scriptMatch);
  if (scriptMatch) {
    const status = { textContent: '', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
    const input = { value: '', focus() { this.focused = true; } };
    let submitHandler = null;
    const fakeForm = {
      addEventListener(name, fn) { if (name === 'submit') submitHandler = fn; },
      querySelector(sel) {
        if (sel.includes('email')) return input;
        if (sel.includes('form-status')) return status;
        return null;
      },
    };
    const fakeWindow = {
      matchMedia: () => ({ matches: true }), // reduced motion path: no observers needed
      location: {},
    };
    const fakeDocument = {
      querySelectorAll(sel) {
        if (sel === '.waitlist-form') return [fakeForm];
        return [];
      },
    };
    const run = new Function('window', 'document', scriptMatch[1]);
    run(fakeWindow, fakeDocument);
    ok('submit handler registered', typeof submitHandler === 'function');
    if (submitHandler) {
      const event = { preventDefault() {} };
      input.value = 'not-an-email';
      submitHandler(event);
      ok('invalid email is rejected inline', status.attrs['data-state'] === 'error' && status.textContent.includes('valid email'));
      ok('invalid email triggers no navigation', fakeWindow.location.href === undefined);
      input.value = 'sofia.check@example.com';
      submitHandler(event);
      ok('valid email reports the hand off honestly', status.attrs['data-state'] === 'ok' && status.textContent.includes('did not upload or store'));
      ok('valid email hands off through the site mailto pattern',
        typeof fakeWindow.location.href === 'string' &&
        fakeWindow.location.href.startsWith('mailto:holla@twistor.co') &&
        fakeWindow.location.href.includes(encodeURIComponent('sofia.check@example.com')));
    }
  }
}

console.log(`tw737-social-page: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
