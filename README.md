# alip.dev

A single-page calling card. Static HTML, CSS, and a little JS — no build step,
no dependencies, no webfonts.

```
index.html      the card + the projects dialog
styles.css      all styles (Helvetica, one colour, light/dark)
script.js       dialog behaviour + the debug panel
_headers        Cloudflare Pages — serves resume.pdf inline
static/og.png   link-preview image (referenced by the og:image meta tag)
resume.pdf      linked from the card
```

Run it locally with any static server:

```bash
python3 -m http.server 4321
```

## Before shipping

There's a **debug panel** pinned to the bottom-right (the theme cycler). It's
marked with `DEBUG PANEL` comments in `index.html`, `styles.css`, and
`script.js` — delete all three blocks when it's no longer useful.

Theme follows the system preference by default; the toggle only overrides it
locally via `localStorage`.

If the card's text or layout changes, regenerate `static/og.png` to match, or
the link preview will drift out of sync with the page.
