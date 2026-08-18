# Roi Mark Gamba — Portfolio (content site)

The content pages that the browser-native Playwright framework navigates. This
site has **no navigation and no JavaScript of its own** — the parent runner app
owns both. Each page here is what a spec reads once it lands.

Five static HTML pages styled entirely with Tailwind utility classes. No
JavaScript, no network requests.

## Pages

| File | Content |
|------|---------|
| [index.html](index.html) | Intro and portrait |
| [work.html](work.html) | Four roles + education |
| [skills.html](skills.html) | Six skill disciplines |
| [projects.html](projects.html) | Eight projects, one continuous list |
| [contact.html](contact.html) | Email |

## Run it

```bash
python3 -m http.server 4173
# or
npx serve .
```

Then open http://localhost:4173. Opening the files over `file://` works too —
nothing here needs a server.

## Styling

Every visual decision lives in the markup as a Tailwind utility. There are no
component classes and no hand-authored stylesheet: `src/input.css` holds the
theme the utilities are generated from, plus the two global behaviours that
have no element to hang a class off (`:focus-visible`, reduced motion).

```
index.html  work.html  skills.html  projects.html  contact.html
src/input.css     theme tokens + base layer — the only CSS authored by hand
dist/styles.css   generated, and committed (see below)
assets/img/       beach.jpg + eight project thumbnails
```

### Build

```bash
npm install
npm run build     # one-shot, minified
npm run watch     # rebuild on change
```

`dist/styles.css` is **committed on purpose**. Render serves this directory
statically with no build command, so an uncompiled change never reaches the
deployed site — rebuild and commit alongside any edit to `src/input.css` or to
the classes used in the pages.

## Palette

Dark editor theme. Surfaces run deepest to raised; accents follow syntax roles.
Each token is defined once in the `@theme` block of `src/input.css`, which makes
it both a CSS variable and a utility — `--color-mint` gives you `text-mint`,
`bg-mint`, `border-mint`.

| Token | Value | Role |
|-------|-------|------|
| `--color-ink` | `#03171a` | outside the tube — page ground, CTA bands |
| `--color-panel` | `#052529` | editor.background — the reading surface |
| `--color-bar` | `#041d20` | sideBar.background — masthead, colophon |
| `--color-raised` | `#073940` | focusBorder / raised surfaces — tags |
| `--color-fg` | `#b2cacd` | editor.foreground — body text |
| `--color-dim` | `#7ba7ae` | comments — metadata, captions |
| `--color-line` | `#8fc7cc` | panel border — visible frames, headlines |
| `--color-mint` | `#49e9a6` | strings — affirmations, email underline |
| `--color-pink` | `#df769b` | keywords — section markers, arrows |
| `--color-cyan` | `#16a3b6` | functions — organisations, external links |
| `--color-amber` | `#e4b781` | variables — identifiers |
| `--color-violet` | `#9d8cff` | numbers — indices |
| `--color-rust` | `#d67e5c` | types — stack tags, bullet rules |

Internal hairlines derive from `--color-line` at 18% / 40% (`--color-rule`,
`--color-rule-strong`) so record separators stay quiet while frames stay
visible. All text pairs clear 5:1 contrast against the surface behind it.

### Scales

Type is fluid and registered under `--text-*`, so `text-body` and `text-lede`
are real utilities rather than arbitrary values. Reading sizes step up again
past 1440px by overriding those same variables — every utility that reads them
follows, with no second scale. Rhythm is registered under `--spacing-*`:
`px-pad`, `gap-gap`, `py-band`.

The layout turns on a single breakpoint, `--breakpoint-wide` (900px). Below it
every record collapses to one column; above it `wide:col-span-*` restores the
12-column reading order.

## Test hooks

Every meaningful element carries a `data-testid`, and each `<body>` carries a
`data-page` name:

`hero`, `congrats`, `headline`, `about`, `portrait`, `cta`, `experience`, `job`,
`education`, `skills`, `skill-group`, `projects`, `project`, `contact`, `email`.

Selectors should hang off these, not off classes — the classes are utilities and
will change whenever the design does.

## Content sources

- Work history, skills and education — `Roi Gamba _Resume.pdf`.
- Projects and thumbnails — `../roi-gamba-portfolio/index.html` and its
  `assets/`. Descriptions for the first three (Atlantis, TrustArc, Willis Towers
  Watson) are written from the résumé achievements; the source site listed only
  the company name there.
