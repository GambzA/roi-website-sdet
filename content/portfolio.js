/* ═══════════════════════════════════════════════════════════════════════════
   Portfolio content — every piece of copy on the page lives here.
   Edit this file to make the site yours; assets/js/app.js holds only behaviour
   and should not need touching.

   ⚠ Placeholder data. The projects, metrics, pipeline figures and "7 yrs" are
     invented scaffolding to give the layout something to hold. Only the email
     is real. Replace before publishing.

   `tone` / `bar` values are Tailwind classes from the Noctis palette defined
   in assets/js/tailwind.config.js.
   ═══════════════════════════════════════════════════════════════════════════ */

window.PORTFOLIO = {

  build: { version: '2.4.1', env: 'production' },

  /* Left rail nav. `id` drives which section the main panel renders;
     `file` is the filename shown in the main panel's header. */
  sections: [
    { id: 'overview',   label: 'overview',   badge: '01', file: 'about.md' },
    { id: 'browser',    label: 'browser',    badge: '02', file: 'chromium 1280×720' },
    { id: 'automation', label: 'automation', badge: '03', file: 'pipeline.yml' },
    { id: 'projects',   label: 'projects',   badge: '03', file: 'projects.json' },
    { id: 'toolbox',    label: 'toolbox',    badge: '04', file: 'stack.toml' },
    { id: 'contact',    label: 'contact',    badge: '05', file: 'contact.md' },
  ],

  facts: [
    { k: 'experience', v: '7 yrs', tone: 'text-mint' },
    { k: 'suites',     v: '12',    tone: 'text-cyan' },
    { k: 'languages',  v: '4',     tone: 'text-amber' },
  ],

  focus: [
    'End-to-end coverage for web + mobile, run on every PR',
    'Cutting CI wall-clock with sharding and smart test selection',
    'Flake triage: quarantine, root-cause, delete or fix',
    'Contract and load testing for service boundaries',
  ],

  /* `pass` doubles as the bar width and picks the bar colour:
     ≥99 mint, ≥95 amber, below that pink. */
  pipeline: [
    { name: 'unit',         tests: 842, time: '38s',    pass: 100 },
    { name: 'integration',  tests: 264, time: '2m 11s', pass: 99 },
    { name: 'e2e — web',    tests: 118, time: '6m 04s', pass: 97 },
    { name: 'e2e — mobile', tests: 44,  time: '8m 47s', pass: 93 },
    { name: 'contract',     tests: 16,  time: '12s',    pass: 100 },
  ],

  /* `stack` entries become the filter chips in the rail — they are collected
     and de-duplicated automatically, so no separate list to keep in sync. */
  projects: [
    { name: 'harness-core', year: '2025', stack: ['Playwright', 'TypeScript', 'Docker'],
      blurb: 'Shared E2E harness with parallel sharding and auto-retry quarantine. Cut suite wall-clock from 41m to 6m.' },
    { name: 'flake-radar', year: '2024', stack: ['Python', 'Grafana', 'Postgres'],
      blurb: 'Ingests every CI run, scores tests by instability, opens tickets for the worst offenders.' },
    { name: 'api-contracts', year: '2024', stack: ['Pact', 'Python', 'GitHub Actions'],
      blurb: 'Consumer-driven contract tests gating deploys across nine services.' },
    { name: 'mobile-lab', year: '2023', stack: ['Appium', 'Java', 'Docker'],
      blurb: 'Device-farm abstraction so the same suite runs on emulators locally and real devices in CI.' },
    { name: 'load-forge', year: '2023', stack: ['k6', 'TypeScript', 'Grafana'],
      blurb: 'Scenario-based load profiles with budgets that fail the build on p95 regression.' },
  ],

  toolbox: [
    { group: 'automation', tone: 'text-mint',
      items: ['Playwright', 'Cypress', 'Selenium', 'Appium', 'REST Assured'] },
    { group: 'languages', tone: 'text-pink',
      items: ['TypeScript', 'Python', 'Java', 'Go'] },
    { group: 'ci / infra', tone: 'text-cyan',
      items: ['GitHub Actions', 'Jenkins', 'Docker', 'Kubernetes'] },
    { group: 'observability', tone: 'text-amber',
      items: ['Grafana', 'Allure', 'OpenTelemetry', 'Sentry'] },
  ],

  contacts: [
    { label: 'email',    value: 'gambaroimark@gmail.com', href: 'mailto:gambaroimark@gmail.com' },
    { label: 'github',   value: '@roigamba',              href: '#' },
    { label: 'linkedin', value: '/in/roigamba',           href: '#' },
  ],

  metrics: [
    { k: 'tests',     v: '1,284', pct: 100, tone: 'text-fg',    bar: 'bg-cyan' },
    { k: 'pass rate', v: '99.2%', pct: 99,  tone: 'text-mint',  bar: 'bg-mint' },
    { k: 'coverage',  v: '87%',   pct: 87,  tone: 'text-amber', bar: 'bg-amber' },
    { k: 'flake',     v: '0.4%',  pct: 8,   tone: 'text-pink',  bar: 'bg-pink' },
  ],

  /* The console panel. `boot` is what sits there on load; `run` is replayed
     line by line when the run button is pressed, `ms` being the pause before
     each line lands. */
  console: {
    boot: [
      { text: '$ playwright test --reporter=list', tone: 'text-fg' },
      { text: 'ready. press run.',                 tone: 'text-dim' },
    ],
  },
};
