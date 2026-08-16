# roi-portfolio-sdet

Single-page SDET portfolio styled as a CRT terminal, using the
[Noctis](https://github.com/liviuschera/noctis) VS Code palette.

## Running it

Open `index.html` in a browser. There is no build step and nothing to install —
every script is a classic (non-module) script, so it works over `file://` as
well as from a server.

If you'd rather serve it:

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

> Tailwind, Vue and the Fira Code webfont load from CDNs, so the first paint
> needs a network connection. See [Going further](#going-further) to remove that.

## Layout

Four regions, matching `design/Layout.png`. On `lg` and up it's a 12-column,
2-row grid; below that everything stacks into one scrolling column.

```
┌────────┬───────────────────┬──────────────┐
│  nav   │       main        │              │
│  (2)   │        (6)        │     rail     │
├────────┴───────────────────┤     (4)      │
│          console           │  spans both  │
│            (8)             │     rows     │
└────────────────────────────┴──────────────┘
```

## Type

[Fira Code](https://github.com/tonsky/FiraCode) at weights 300–700, loaded from
Google Fonts in `index.html`. The family is named in exactly one place —
`fontFamily.mono` in `assets/js/tailwind.config.js` — and everything inherits it
from the `font-mono` class on `<body>`, so swapping typefaces is a one-line
change plus the `<link>`.

Ligatures are on (Fira Code's default), which is why `-->`, `!=` and `==` render
as single glyphs in the console and the code line. To turn them off:

```css
body { font-variant-ligatures: none; }
```

## Structure

```
index.html                    markup and the SVG filter definition
assets/
  css/
    theme.css                 page surface + panel primitives
    crt.css                   tube, scanlines, glass, flicker, fish-eye
  js/
    tailwind.config.js        Noctis palette as Tailwind colour tokens
    fisheye.js                builds the barrel displacement map
    app.js                    Vue app — state and behaviour only
content/
  portfolio.js                ← all copy lives here
design/
  Layout.png                  the original mockup
tests/                        self-contained Playwright project
  playwright.config.ts
  e2e/example.spec.ts
```

**To make it yours, edit `content/portfolio.js`.** Nothing else should need
touching. The content is currently placeholder — projects, metrics, pipeline
figures and "7 yrs" are invented scaffolding; only the email is real.

## The CRT effects

Each is toggleable at runtime from the display panel in the rail; defaults live
in the `crt` object in `assets/js/app.js`.

| Effect | How it works |
| --- | --- |
| scanlines | `repeating-linear-gradient` plus a slow drifting brightness sweep |
| flicker | irregular opacity keyframes on the tube |
| fish-eye | real barrel distortion via `feDisplacementMap` |

The fish-eye is the only non-obvious one. `fisheye.js` draws a displacement map
on a canvas — R channel as x-offset, G as y-offset, offset growing with radius
so the centre magnifies and the edges compress. The map is normalised so a
corner hits 0/255, which uses the full 8-bit range and gives the filter's
`scale` a concrete meaning: **corner displacement is `curve / 2` px**. The `r⁴`
term makes the bulge fall off harder at the rim, which is what reads as a
camera lens rather than a gentle bow.

Three constraints it imposes, all documented at their sites in the code:

- **Borders are 1.5px, not hairlines.** `feDisplacementMap` samples
  nearest-neighbour, so a 1px line snaps between pixel rows as it curves and
  breaks into dashes.
- **Nothing may animate continuously inside the filtered wrapper.** Any paint in
  there re-runs the whole filter across the entire surface, so an always-on
  animation costs a full re-raster per frame and reads as flicker. This is why
  the caret is held still while the filter is live and the clock ticks at minute
  resolution.
- **Click targets don't move with the pixels.** SVG filters don't affect hit
  testing, so at the default curvature the corners are ~19px out of register.
  Lower the curvature slider to reduce it.

It's gated to `min-width: 1024px`: below that the layout is one scrolling
column, and a filtered element that scrolls repaints its whole raster.

`prefers-reduced-motion` disables every animation.

## Tests

Playwright lives in `tests/` as its own npm project, so the static site root
stays free of `node_modules` and build tooling.

```sh
cd tests
npm install                 # first time
npm run install:browsers    # first time — downloads Chromium
npm test
```

| Script | |
| --- | --- |
| `npm test` | headless run |
| `npm run test:ui` | interactive UI mode |
| `npm run test:headed` | watch it drive a real browser |
| `npm run test:debug` | step through with the inspector |
| `npm run report` | open the last HTML report |

Specs live in `tests/e2e/`. There's one sample test to prove the wiring; it is a
starting point, not coverage.

Tests load the site straight off disk over `file://` — nothing to start, works
offline. `baseURL` is the project root, so specs navigate with
`page.goto('index.html')`. Swapping to a real server is a two-line config
change, documented in `tests/playwright.config.ts`.

Only Chromium is installed. The CRT effects lean on SVG filters and blend modes
that are worth checking cross-browser — run `npx playwright install firefox
webkit` and uncomment the extra projects in the config.

## Going further

To drop the CDNs and get offline support, real bundling and Vue SFCs, move this
to Vite:

```sh
npm create vite@latest . -- --template vue
npm i -D tailwindcss @tailwindcss/postcss postcss
```

`content/portfolio.js` and `assets/css/*` port over essentially unchanged; only
`app.js` and `index.html` need reshaping into components.
