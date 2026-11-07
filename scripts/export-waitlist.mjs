// Prepared by Twistor Holdings LLC.
// TW-942: admin export for the stored Twistor Social waitlist.
// Local filesystem access IS the admin credential for this path: run it
// on the host that holds the store, never expose the data file itself.
//
//   node scripts/export-waitlist.mjs --count          print signup count
//   node scripts/export-waitlist.mjs                  CSV to stdout
//   node scripts/export-waitlist.mjs --out waitlist.csv
//
// The count is the measurable seeding number for the Dec 15-30 push
// toward 500 onboarded accounts. Store path: WAITLIST_DATA_FILE or
// ./data/waitlist.jsonl (see src/lib/waitlist/waitlist-core.mjs).

import fs from 'node:fs';
import { createWaitlistStore, defaultDataFile, toCsv } from '../src/lib/waitlist/waitlist-core.mjs';

const args = process.argv.slice(2);
const store = createWaitlistStore(defaultDataFile());

if (args.includes('--count')) {
  console.log(store.count());
} else {
  const csv = toCsv(store.list());
  const outIdx = args.indexOf('--out');
  if (outIdx !== -1 && args[outIdx + 1]) {
    fs.writeFileSync(args[outIdx + 1], csv, 'utf8');
    console.log(`wrote ${store.count()} row(s) to ${args[outIdx + 1]}`);
  } else {
    process.stdout.write(csv);
  }
}
