/* Noctis (liviuschera.noctis) palette, lifted from the theme's own
   themes/noctis.json so the page and the editor agree on every colour.
   Loaded after the Tailwind CDN, which reads this global on startup. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink:    '#03171a', // deeper than the theme bg, for the area outside the tube
        panel:  '#052529', // editor.background
        bar:    '#041d20', // sideBar.background
        raised: '#073940', // focusBorder / raised surfaces
        fg:     '#b2cacd', // editor.foreground
        dim:    '#7ba7ae', // comments — lifted from Noctis' #5b858b, which sat
                           // at 4.4:1 here and lost strokes under the scanlines
        line:   '#8fc7cc', // lightened panel.border (#0e6671) for visible frames
        mint:   '#49e9a6', // strings
        pink:   '#df769b', // keywords
        cyan:   '#16a3b6', // functions
        amber:  '#e4b781', // variables
        violet: '#9d8cff', // numbers — lifted from #7060eb, too dark on this bg
        rust:   '#d67e5c', // types
      },
      fontFamily: {
        // Fira Code — loaded in index.html. Everything on the page inherits
        // this via the `font-mono` class on <body>, so this is the only place
        // the typeface is named.
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
