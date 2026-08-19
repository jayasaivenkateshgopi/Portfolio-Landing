---
name: testing-portfolio-landing
description: How to run and browser-test the Portfolio-Landing static site (color engines, custom cursor) locally, including regression comparison against an older revision.
---

# Testing Portfolio-Landing

Pure static site: no build, no backend, no credentials, no env vars.

## Serving
```bash
cd <repo> && python3 -m http.server 8123    # open http://localhost:8123/index.html
```
For a "before vs after" comparison, serve a second revision from a git worktree on another port:
```bash
git worktree add /tmp/pl-old <sha> && cd /tmp/pl-old && python3 -m http.server 8124
```
`git checkout <other-sha>` inside the worktree swaps the served revision live (hard-reload the tab
with ctrl+shift+r; no server restart needed). Verify the served file content with
`curl -s localhost:<port>/js/tint-engine.js | head` before trusting a "broken/fixed" baseline —
which revision is actually broken may not be the one described (e.g. the parent of a fix PR may
already contain the fix from a sibling PR).

## Known pre-existing noise (not regressions)
`css/styles.css` references `fonts/fonts.css` and the page references `favicon.png`; neither
exists, so every load logs two 404s. Any assertion about "zero console errors" should be scoped to
JS errors/warnings and these 404s called out explicitly.

## What to check for the color engines
- Script order in index.html: `utils.js` → `tint-engine.js` → `text-color-engine.js` → `cursor.js`;
  the engines run inside `onReady(...)`, so assert after DOMContentLoaded.
- Tint: `document.querySelector('.bg-blue-10').style.backgroundColor` must be `rgba(0, 31, 63, 0.1)`
  (`--clr-blue: 0, 31, 63` in css/styles.css, 10% opacity).
- Text colors: index.html ships NO real `text-<color>` class (only `text-uppercase` / `text-right`
  utilities), so the live page can only prove "utilities are left alone". To prove colors are
  applied, add a temporary harness HTML in the repo root that loads `js/utils.js` +
  `js/text-color-engine.js` with e.g. `text-red`, `text-blue-50`, `text-uppercase`,
  `text-ghost-20` elements, then assert inline `style.color` values
  (`rgb(255, 0, 0)` / `rgba(0, 31, 63, 0.5)` / empty). `applyTextColors` is NOT exposed on
  `window`, so it cannot be re-invoked from the console — the harness page is the way. Delete the
  harness file afterwards.
- `applyColorClasses` warns via `console.warn` only for classes that carry an opacity suffix and
  have no `--clr-*` variable; label defaults to the prefix (`bg:` / `text:`).

## Custom cursor
`js/cursor.js` appends `.cursor-dot`, `.cursor-outline`, `.button-border` to the body. Hover
targets are `button, .btn-cmn` (the two CTAs: `Explore Portfolio`, `View Services`).
Test with real `mouse_move` actions, then assert:
- hovering a CTA → `.cursor-outline` has class `hover-button`, inline `width`/`height` equal to the
  button rect (~256x66 / ~235x66 at 1024px-wide screenshots), `borderRadius: 50px`,
  `.cursor-dot` inline `opacity: 0`;
- moving away → those inline props are back to `''` and dot `opacity: 1`.
Note screenshot coordinates are scaled: inline `left`/`top` px values on the dot are ~1.56x the
screenshot x coordinate, so compare relatively, not exactly.

## Devin Secrets Needed
None.
