/* ═══════════════════════════════════════════════════════════════════════════
   Local test runner — serves the site and streams a real Playwright run.

   Dev tool only: binds 127.0.0.1, runs one discovered spec, never ships.
     node tools/runner/server.js   →   http://localhost:5174
   ═══════════════════════════════════════════════════════════════════════════ */

const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT  = path.resolve(__dirname, '..', '..');
const TESTS = path.join(ROOT, 'tests');
const E2E   = path.join(TESTS, 'e2e');
const BIN   = path.join(TESTS, 'node_modules', '.bin', 'playwright');
const PORT  = Number(process.env.PORT) || 5174;

const SPEC_RE  = /\.spec\.(ts|js)$/;
const REPORTER = '--reporter=list,./reporters/steps.js';
const GENERATED = path.join(ROOT, 'content', 'runs.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
};

const ANSI = /\x1b\[[0-9;]*m/g;

/* The runnable set is read off disk rather than hardcoded, so dropping a spec
   into tests/e2e is enough to make it appear in the rail. A request still
   supplies a KEY, matched against this list — never a path or an argument. */
function discoverSuites() {
  let names = [];
  try { names = fs.readdirSync(E2E).filter(n => SPEC_RE.test(n)).sort(); } catch { return []; }

  return names.map(name => {
    let src = '';
    try { src = fs.readFileSync(path.join(E2E, name), 'utf8'); } catch { /* unreadable */ }

    /* A describe block names the suite, so it wins over the first test title.
       Modifiers sit in between (.serial, .only, .skip); test.describe.configure
       takes an options object rather than a title, and the required opening
       quote is what keeps it from matching. */
    const group = src.match(/^\s*test\.describe(?:\.\w+)*\s*\(\s*(['"`])(.+?)\1/m);

    /* Counted separately: `test.describe(` cannot match here, because after
       `test` this needs either a run modifier or the paren itself. */
    const titles = [...src.matchAll(/^\s*test(?:\.only|\.skip|\.fixme)?\s*\(\s*(['"`])(.+?)\1/gm)]
      .map(m => m[2]);

    return {
      key:   name.replace(SPEC_RE, ''),
      file:  `e2e/${name}`,
      label: (group && group[2]) || titles[0] || `e2e/${name}`,
      tests: titles.length,
      lines: src.split('\n'),
    };
  });
}

// The source is only wanted by the run stream; the listing stays light.
const listSuites = () =>
  discoverSuites().map(({ key, file, label, tests }) => ({ key, file, label, tests }));

/* Noctis palette classes, same ones defined in assets/js/tailwind.config.js. */
function toneFor(text) {
  if (/✘|✗|failed|error|Error:/i.test(text)) return 'text-pink';
  if (/✓|✔|passed/i.test(text))              return 'text-mint';
  if (/skipped|○/i.test(text))               return 'text-dim';
  return 'text-fg';
}

function send(res, code, msg) {
  res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(msg);
}

function sendJson(res, body) {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

/* The single in-flight run: { child, res, suite, started, lines, steps } */
let active = null;

const emit = (event, data) =>
  active && active.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

const since = () => Date.now() - active.started;

function runSuite(req, res, key) {
  const suite = key ? discoverSuites().find(s => s.key === key) : null;
  if (!suite) return send(res, 404, 'unknown suite');
  if (active)  return send(res, 409, 'a run is already in flight');

  res.writeHead(200, {
    'content-type':  'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache',
    connection:      'keep-alive',
  });

  /* suite.file comes from our own readdir, not from the request. */
  const child = spawn(BIN, ['test', suite.file, REPORTER], {
    cwd:   TESTS,
    shell: false,                            // argv array, never a shell string
    env: {
      ...process.env,
      /* FORCE_COLOR alone. Setting NO_COLOR as well makes Node emit a warning
         about the conflict, and that warning lands in the console panel. */
      FORCE_COLOR: '0',
    },
  });

  active = { child, res, suite, started: Date.now(), lines: [], steps: [] };
  emit('spec', { file: suite.file, lines: suite.lines });

  /* stdout and stderr share one buffer so interleaved output keeps its order. */
  let buf = '';
  const onChunk = chunk => {
    buf = buf + chunk;
    const parts = buf.split(/\r?\n/);
    buf = parts.pop();                       // trailing partial line
    for (const raw of parts) {
      const text = raw.replace(ANSI, '').trimEnd();

      /* Steps ride the same pipe as console output — the prefix from
         tests/reporters/steps.js is what keeps them out of the terminal. */
      if (text.startsWith('@@STEP')) {
        handleStep(text.slice(6));
        continue;
      }

      const line = { text, tone: toneFor(text), ms: since() };
      active.lines.push(line);
      emit('line', line);
    }
  };

  child.stdout.setEncoding('utf8').on('data', onChunk);
  child.stderr.setEncoding('utf8').on('data', onChunk);

  child.on('error', err =>
    emit('line', { text: `runner: ${err.message}`, tone: 'text-pink', ms: since() }));

  child.on('close', code => {
    if (buf.trim()) onChunk('\n');           // flush the last partial line
    const ms = since();
    record(code, ms);
    emit('done', { code, ms });
    res.end();
    active = null;
  });

  /* Tab closed mid-run: do not leave a Chromium behind. */
  req.on('close', () => { if (active && active.child === child) child.kill('SIGTERM'); });
}

function handleStep(json) {
  let ev;
  try { ev = JSON.parse(json); } catch { return; }   // a torn line is not fatal

  /* Only steps inside the spec on display, and drop the absolute path with it —
     content/runs.js is committed, and it should not carry a home directory. */
  if (!ev.file || !ev.file.endsWith(active.suite.file)) return;
  delete ev.file;

  ev.ms = since();
  active.steps.push(ev);
  emit('step', ev);
}

/* Parses the file written last time so other suites' recordings survive a run.
   The format is ours, so slicing between the outermost braces is enough. */
function readGenerated() {
  try {
    const text = fs.readFileSync(GENERATED, 'utf8');
    const data = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    return { suites: data.suites || [], runs: data.runs || {} };
  } catch {
    return { suites: [], runs: {} };
  }
}

/* The deployed site has no Node process, so every real run is recorded for it
   to replay. A classic script rather than JSON: content/runs.js loads over
   file:// too, matching how index.html already loads content/portfolio.js. */
function record(code, ms) {
  const data = readGenerated();

  data.suites = listSuites();                // keeps the rail list in step

  // A spec that has been deleted should not leave a recording behind.
  const live = new Set(data.suites.map(s => s.key));
  for (const key of Object.keys(data.runs)) if (!live.has(key)) delete data.runs[key];

  data.runs[active.suite.key] = {
    at: new Date().toISOString(),
    code, ms,
    lines: active.lines,
    steps: active.steps,
    spec:  { file: active.suite.file, lines: active.suite.lines },
  };

  fs.writeFileSync(
    GENERATED,
    '/* Generated by tools/runner/server.js on each local run. Do not edit. */\n' +
    `window.TESTS = ${JSON.stringify(data, null, 2)};\n`,
  );
}

function serveStatic(res, url) {
  const rel  = decodeURIComponent(url.pathname);
  const file = path.resolve(ROOT, '.' + (rel === '/' ? '/index.html' : rel));

  /* path.resolve has already collapsed any '..', so this containment check is
     the whole defence — and it runs before any read. */
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, 'forbidden');

  fs.readFile(file, (err, body) => {
    if (err) return send(res, 404, 'not found');
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/suites') return sendJson(res, listSuites());
  if (url.pathname === '/api/run')    return runSuite(req, res, url.searchParams.get('suite'));
  serveStatic(res, url);
}).listen(PORT, '127.0.0.1', () =>          // 127.0.0.1, never 0.0.0.0
  console.log(`runner → http://localhost:${PORT}`));
