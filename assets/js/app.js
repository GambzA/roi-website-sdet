/* ═══════════════════════════════════════════════════════════════════════════
   App — state and behaviour only. All copy lives in content/portfolio.js.

   Depends (in load order, see index.html):
     Vue 3 global build · content/portfolio.js · content/runs.js
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Syntax highlighting ────────────────────────────────────────────────────
   A small tokeniser rather than a highlighting library: the page has no build
   step and loads nothing at runtime but Vue. The Noctis palette in
   assets/js/tailwind.config.js already names a colour per syntax role, so the
   script panel comes out matching the editor theme those colours came from. */
const TOKEN_CLASS = {
  comment: 'text-dim',
  string:  'text-mint',
  regex:   'text-mint',
  number:  'text-violet',
  keyword: 'text-pink',
  call:    'text-cyan',
  prop:    'text-amber',
  ident:   'text-fg/90',
  punct:   'text-fg/65',
  space:   '',
};

const KEYWORDS = /^(?:import|export|from|default|const|let|var|function|class|extends|new|return|await|async|if|else|for|of|in|while|do|try|catch|finally|throw|typeof|instanceof|this|null|undefined|true|false)$/;

const RULES = [
  ['comment', /^\/\/.*/],
  ['string',  /^`(?:\\.|[^`\\])*`?/],
  ['string',  /^'(?:\\.|[^'\\])*'?/],
  ['string',  /^"(?:\\.|[^"\\])*"?/],
  ['number',  /^\d[\d_.]*/],
  ['ident',   /^[A-Za-z_$][\w$]*/],
  ['space',   /^\s+/],
  ['punct',   /^[^\w\s]/],
];

/* Takes the spec as an array of source lines, returns an array of token arrays.
   Block comments carry across lines, which is why this walks the whole file
   rather than highlighting each line independently. */
function highlightSpec(lines) {
  const out = [];
  let inBlock = false;
  let prev = null;                    // last non-space token, for regex vs divide

  for (const line of lines) {
    const toks = [];
    let s = line;

    const push = (kind, text) => {
      toks.push({ t: text, c: TOKEN_CLASS[kind] });
      if (kind !== 'space') prev = { kind, text };
    };

    while (s) {
      if (inBlock) {
        const end = s.indexOf('*/');
        if (end === -1) { push('comment', s); s = ''; }
        else { push('comment', s.slice(0, end + 2)); s = s.slice(end + 2); inBlock = false; }
        continue;
      }

      if (s.startsWith('/*')) {
        const end = s.indexOf('*/', 2);
        if (end === -1) { push('comment', s); s = ''; inBlock = true; }
        else { push('comment', s.slice(0, end + 2)); s = s.slice(end + 2); }
        continue;
      }

      /* A slash opens a regex unless the previous token could end an
         expression — otherwise `a / b` would swallow the rest of the line. */
      if (s[0] === '/' && !s.startsWith('//')) {
        const divides = prev && (prev.kind === 'ident' || prev.kind === 'number' ||
                                 prev.text === ')' || prev.text === ']');
        const m = !divides && s.match(/^\/(?:\\.|\[(?:\\.|[^\]])*\]|[^/\\\n])+\/[gimsuy]*/);
        if (m) { push('regex', m[0]); s = s.slice(m[0].length); continue; }
      }

      let matched = false;
      for (const [kind, re] of RULES) {
        const m = s.match(re);
        if (!m || !m[0]) continue;

        let k = kind;
        if (kind === 'ident') {
          /* Call before prop: `page.goto(` is a method call and reads as a
             function in the theme, while `.length` is a plain member. */
          if (KEYWORDS.test(m[0]))                      k = 'keyword';
          else if (/^\s*\(/.test(s.slice(m[0].length))) k = 'call';
          else if (prev && prev.text === '.')           k = 'prop';
        }

        push(k, m[0]);
        s = s.slice(m[0].length);
        matched = true;
        break;
      }
      if (!matched) { push('punct', s[0]); s = s.slice(1); }
    }

    out.push(toks);
  }

  return out;
}

const { createApp } = Vue;

createApp({
  data() {
    // `console` is pulled out under a clearer name; the rest of the content
    // spreads straight onto the instance (sections, projects, metrics, …).
    const { console: term, ...content } = window.PORTFOLIO;

    return {
      active: 'overview',   // which section the main panel renders
      filter: '',           // stack chip currently filtering the project list
      running: false,       // console suite in progress
      mode:  'recorded',    // 'live' while a real run streams
      preview: 0,           // bumped to remount the browser iframe on each run
      clock: '',

      /* Suites come from the generated content/runs.js, so a statically hosted
         page has the list without a runner; a live runner refreshes it below. */
      suites: (window.TESTS && window.TESTS.suites) || [],
      suiteKey: '',         // suite selected in the explorer

      spec: null,           // { file, lines } of the suite on display
      steps: [],            // one entry per step, in execution order
      activeLine: 0,        // spec line currently executing, 0 for none

      term,
      log: term.boot.map(line => ({ ...line })),

      /* CRT effects, read by the class bindings on the tube. All three are off
         and have no controls at the moment; the filter itself is now entirely
         declarative (baked map in index.html, applied by assets/css/crt.css). */
      crt: { scanlines: false, flicker: false, fisheye: false },

      ...content,
    };
  },

  computed: {
    current() { return this.sections.find(s => s.id === this.active); },

    // Chips are derived from the projects themselves — no second list to sync.
    allStacks() { return [...new Set(this.projects.flatMap(p => p.stack))].sort(); },

    visibleProjects() {
      return this.filter ? this.projects.filter(p => p.stack.includes(this.filter)) : this.projects;
    },

    // The recording for the suite on display, if it has ever been run.
    recorded() {
      const runs = (window.TESTS && window.TESTS.runs) || {};
      return runs[this.suiteKey] || null;
    },

    lastRunAt() {
      const at = this.recorded && this.recorded.at;
      return at ? new Date(at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                : 'never';
    },

    specLines() { return (this.spec && this.spec.lines) || []; },

    specTokens() { return highlightSpec(this.specLines); },

    consoleStatus() {
      if (this.running) return this.mode === 'live' ? '◐ live run' : '◐ replaying';
      return this.mode === 'live' ? '◉ idle' : `◉ last run · ${this.lastRunAt}`;
    },
  },

  watch: {
    log() { this.$nextTick(() => { const t = this.$refs.term; if (t) t.scrollTop = t.scrollHeight; }); },
  },

  methods: {
    tick() {
      // Minute resolution, not seconds: this text sits inside the filtered
      // wrapper, so every change repaints the whole barrel surface. Vue skips
      // the re-render when the string is unchanged, making this ~1 paint/min.
      this.clock = new Date().toLocaleTimeString('en-GB',
        { hour12: false, hour: '2-digit', minute: '2-digit' });
    },

    /* The embedded site runs five endless animations — a marquee, two spins and
       a scroll cue. Sitting inside the barrel filter, every frame of those
       forces a full re-raster of the tube: measured 18fps against 60 with them
       stopped, and it persists for as long as the panel is shown. Only the
       infinite ones are paused; reveal and count-up animations finish by
       themselves and cost nothing once done.

       Same-origin because the runner serves both documents. Opened over
       file:// the embed is an opaque origin and contentDocument throws, which
       is why this is wrapped — there the animations simply keep running. */
    calmEmbed(e) {
      const stop = () => {
        try {
          const doc = e.target.contentDocument;
          if (!doc) return;
          doc.getAnimations()
            .filter(a => a.effect && a.effect.getTiming().iterations === Infinity)
            .forEach(a => a.pause());
        } catch { /* cross-origin embed — nothing to reach into */ }
      };
      stop();
      setTimeout(stop, 1500);   // catch any that start after load
    },

    /* Show a suite without running it: its source comes from the last recording,
       so an unrun spec simply has none until the runner produces one. */
    selectSuite(key) {
      if (this.running) return;
      this.suiteKey   = key;
      this.steps      = [];
      this.activeLine = 0;
      this.spec       = this.recorded ? this.recorded.spec : null;
    },

    async runSuite(key) {
      if (this.running) return;

      const target = key || this.suiteKey || (this.suites[0] && this.suites[0].key);
      if (!target) return;                    // nothing discovered, nothing to run

      this.selectSuite(target);
      this.running = true;
      this.active  = 'browser';   // put the page under test in front for the run
      this.log     = [];
      this.preview++;             // reload the embed so it matches what is tested

      try {
        const live = await this.streamLive(target);
        if (!live) await this.replayRecorded();
      } finally {
        this.running = false;
      }
    },

    /* Resolves true if a local runner answered. False means no server is
       listening, and the caller falls back to the recorded run. */
    streamLive(suite) {
      return new Promise(resolve => {
        let opened = false;
        const es = new EventSource(`/api/run?suite=${encodeURIComponent(suite)}`);

        es.onopen = () => { opened = true; this.mode = 'live'; };

        es.addEventListener('line', e => this.log.push(JSON.parse(e.data)));

        es.addEventListener('spec', e => {
          const spec = JSON.parse(e.data);
          if (spec) this.spec = spec;         // keep the last good one otherwise
        });

        es.addEventListener('step', e => this.applyStep(JSON.parse(e.data)));

        es.addEventListener('done', e => {
          const { code, ms } = JSON.parse(e.data);
          const secs = (ms / 1000).toFixed(1);
          this.log.push(code === 0
            ? { text: `suite passed in ${secs}s`, tone: 'text-mint' }
            : { text: `suite failed (exit ${code}) in ${secs}s`, tone: 'text-pink' });
          es.close();
          resolve(true);
        });

        /* EventSource reconnects forever on its own, so close it by hand. An
           error before onopen means nothing is listening — fall back quietly. */
        es.onerror = () => {
          es.close();
          if (opened) this.log.push({ text: 'runner: connection lost', tone: 'text-pink' });
          resolve(opened);
        };
      });
    },

    /* One code path for live and recorded steps: `begin` lights the line up,
       `end` stamps the outcome on the entry it opened. */
    applyStep(ev) {
      if (ev.phase === 'begin') {
        this.activeLine = ev.line;
        this.steps.push({ title: ev.title, line: ev.line, status: 'running' });
        return;
      }
      const open = this.steps.filter(s => s.line === ev.line && s.status === 'running').pop();
      if (open) open.status = ev.error ? 'failed' : 'passed';
    },

    /* Console lines and steps replay on one timeline at the pace the run
       actually had, with long gaps clamped so a slow suite is not a slow demo. */
    async replayRecorded() {
      this.mode = 'recorded';
      const rec = this.recorded;
      if (!rec) {
        this.log.push({ text: 'no recorded run for this spec — start the local runner', tone: 'text-dim' });
        return;
      }
      if (rec.spec) this.spec = rec.spec;

      // Recordings made before ms stamps existed fall back to a fixed cadence.
      const stamp = (item, i) => (typeof item.ms === 'number' ? item.ms : i * 90);

      const timeline = [
        ...rec.lines.map((l, i) => ({
          ms: stamp(l, i),
          run: () => this.log.push({ text: l.text, tone: l.tone }),
        })),
        ...(rec.steps || []).map((s, i) => ({
          ms: stamp(s, i),
          run: () => this.applyStep(s),
        })),
      ].sort((a, b) => a.ms - b.ms);

      let clock = 0;
      for (const ev of timeline) {
        await new Promise(r => setTimeout(r, Math.max(0, Math.min(ev.ms - clock, 900))));
        clock = ev.ms;
        ev.run();
      }
    },

  },

  async mounted() {
    // The app is on screen — the last boot milestone. See the script in index.html.
    if (window.__boot) window.__boot(100);

    this.tick();
    this._clock = setInterval(this.tick, 1000);

    /* Nothing is selected on load — the script panel stays empty until a test
       is picked, matching the console sitting at "ready. press run." */

    /* Served by the runner, so specs added since the last recording show up
       too. Over file:// this fetch simply fails and the recorded list stands. */
    if (location.protocol.startsWith('http')) {
      try {
        const live = await fetch('/api/suites').then(r => r.json());
        if (Array.isArray(live) && live.length) {
          this.suites = live;
          // Only drop a selection that has disappeared; never pick one for the user.
          if (this.suiteKey && !live.some(s => s.key === this.suiteKey)) this.selectSuite('');
        }
      } catch { /* no runner — carry on with what was recorded */ }
    }
  },

  unmounted() { clearInterval(this._clock); },
}).mount('#app');
