# alip.dev

A single-page calling card. Static HTML, CSS, and a little JS — no build step
or runtime dependencies.

```
index.html          the two-sided card and project links
404.html            the custom not-found page
styles.css          layout, typography, themes, and print styles
script.js           flip, swipe, keyboard, and tilt interactions
_headers            Cloudflare Pages response headers
static/og.png       social preview image
static/favicon.png  favicon and touch icon
fonts/              the three font faces used by the card
resume.pdf          linked from the card
```

Run it locally with any static server:

```bash
python3 -m http.server 4321
```

The bundled Founders Grotesk files are evaluation fonts. Replace them with
licensed retail webfonts before publishing.

If the card's text or layout changes, regenerate `static/og.png` to match, or
the link preview will drift out of sync with the page.
