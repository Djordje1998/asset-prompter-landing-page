# Asset Prompter landing page

The landing page of [Asset Prompter](https://github.com/Djordje1998/asset-prompter). The app lives in its own repository; this one holds only the page.

A static page: `index.html`, `styles.css`, `main.js` and the `assets/` folder. There is no build step and nothing here depends on the app's repository, so any static host can serve this folder as it is. Edit these files directly.

The hero's logos sit in glass cubes, surfaces catch light under the pointer, and each section arrives once when it is first seen.

## Preview

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 4790 --bind 127.0.0.1
```

## Hosting

GitHub Pages serves the root of the `main` branch (Settings, Pages, Deploy from a branch). The empty `.nojekyll` file tells it to publish the files as they are. The page is then at `https://djordje1998.github.io/asset-prompter-landing-page/`.

## Sections, in order

Sections alternate between the page colour and the band colour (`band` on the `<section>`). The footer takes the colour the last section does not have (`is-band` on the footer when the last section is plain). Keep that rhythm when a section is added or removed.

| # | Section | id | Ground |
| --- | --- | --- | --- |
| 1 | Hero: the glass cubes and the thread, and the message to paste into an agent | | page |
| 2 | One picture, six steps | `loop` | band |
| 3 | To your agent, the same steps as an MCP server | `mcp` | page |
| 4 | Without it, you are the courier | `why` | band |
| 5 | What the folder gives your agent | `agent` | page |
| 6 | What it is good for | `uses` | band |
| 7 | It doesn't generate anything | `tradeoffs` | page |
| 8 | Two ways to install it: your agent, or by hand | `install` | band |
| 9 | Before you try it | `questions` | page |
| 10 | Give your agent a way to ask for pictures | | band |

Each later section makes one point with one picture and little text: a heading, at most two sentences, and a picture or a short list. Longer explanations belong under "Before you try it".

## How the look is built

`styles.css` is numbered in the order of the list at its top. The colour tokens, the three fonts, the pixel icons and the hard offset shadows follow the app (`src/web/styles.css` in the app's repository); the page's own tokens are `--hi`, `--hi-strong` (the lit inner edge of a surface), `--shadow-soft` (a soft shadow under the hard one), `--grain` and two easings.

### The glass cubes in the hero

Each agent and generator is a cube made of markup, so it stands without the script:

```
li > .cube > .cube-body > i.f.f-back, .f-bottom, .f-left, .f-right, i.cube-glow, span.cube-core > img, i.f.f-top, i.f.f-front
```

- `.cube-body` is a real 3D box (`transform-style: preserve-3d`). `--s` is its edge and `--p` the perspective, both set on `.hub`; `--rx` and `--ry` are the angles it rests at. Agents are violet and turned to face right, generators mustard and turned to face left.
- The product's logo is the real file from `assets/logos/`, on a white plate (`.cube-core`) in the middle of the cube. If the file is missing, the plate shows the two letters in `data-letters`.
- The "any agent" and "any tool" items (`li.is-any`, shown only in the narrow layouts) are the dashed outline of a cube.
- Layouts: from 1100px the cubes float beside the hero at the place given by `--x` and `--y` on each `li`. Below that they stand in a row; below 600px the eight agents stand in two rows of four, the lower row moved half a step along so the upper row's wires pass between its cubes.

`main.js` (the last block, "the hub") does the rest:

- It draws the ground in `svg.hub-wires`: each cube's hard shadow, a wire from the middle of each cube to the folder, and the thread. The wire is under the cube, so it is seen through the glass.
- With motion allowed it makes the cubes bob (wide layout only), turns each cube a little toward the pointer (`face()`; cubes near the pointer answer most; mouse and pen only) and runs one round at a time: a thread goes from an agent through the folder to a generator, then back. On the head of the thread rides a small tile (`.hub-load`) that shows what is carried: a sheet (`#i-sheet`) on the way out, a picture (`#i-image`) on the way back. The agent and the generator of each round are drawn at random (`drawFrom()`): everyone on a side gets a turn before anyone repeats, and nobody goes twice running.
- The glass answers the thread: a cube whose round it is gets `is-lit` (inner glow, brighter edges, a patch of coloured light in its shadow); when the thread leaves or enters it, `pulse()` makes it swell, flares the glow and sends a sheen across its near face. The glow at the head of the thread (`.hub-spark`) lies under the cubes and shows through them. The folder's frame flashes a ring as the thread passes (`.hero-stage.is-passing`).
- The rest angles and the perspective appear twice, in `styles.css` (`--rx`, `--ry`, `--p`) and in `main.js` (`REST`, `PERSPECTIVE`). Change both together.

### Light under the pointer

- Every framed picture (`.art`, `.appshot`, `.row-pic`, `.pipe-pic`, `.use-pic`) has an outer edge, a lit inner edge (`::after`), the hard shadow and a soft one. Under the pointer an illustration (`.art`) gets a soft glare (`::before`), since it is there for the look. Screenshots, results and the pictures of the clip are left alone, with no glare and no leaning, so what they show stays readable.
- A surface marked `data-lit` (the paste window `.ask`, the folder box, the MCP figure, the two install cards) has its edge lit near the pointer. Only the edge: the ground holds text and stays as it is. `--lit` sets the colour of that light.
- `main.js` ("light under the pointer") writes `--mx` and `--my` on the `data-lit` surface or the illustration under the pointer. Without them (keyboard, no script) the light falls from the top edge. A `data-lit` element's `::before` and an illustration's `::before` are taken by this, and a framed picture's `::after` is its inner edge, so do not give them other rules of that kind.
- All of it is behind `@media (hover: hover)`; on a touch screen nothing depends on it.

### Entrances

- `data-reveal` on an element: it rises into place the first time it is seen. `data-reveal-group` on a parent: its children come in one after another.
- They are hidden only under `.motion`, which `main.js` sets when the reader has not asked for reduced motion. With no script or with reduced motion everything is simply visible.
- The entrance is a CSS animation with only a `from` keyframe, so it ends in the element's own state. Do not put a second `animation` on an element that has an entrance: when the second one is taken away, the entrance plays again. Put it on a child or a pseudo-element, or use `element.animate()` as `pulse()` does.
- The hero's entrance on load is plain CSS inside `@media (prefers-reduced-motion: no-preference)`, so it needs no script.
- The MCP figure draws itself once (wire, stops, fork, ends), then a light runs its path every five seconds, only while the figure is on screen (`.lanes.is-live`).

### Smaller things

- The dots of the hero's ground are drawn twice (`.hub::before` and `.hub::after`); the second, brighter layer is seen only in a circle around the pointer. `main.js` writes `--px` and `--py` on `.hub` and sets `is-pointed` while the pointer is over it.
- A coloured voice (`.who-agent`, `.who-you`) in the headline or in a lead is underlined in its colour; with motion the line is drawn once.
- Selection is mustard, the scrollbar is in the page's colours, and the focus ring is mustard.
- Top bar: the GitHub button asks for a star (the pixel star `#i-star` is in the sprite; on a phone only the star is shown). It is clear over the hero, frosted once the page has scrolled (`.is-stuck`); the link of the section in view gets `aria-current`. A thread on the lower edge of the window (`.read-progress`) fills as the page is read, violet at its tail and mustard at its head; `main.js` writes `--read` on `<html>`. The frosted bar is the only `backdrop-filter` on the page.
- Buttons rise one pixel toward the pointer and are pressed into their shadow; the primary one is crossed by a band of light once.
- Copy: the button turns green and says Copied, as the app's does, and the message lights up from its first letter to its last (`.ask.is-copied`). One click on the message selects all of it.
- Questions: an answer opens and closes with an animated height (`.faq-a` is the wrapper that is animated; with reduced motion or no script the native `<details>` behaviour stays).
- The slot folder beside the six steps marks the files the current step added, and the square of the step being read is ringed (`.turn.is-current`).
- Clips play only while they are on screen.

### Motion rules kept

One thing moves at a time, nothing loops in the corner of the eye, entrances play once. Animations use `transform` and `opacity`; the exceptions are the height of an opening answer, small `box-shadow` and colour transitions on hover, and the SVG wires, which are redrawn each frame while the hub is on screen. `prefers-reduced-motion: reduce` gives a still, complete page: no thread, no bobbing, no clips, and the wires drawn at rest.

## The rest

The message for an agent (`.ask`) appears twice, in the hero and under Install; each has its own id for its Copy button, and the text must stay the same in both and match `AGENT-INSTALL.md` in the app's repository.

In "What the folder gives your agent", the clip row shows the clip from the hero with frame sheet 003 and the motion map of `asset-prompter-landing/loop-relay-clip/v2`. The variants picture is the app's variants dialog for `orbital-eats/hero-space-diner`.

The screenshots, logos and art are used as they are; nothing of the app or of a logo is redrawn in HTML.

## What is in assets/

- `art/`: illustrations and clips made for this page in the Asset Prompter project `asset-prompter-landing`. Each file is named after its slot: `<slot>.webp` for a picture, `<slot>.mp4` for its clip. Until a file exists, the page shows a "Needs generating" placeholder with the slot's name. A picture that has a clip (`data-video` in `index.html`) shows the still first and switches to the clip once it can play.
  - To add or replace one: approve the slot in Asset Prompter, convert its `final.png` to `assets/art/<slot>.webp` (about 1400 px wide is plenty), and for a clip save `final.mp4` as `assets/art/<slot>.mp4` without sound. Nothing in the HTML needs to change.
- `logos/`: the marks of the products in the hero, fetched on 4 October 2026. These are other companies' trademarks; keep the line under the hub that says the project is not affiliated with them.
  - From the Simple Icons package 16.33 (`cdn.jsdelivr.net/npm/simple-icons`), single-colour SVG: `claude.svg` and `gemini.svg` (given their brand colour from the package data, #D97757 and #8E75B2), `codex.svg` (the OpenAI mark), `cursor.svg`, `github-copilot.svg`, `opencode.svg`.
  - From the products' own sites: `antigravity.svg` (antigravity.google/favicon.svg, with its dark-mode rule removed so the ground stays white), `luma.svg` (lumalabs.ai/images/brand/luma-ai/logo-black.svg), `google-flow.png` (the Flow favicon on gstatic.com, scaled to 256 px), `midjourney.png` (midjourney.com/public/apple-touch-icon.png, cropped to the boat), `leonardo.png` (the icon of docs.leonardo.ai, scaled to 256 px).
- `app/`: the card of `orbital-eats/observation-dining-room` in each state, `<state>.webp` for wide screens (the app at 1000 px, saved 1600 px wide) and `<state>-narrow.webp` up to 640 px (the app at 440 px). `2-copied` is the prompt box alone, after Copy prompt was pressed. `4-notify-narrow` is the filter row with Notify agent while an agent is listening, and is used at every width.
- `shots/`: `version-results.webp` (a part of the Details of `observation-dining-room`: the results of version 2, the agent's verdict and the note on what changed) and `variants-dialog.webp` (the variants dialog of `hero-space-diner`), used in "What the folder gives your agent".
- `demo/`: the app icon, two results of `orbital-eats`, and frame sheet 003 and the motion map of `asset-prompter-landing/loop-relay-clip/v2`.

The page shows `observation-dining-room` as approved. In the real project it is still waiting for approval; the pictures show a staged copy.

## Retaking the pictures of the app

They come from a second app instance, never from the one you work in, so nothing in the real projects changes and no other project can appear in a picture. `tools/capture-cards.mjs` takes the whole cards in `assets/app/` and `tools/capture-steps.mjs` the two pieces (the copied prompt box and the Notify agent row). They need `playwright-core` (install it in a scratch folder outside the repository, the app must not depend on it) and the installed Edge. They read the slot from the app's `projects` folder: `APP_PROJECTS` if it is set, otherwise `../asset-prompter/projects`, the app checked out next to this repository. `EDGE` overrides the path to the browser.

1. Write a config with another port (the scripts expect 4796), an empty folder as `projectsDir`, no `externalProjects` and `"openBrowser": false`, and start a second app instance from the app's repository with `ASSET_PROMPTER_CONFIG=<that config> NO_OPEN=1 bun src/server/index.ts`.
2. Run the scripts. For each state they rebuild a copy of `observation-dining-room` in that folder with only the files that exist at that point (prompt only; with the result; with your change request; with version 2 and both reviews; approved), open the app and cut out the card.
3. Convert the PNGs to WebP (wide: 1600 px; narrow: padded to 880 px with the page colour #1d1b21) and stop the second instance.

For the two pictures in `assets/shots/`, copy `orbital-eats` to the scratch folder as well and approve `observation-dining-room` v2 (pick 2.png) in the copy. Capture in dark mode with `tutorial:seen` set in localStorage. `version-results.webp`: Details of `observation-dining-room` at a 480 px wide window and device scale 3, cut across the card from the top of `.results-strip` to 10 px under `.changes`; WebP, quality 90. `variants-dialog.webp`: the variants dialog of `hero-space-diner` at device scale 2, cut to `.modal`; WebP at most 1680 px wide, quality 85.

## Naming generators

A generator is named as hand-only only with its fact: no public API (Google Flow, Midjourney) or an API billed separately from its plan (Leonardo.Ai, Luma AI). Higgsfield, Kling and Runway are named as having an official MCP server (runway.com/mcp, Higgsfield's help centre, github.com/klingai-tech/claude-plugin). Check the names and the date on the page again whenever it changes.

## Notes

- `styles.css` and `main.js` are linked with a `?v=` stamp in `index.html`. Change it when either file changes, or a browser may keep the old one.
- Product names and logos belong to their owners. The lines saying the project is not affiliated with them, and "as checked on 2 October 2026", must stay; check the claims again when the page changes.
- The download buttons point at the `master` branch ZIP of `github.com/Djordje1998/asset-prompter`. Links to the repository's pages open in a new tab (`target="_blank" rel="noopener"`); the ZIP links are downloads and do not.
- The picture for link previews is `assets/og.png` (1200 by 630). `og:image` and `og:url` in `index.html` hold the page's full address, `https://djordje1998.github.io/asset-prompter-landing-page/`, because sites that show previews do not follow relative paths. Change both when the page moves to its own domain. To remake the picture, open `tools/og.html` in a browser window of 1200 by 630 and save a screenshot of it.
