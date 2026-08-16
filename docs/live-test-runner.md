# Live test runner

The TEST EXPLORER lists every spec in `tests/e2e`. Running one spawns a real Playwright
process and streams its output: console text into the CONSOLE panel, step-by-step progress
into the TEST SCRIPT rail.

```
npm run dev        # http://localhost:5174
```

Open that URL rather than the file directly, then press run on a spec.

## Adding a test

Drop a `*.spec.ts` file into `tests/e2e/`. That is the whole procedure — nothing to
register. The runner discovers specs by reading the directory, so a new file appears in the
rail on the next page load, with its first `test(...)` title as the label and a count of
the tests it holds.

Adding a test to an existing spec needs nothing at all; the label and count refresh on the
next run.

## How it fits together

```
browser (Vue)                tools/runner/server.js            playwright
─────────────                ──────────────────────            ──────────
on load ────── GET /api/suites ▶ readdir(tests/e2e) ──────────▶ [ {key, label, tests} ]
click run ──── GET /api/run ──▶ spawn(playwright test <spec>) ─▶ chromium
   ◀─ SSE: event: spec ───────┤   reporter=list,./reporters/steps.js
                               ◀──── stdout, line by line ──────
   ◀─ SSE: event: line ────────┤     (plain output)
   ◀─ SSE: event: step ────────┤     (@@STEP-prefixed)
   ◀─ SSE: event: done ────────┤
                               └───▶ content/runs.js
```

Browser JavaScript cannot spawn a process, which is the only reason a server exists here.
It serves the site as well as the API so both share an origin and there is no CORS.

The BROWSER panel is a plain `<iframe>` pointed at `website/index.html` — the same page the
suite navigates to. It reloads on each run, but it is a live embed rather than a capture of
the test session.

## Two modes

| | Local (runner up) | Deployed / `file://` |
|---|---|---|
| EXPLORER | Specs discovered live off disk | The list carried in the last recording |
| CONSOLE | Real stdout, streaming as tests finish | Replays that spec's last real run |
| TEST SCRIPT | Live step highlighting | Replays the same steps, in time |
| BROWSER | Live embed of the page under test | Same live embed |

The fallback is automatic: `streamLive()` in [assets/js/app.js](../assets/js/app.js) opens an
`EventSource`, and an error before `onopen` means no runner is listening, so it replays
instead. Render serves this site statically with no Node process, so visitors always get
the recorded path.

Recorded lines and steps replay on one timeline at the pace the run actually had, with gaps
longer than 900ms clamped so a slow suite is not a slow demo.

## The script panel

[tests/reporters/steps.js](../tests/reporters/steps.js) is a Playwright reporter running
alongside `list`. Playwright hands `onStepBegin`/`onStepEnd` a step object carrying
`location.line` — the exact line in the spec — and the reporter writes each one to stdout
as a single `@@STEP{…}` line. The runner pulls those out of the same pipe the console text
arrives on, so nothing extra has to be wired between the processes.

Steps outside the spec being run are dropped, and the absolute path is stripped before
recording — `content/runs.js` is committed and should not carry a home directory.

Only `test.step`, `expect`, and `pw:api` categories are shown; fixture and hook steps are
plumbing.

## Generated file

`content/runs.js` is rewritten on every run and is **committed**, because it is what the
deployed site lists and replays:

```js
window.TESTS = {
  suites: [ { key, file, label, tests } ],
  runs: {
    home: { at, code, ms, lines: [{ text, tone, ms }], steps: [{ phase, title, line, ms }],
            spec: { file, lines: [ '…source…' ] } },
  },
};
```

A classic script rather than JSON, so the page still works opened straight off disk over
`file://`, where `fetch` of a local file is blocked.

Each run updates only its own entry, so other specs keep their recordings. A spec deleted
from `tests/e2e` has its recording pruned on the next run.

## Constraints

The endpoint exists to execute a command, so these are the design:

- Binds `127.0.0.1` only.
- A request supplies a **key**, never a path or an argument. The key is matched against the
  list built by reading `tests/e2e`, and the spec path handed to `spawn` comes from that
  readdir — not from the request.
- `spawn` with an argv array and `shell: false`.
- Static serving is confined to the repo root.
- **Not deployable.** Render serves static files only; leave `website/render.yaml` alone.

## Known limits

- **The embed is not the test session.** It shows the page in its normal state, not the
  browser Playwright is driving. A CDP screencast was tried and rejected: frames only
  arrive on repaint, so a sub-second test against a static page yields one or two
  half-painted images.
- **One run at a time.** A second concurrent request gets a 409, which reaches
  `EventSource` as a connection error before `onopen` — so that tab falls back to the
  replay rather than reporting "busy".
- A spec that has never been run locally has no recording, so on the deployed site it
  appears in the list but replays nothing.
