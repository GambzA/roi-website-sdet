/* ═══════════════════════════════════════════════════════════════════════════
   Publishes the local recording as the snapshot the deployed site replays.

     node tools/publish-runs.js      content/runs.js → content/runs.seed.js

   content/runs.js is rewritten by every local run and is gitignored, so it does
   not churn the diff. The seed is committed, and is deliberately a manual step:
   it is the moment you choose which run visitors see.
   ═══════════════════════════════════════════════════════════════════════════ */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FROM = path.join(ROOT, 'content', 'runs.js');
const TO   = path.join(ROOT, 'content', 'runs.seed.js');

let src;
try {
  src = fs.readFileSync(FROM, 'utf8');
} catch {
  console.error('no content/runs.js — start the runner and run a suite first');
  process.exit(1);
}

// Drop the generator's header line and give the seed its own.
const body = src.replace(/^\/\*[^\n]*\*\/\n/, '');

fs.writeFileSync(
  TO,
  '/* Published snapshot — this is what the deployed site lists and replays,\n' +
  '   since a static host runs no runner. Refresh with:\n' +
  '     node tools/publish-runs.js\n' +
  '   Committed on purpose; content/runs.js beside it is local-only. */\n' +
  body,
);

const runs = Object.keys(JSON.parse(
  body.slice(body.indexOf('{'), body.lastIndexOf('}') + 1),
).runs || {});

console.log(`published ${runs.length} recorded run(s): ${runs.join(', ') || '(none)'}`);
