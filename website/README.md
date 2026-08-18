# Roi Mark Gamba — Portfolio (content site)

The content pages that the browser-native Playwright framework navigates. This
site has **no navigation and no JavaScript of its own** — the parent runner app
owns both. Each page here is what a spec reads once it lands.

Static HTML and one stylesheet. No build step, no dependencies, no network
requests.

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

## Structure

```
index.html  work.html  skills.html  projects.html  contact.html
assets/
  css/style.css   tokens, grid, record rows
  img/            beach.jpg + eight project thumbnails
```

## Palette

Dark editor theme. Surfaces run deepest to raised; accents follow syntax roles.

| Token | Value | Role |
|-------|-------|------|
| `--ink` | `#03171a` | outside the tube — page ground, CTA bands |
| `--panel` | `#052529` | editor.background — the reading surface |
| `--bar` | `#041d20` | sideBar.background — masthead, colophon |
| `--raised` | `#073940` | focusBorder / raised surfaces — tags |
| `--fg` | `#b2cacd` | editor.foreground — body text |
| `--dim` | `#7ba7ae` | comments — metadata, captions |
| `--line` | `#8fc7cc` | panel border — visible frames, headlines |
| `--mint` | `#49e9a6` | strings — affirmations, email underline |
| `--pink` | `#df769b` | keywords — section markers, arrows |
| `--cyan` | `#16a3b6` | functions — organisations, external links |
| `--amber` | `#e4b781` | variables — identifiers |
| `--violet` | `#9d8cff` | numbers — indices |
| `--rust` | `#d67e5c` | types — stack tags, bullet rules |

Internal hairlines derive from `--line` at 18% / 40% (`--rule`, `--rule-strong`)
so record separators stay quiet while frames stay visible. All text pairs clear
5:1 contrast against the surface behind it.

## Test hooks

Every meaningful element carries a `data-testid`, and each `<body>` carries a
`data-page` name:

`hero`, `congrats`, `headline`, `about`, `portrait`, `cta`, `experience`, `job`,
`education`, `skills`, `skill-group`, `projects`, `project`, `contact`, `email`.

## Content sources

- Work history, skills and education — `Roi Gamba _Resume.pdf`.
- Projects and thumbnails — `../roi-gamba-portfolio/index.html` and its
  `assets/`. Descriptions for the first three (Atlantis, TrustArc, Willis Towers
  Watson) are written from the résumé achievements; the source site listed only
  the company name there.
