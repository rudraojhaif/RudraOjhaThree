# rudra_resume

DOOM-themed static portfolio for Rudra Ojha. No framework, no bundler — the whole
site is one self-contained `index.html` with inline CSS and JS.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire site (boot sequence, menu, console panels, status bar) |
| `favicon.ico` | Tab icon |
| `RudraPublic.pdf` | Resume, linked from the CONTACT section |
| `build.js` | Copies the files above into `dist/` and adds `.nojekyll` |
| `serve.js` | Zero-dependency local preview server |
| `deploy.js` | Commits to `main`, builds, pushes `dist/` to `gh-pages` |

## Commands

```bash
npm install       # only dependency is gh-pages
npm run dev       # http://localhost:5173
npm run build     # -> dist/
npm run deploy    # push main + publish dist/ to gh-pages
```

`.github/workflows/static.yml` runs on pushes to `gh-pages` and publishes the
branch contents to GitHub Pages.

## The E1M1 arena

The NEW GAME section hosts a small shooter drawn on a canvas over the console
box. The player sprite is baked from `PlayerFinal.aseprite` (the `Idle` and
`Aim*` tags only) and the demon from `demon.jpg`; both are inlined as base64,
so there are no extra files to deploy. Leaving the section calls `Game.stop()`,
which cancels the loop, drops every listener and removes the arena — re-entering
starts a clean run. `BEST` survives in `localStorage`. It is mouse-only, so it
stays off below 900px and on touch-only pointers.

All audio is synthesized with the Web Audio API — no sound files. `Sfx` builds
each effect from swept oscillators and filtered noise bursts; the CRT/SFX
buttons top-right toggle scanlines and sound, and the choice is remembered.

## Editing content

All copy lives in the `SECTIONS` array near the top of the `<script>` block in
`index.html`. Each entry is one menu item:

```js
{ id, label, hint, title, rate, body }
```

`label` is the menu text, `hint` is the small grey word beside it, `title` and
`rate` fill the console header bar, and `body` is the HTML shown in the console.
Adding a section to the array adds it to the menu, keyboard navigation and the
`#hash` routing automatically.
