#!/usr/bin/env node
// Replica gate (TW-907): Sofia's frontend gate, step 7.
//
// Wraps the vendored replica CLI (local-twistor-replica skill, MIT,
// github.com/albertirgi/replica pinned at
// e01e6a86a56ea276d3f18e73fc931d06fe538782) and runs one compare round
// against a captured reference. Prints the four axis scores and exits
// with replica's own exit code: 0 pass, 1 not yet, 2 error.
//
// Usage:
//   node scripts/replica-gate.mjs <ref-dir> <clone url|file.html> [--selector <css>] [--level <l>]
//
// The replica CLI lives in the skill, not this repo. Override its
// location with REPLICA_CLI if the skill is vendored elsewhere.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const cli =
  process.env.REPLICA_CLI ||
  join(
    homedir(),
    'workspace/custom-skills/local-twistor-replica/upstream/scripts/replica.mjs',
  );

const [refDir, clone, ...rest] = process.argv.slice(2);
if (!refDir || !clone) {
  console.error(
    'usage: node scripts/replica-gate.mjs <ref-dir> <clone url|file.html> [--selector <css>] [--level <l>]',
  );
  process.exit(2);
}
if (!existsSync(cli)) {
  console.error(`replica CLI not found at ${cli} (set REPLICA_CLI)`);
  process.exit(2);
}

const run = spawnSync(
  process.execPath,
  [cli, 'compare', refDir, clone, ...rest],
  { stdio: 'inherit' },
);
if (run.status !== 0 && run.status !== 1) process.exit(run.status ?? 2);

// Surface the newest round's score.json next to the reference directory
// so the gate log carries the number, not just replica's prose.
const parent = join(refDir, '..');
const rounds = [];
for (let n = 1; n <= 8; n += 1) {
  const p = join(parent, `round-${n}`, 'score.json');
  if (existsSync(p)) rounds.push(JSON.parse(readFileSync(p, 'utf8')));
}
const last = rounds[rounds.length - 1];
if (last) {
  const axes = Object.entries(last.axes)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ');
  console.log(
    `replica-gate: round ${last.round} overall ${last.overall} — ${last.pass ? 'PASS' : 'NOT YET'} (${axes})`,
  );
}
process.exit(run.status);
