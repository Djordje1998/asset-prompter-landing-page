# Asset Prompter landing page

The landing page of [Asset Prompter](https://github.com/Djordje1998/asset-prompter). The app lives in its own repository; this one holds only the page.

A static page: `index.html`, `styles.css`, `main.js` and the `assets/` folder, its Serbian copy `sr/index.html`, and the files around it that search engines, browsers and link previews ask for (see "Search, previews and icons"). Nothing here depends on the app's repository, and any static host can serve this folder as it is. Edit these files directly, except `sr/index.html`, which `tools/build-sr.mjs` writes (see "Languages").

The hero's logos sit in glass cubes, surfaces catch light under the pointer, and each section arrives once when it is first seen.

## Preview

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 4790 --bind 127.0.0.1
```

or with `node tools/serve.mjs . 4790`, which serves it as GitHub Pages does: `/sr/` from `sr/index.html`, `404.html` with status 404 for an address with no file, text compressed, kept ten minutes.

## Hosting

GitHub Pages serves the root of the `main` branch (Settings, Pages, Deploy from a branch) at `https://assetprompter.com/`: `CNAME` names the domain, and at the registrar the apex has A records for GitHub Pages and `www` a CNAME to `djordje1998.github.io`. The empty `.nojekyll` file tells Pages to publish the files as they are.

## Checks

Two workflows run on GitHub. Neither builds nor changes the site; Pages still publishes `main` as it is.

- `.github/workflows/check.yml` (Check) runs on every pull request and every push to `main`, in two jobs:
  - Files: `node tools/build-sr.mjs --check`; `node tools/check-site.mjs`; and html-validate 11.16.0 on `index.html`, `sr/index.html`, `404.html` and `tools/og.html`, with `.htmlvalidate.json` (the recommended rules, in the page's own style: `<!doctype html>` in lower case, empty elements closed as `<meta ... />`). On a pull request that changes `index.html` or `i18n.js` but no `lastmod` in `sitemap.xml`, it also warns (only warns: not every change is a change of the text), and likewise when it changes `styles.css` or `main.js` but not its `?v=` stamp in `index.html`.
  - Lighthouse, after Files: serves the folder with `tools/serve.mjs`, runs Lighthouse 13.5.0 as a phone three times on `/` and on `/sr/` (performance, accessibility, best practices, SEO and agentic browsing), and `tools/lh-assert.mjs` checks the median of the runs: SEO, Best Practices and Accessibility 100; every Agentic Browsing audit that applies passes; layout shift at most 0.05 (warns above 0.01), blocking time at most 400 ms (warns above 200), the bytes of the page at most 1.5 MB (warns above 1.3 MB). Largest Contentful Paint only warns, above 3.5 s: the headline fades in on load, on purpose, which holds it at about 2.7 s on `/` and 3.1 s on `/sr/` (October 2026). The reports are kept for 14 days with the run (`lighthouse`). When the page grows on purpose, raise the numbers at the top of `tools/lh-assert.mjs`.
- `tools/check-site.mjs` needs no browser and no packages. It checks that every address on this site that a page (its scripts' too), the stylesheet, the JSON-LD, the manifest, `robots.txt`, the sitemap or `llms.txt` names is a real file, and every `#anchor` has its id; that each page has one canonical address, its own, and `hreflang` links that name each page once plus `x-default`, the same in both pages and in the sitemap; that each page links the other with an `<a href>`; that no address carries `?lang=` (the script at the top of the `<head>` still reads it, for old links); that the JSON-LD parses, has what each kind of node needs and every `@id` it points to; that the page's `dateModified` is its `lastmod` in `sitemap.xml`; that `sr/index.html` is up to date; and the `?v=` stamps and the IndexNow key file. It lists every problem it finds.
- `.github/workflows/indexnow.yml` (IndexNow) runs on a push to `main` that changes `index.html`, `sr/index.html`, `llms.txt`, `llms-full.txt` or `sitemap.xml`. `tools/indexnow.mjs` finds the addresses that changed since the commit of the last IndexNow run that succeeded (a page whose file or `lastmod` changed, and `llms.txt` or `llms-full.txt` themselves; not since the commit before the push, since GitHub keeps one waiting run and cancels the one before it, so a push's own run may never come), waits until `https://assetprompter.com` serves the files of the push byte for byte (it sends anyway after ten minutes, with a warning) and sends them to `api.indexnow.org`, which passes them to Bing, Yandex, Seznam, Naver and Yep. Google does not take IndexNow; it reads the sitemap. The key is `499fbef4b8b0fa3e781fec30a6f1ad91.txt` at the root, which holds its own name: keep it. When IndexNow is down or busy it tries three times, then the run fails, as does a refusal of the request itself (key, host); the next run sends those addresses again, or re-run it. Then `tools/live-check.mjs` checks the live site: both pages answer with their own canonical, the three `hreflang` links and no `noindex`, `robots.txt`, the sitemap, `llms.txt`, `llms-full.txt` and the key are served, and an address with no file answers 404. A failure there is mailed to the owner like any failed run. It can also be run by hand (Actions, IndexNow, Run workflow), by default for every address of the sitemap (otherwise those changed since the last run that succeeded): do that once after the first merge; IndexNow answers 202 the first time, while it checks the key, and 200 after.
- To stop a change that fails the checks from reaching `main`, the owner adds a ruleset (Settings, Rules, Rulesets, New branch ruleset) for the default branch with "Require a pull request before merging" and "Require status checks to pass" with the checks `Files` and `Lighthouse` (source GitHub Actions). Until then the checks only report.
- The actions are pinned to the commit of a release (the version is beside it). `.github/dependabot.yml` asks Dependabot for a pull request when an action has a new release, once a month and only for a release at least 14 days old. html-validate and lighthouse are pinned in `check.yml` and raised by hand, to a version at least two weeks old; change the numbers here with them.

To run the same checks on your machine (Node 22.22 or later, which html-validate needs; a Chrome or Chromium for Lighthouse, `CHROME_PATH` if it is not found):

```
node tools/check-site.mjs
npx --yes html-validate@11.16.0 index.html sr/index.html 404.html tools/og.html
node tools/serve.mjs . 8080
```

and, while the server runs, in a second terminal (bash):

```
mkdir -p lh
for i in 1 2 3; do for page in / /sr/; do name=$(echo "$page" | tr -d /); name=${name:-en}
  npx --yes lighthouse@13.5.0 "http://127.0.0.1:8080$page" --quiet --only-categories=performance,accessibility,best-practices,seo,agentic-browsing --chrome-flags="--headless=new --no-sandbox" --output=json --output=html --output-path="lh/$name-$i"
done; done
node tools/lh-assert.mjs lh/*.report.json
```

`lh/` is ignored by git. `node tools/indexnow.mjs --all --dry-run` shows what would be sent and whether the site serves it yet, without sending; `node tools/live-check.mjs` checks the live site, or another address given after it (`node tools/live-check.mjs http://127.0.0.1:8080`).

## Languages

The page is in English and Serbian, and each language is a page of its own: English at `https://assetprompter.com/`, Serbian at `https://assetprompter.com/sr/`. Both are whole in the HTML, so search engines, link previews and readers without scripts get the text of the address they opened.

- English is the text in `index.html`. Serbian is the `SR` list in `i18n.js`, one entry per key. English is written only once, in the page.
- `sr/index.html` is made, never edited: `node tools/build-sr.mjs` writes it from `index.html` with the `SR` texts in. Run it after any change to `index.html`, `i18n.js` or the `say()` texts in `main.js`, and commit `sr/index.html` with them. `node tools/build-sr.mjs --check` says whether it is up to date (exit 1 if not). It needs Node 18 or later and nothing else. It reads line ends as LF, so a checkout with CRLF builds the same page; `.gitattributes` keeps the text files LF in every checkout anyway, also on Windows, so the files and the checks are the same bytes as on GitHub.
- A text is marked in the HTML with its key: `data-i18n` for an element's whole content (the Serbian entry may hold markup, as the headline does), `data-i18n-text` for an element's own text when an icon or a button sits beside it, and `data-i18n-alt`, `data-i18n-aria-label`, `data-i18n-content` for attributes. A new text needs its mark in the HTML and its entry in `SR`; a mark without an entry stays English, and the build names it.
- Besides the texts, the build makes these changes on the way: `lang="sr-Latn"`, the language button shows SR and the menu checks Srpski; what stays English on purpose, the message for the agent (`.ask-text`) and the app's status tags (`.tag`), gets `lang="en"`, so a screen reader reads it in English; addresses inside the site are written from `sr/` (`../styles.css`, `../assets/...`), while `#anchors` and full addresses stay; the canonical address and `og:url` are `/sr/`; the fonts' Serbian files (`-sr.woff2`) are preloaded too, for the letters with marks; and the JSON-LD is translated (see "Search, previews and icons").
- The page does not load `i18n.js`; it is only the build's source. The few texts `main.js` writes itself (Copied, Select and copy) go through `say()`, which has the English; the build puts the Serbian of every key `say()` asks for in `sr/index.html`, as a small JSON block (`#say`).
- Left in English in both languages, on purpose: the labels of the app (Copy prompt, Notify agent, Approve v1, the status tags beside the six steps), because the app and its screenshots are in English and the reader has to find those words there; they stand in „quotes” in the Serbian text. And the message for the agent, which has to match `AGENT-INSTALL.md`.
- The Serbian text speaks to the reader as "ti" and avoids past-tense forms that would show the reader's gender. The terms it settled on: prompt, slot, preset, klip, frejm, aset, fajl, folder, pretplata (a generator's plan), zahtev za izmenu (change request), odobriti (approve).
- The menu in the top bar: its two items are links to the two pages (so a crawler finds each from the other), drawn as before. `main.js` opens it; choosing a language keeps it in `localStorage` (`lang`), puts the reader's place in `sessionStorage` (the part of the page at the top of the window and how far into it, since the Serbian text runs longer, and which answers under "Before you try it" are open, which the other page opens before it measures; taken as the menu opens, since moving focus into the bar can scroll the page a little) and goes to the other page, which starts at that place. That page looks as the old change of text in place did: the script at the top of the `<head>` sees the kept place and marks it (`.lang-switched`: the hero plays no entrance, and the hub's first round does not wait for one; `.lang-settling`: no transition until `main.js` has set the bar, the folder and the rest, two frames), and `main.js` lets in at once, without their entrance, the sections above the window and those it shows (`.is-shown`). A choice made from the keyboard also puts focus back on the language button there, as the old change of text in place did. The switch replaces the page in the history, as the old change did too. When the reader reaches for the menu (pointer over it, or focus), the other page is fetched ahead (`prefetch`; browsers without it skip this), and from the English page also every Serbian font file (`-sr.woff2`) the stylesheet names. Choosing the item of the page already open only closes the menu, but saves that choice too, so English chosen on `/?lang=en` keeps `/` English. While Serbian is the saved choice, the English item's address carries `?lang=en`, so English opened in a new tab (ctrl- or middle-click, the context menu) stays English; search engines keep no choice and see the plain address.
- The small script at the very top of the `<head>` (the same in both pages) runs before anything is fetched or drawn. A reader who chose Serbian and opens `/` goes on to `/sr/` (`location.replace`, the `#` part kept). Old links with `?lang=` still work: `/?lang=sr` goes to `/sr/`, and `/sr/?lang=en` to `/?lang=en`, where `?lang=en` keeps the English page even for a reader who chose Serbian, so no address sends back to the one it came from. Nothing else redirects: never the reader's browser language, and never without a saved choice (search engines and readers without storage stay where they are). The script also sets `.i18n` on `<html>`, which shows the menu; if `main.js` has not run by the time the page is read (`DOMContentLoaded`), it takes it off again.
- Another language: its own list in a file like `i18n.js`, a build like `tools/build-sr.mjs` and a folder, an item in `.lang-menu` in `index.html`, its `hreflang` link in both pages and `sitemap.xml`, and its code in the script at the top of the `<head>`.
- The `<head>` is marked too: the title, the description and the texts of the link previews (`og:` and `twitter:`, also the two facts Slack shows, Price and Runs on) have keys, read with `data-i18n` and `data-i18n-content` like any other text. The sites that show previews do not run scripts, so a preview is in the language of the page's address: English for `/`, Serbian for `/sr/`.

## Search, previews and icons

All of it is in files, because GitHub Pages sends no headers of our own. Keep these in step with the page when it changes.

- The `<head>` of `index.html`: the title (at most 60 characters) and the description (about 150) name what people search for, the agents and the generators, while the page's own text stays as it is. `robots` allows large image previews. The canonical address is `https://assetprompter.com/`, and three `hreflang` links name the English page (also `x-default`) and the Serbian one at `https://assetprompter.com/sr/`. `color-scheme` is dark, as in `styles.css`, so the page is dark before the stylesheet arrives. Link previews and the address in them need full addresses (`https://assetprompter.com/...`).
- The Serbian page `sr/index.html` is made from `index.html` by `tools/build-sr.mjs`. It has the same three `hreflang` links (`en`, `sr`, and `x-default` for English; no others), `https://assetprompter.com/sr/` as its canonical address and `og:url`, `og:locale` `sr_RS` with `en_US` as the alternate, and `lang="sr-Latn"`.
- Link previews use `assets/og.jpg`, and on `/sr/` `assets/og-sr.jpg`, the same picture with its words in Serbian (the key `og.image` in `i18n.js`, on `og:image` and `twitter:image`; the build puts it in the JSON-LD too); Slack also shows `twitter:label1`/`twitter:data1` (Price: Free) and `twitter:label2`/`twitter:data2` (Runs on: Windows, Linux), which X ignores.
- Structured data: one `<script type="application/ld+json">` at the end of the `<head>` describes the site, the page, the app, its source code, its author and the questions (schema.org `WebSite`, `WebPage`, `SoftwareApplication`, `SoftwareSourceCode`, `Person`, `FAQPage`). It says only what the page shows or what the app's repository says: no ratings, no reviews, no version number (it would go stale). Its texts are copies of the page's, so change them together:
  - the page's `name` and `description` are the title and the description (keys `title`, `description`);
  - the app's `description` is the line under the headline (`hero.sub`);
  - the questions and answers are the seven under "Before you try it", word for word without markup (`faq.1.q` to `faq.7.a`);
  - only the app's `featureList`, `applicationSubCategory`, `softwareRequirements`, `audience`, `keywords` and the names of its `about` topics are shown nowhere on the page; their Serbian is `ld.feature.1` to `ld.feature.8` (in the same order), `ld.subcategory`, `ld.requirements`, `ld.audience`, `ld.keywords` (one list, separated by commas) and `ld.about.1` to `ld.about.5` (in the same order) in `i18n.js`.
  - The rest are names and addresses, the same in both pages but for the topics' names: the page's `mentions` are the agents and generators it names and MCP (typed `Thing`, and ChatGPT Images `CreativeWork` to say it is part of ChatGPT: as `SoftwareApplication` Google would take each for an app of its own, with no price or rating, and list it as an error), the app's `about` the topics (generative AI, text-to-image and text-to-video models, prompt engineering, AI agents), each with its Wikidata item as `sameAs` where one exists (checked 8 October 2026). The site and the app have `image`, `icon-512.png` (`#icon`). The app links its `README.md` (`softwareHelp`) and `CHANGELOG.md` (`releaseNotes`); `#source` says the code is TypeScript on Bun, under the MIT licence, as the app's repository does. The author is Đorđe Novković (also written Djordje Novković, Djordje1998), with his GitHub and LinkedIn as `sameAs`; the `author` meta tag names him too.
  - `dateModified` of the page is the date the text last changed, the same as `lastmod` in `sitemap.xml`.
  - For `/sr/` the build writes the same block with those Serbian texts, `"inLanguage": "sr-Latn"` and the address `https://assetprompter.com/sr/` for the page and the questions (`#webpage`, `#questions`); the site, the app and the author keep their `@id`. It finds each text by its English, so it stops when a text in the block is no longer the page's: make them the same again.
- `robots.txt` lets every crawler in, search engines and the crawlers of AI assistants alike, and names the sitemap. `sitemap.xml` lists `/` and `/sr/`, each with its `hreflang` alternates; change `lastmod`, and `dateModified` in the JSON-LD, when the text of the page changes.
- `llms.txt` (llmstxt.org) is a short summary for AI assistants and coding agents, with links to `AGENT-INSTALL.md` (also as raw Markdown) and the README of the app and to both pages. `llms-full.txt` is the whole English page as Markdown. `index.html` names them in the `<head>`: `rel="alternate" type="text/markdown"` for `llms-full.txt` and `rel="describedby"` for `llms.txt`; the Serbian page has only `describedby`, since there is no Serbian Markdown. Keep their facts the same as the page's.
- `404.html` is what GitHub Pages shows for an address with no file. It is a page of its own in the site's look (the top bar, an empty slot that "Needs generating", the way home), with `noindex`. It can be shown at any depth, so its addresses start at the root (`/styles.css`). It links the stylesheet and the fonts as `index.html` does: change it when they change.
- Icons: `favicon.svg` is the icon. The `<head>` (and `404.html`) links `favicon.ico`, `favicon.svg`, `icon-192.png` (the square raster icon of at least 48 px that search results show) and `apple-touch-icon.png`. `favicon.ico` (16, 32 and 48 px), `apple-touch-icon.png` (180 px, on the page colour, since iOS has no clear pixels), `icon-192.png`, `icon-512.png` and `icon-512-maskable.png` (the drawing inside the middle 80%, for icons cut to a circle) are drawn from it by `tools/icons.mjs`, at a whole number of pixels per square so the pixel art stays sharp. It needs `playwright-core`, `pngjs` and a Chromium or Edge (`CHROME` or `EDGE`). Run it again when `favicon.svg` changes.
- `site.webmanifest` gives the name, the colours of the page (`#1d1b21`, and `#19171d` for the bar, as `theme-color`) and the icons, for a shortcut on a home screen. It is a website, so `display` is `browser`.
- `tools/og.html` is published with the site, so it has `noindex`.

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

"What it is good for" lays its five uses out as cards in two halves, the picture on one side and the words on the other, the sides swapping from card to card. With motion, the halves come in from opposite sides as the card scrolls up and meet once its top has passed the middle of the window (main.js sets `--p` on each card); without it they stand joined. The last card, films, ads and short scenes, has a project folder drawn like the slot folder of section 2 in place of a picture, beside three numbered lines, because that use is a sequence.

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
- Layouts: from 1100px the cubes float beside the hero at the place given by `--x` and `--y` on each `li`. Below that they stand in a row; below 600px the eight cubes of each side stand in two rows of four, the lower row moved half a step along so the upper row's wires pass between its cubes.

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
- A page opened from the language menu plays none of it for what the reader had seen (see "Languages"): `.lang-switched` turns the hero's entrance off and `.is-shown` the others, so a new entrance needs its line in those rules.
- The MCP figure draws itself once (wire, stops, fork, ends), then a light runs its path every five seconds, only while the figure is on screen (`.lanes.is-live`).

### Smaller things

- The dots of the hero's ground are drawn twice (`.hub::before` and `.hub::after`); the second, brighter layer is seen only in a circle around the pointer. `main.js` writes `--px` and `--py` on `.hub` and sets `is-pointed` while the pointer is over it. `styles.css` registers the two as not inherited (`@property`) and only `.hub::after` takes them, so a move of the pointer restyles that layer and not the whole hub; browsers without `@property` inherit them, and it looks the same.
- A coloured voice (`.who-agent`, `.who-you`) in the headline or in a lead is underlined in its colour; with motion the line is drawn once.
- Selection is mustard, the scrollbar is in the page's colours, and the focus ring is mustard.
- Top bar: the language menu (`.lang`, the pixel globe `#i-globe`), then the GitHub button, which asks for a star (the pixel star `#i-star` is in the sprite; on a phone only the star is shown, and under 390px it gives way to the language and Install). The bar's widths are set for Serbian, whose words are longer: check both languages when a link or a button changes. The names a screen reader gives the language button and the star hold the words they show (`Language: EN`, `Star on GitHub: Asset Prompter`), in both languages. It is clear over the hero, frosted once the page has scrolled (`.is-stuck`); the link of the section in view gets `aria-current`. A thread on the lower edge of the window (`.read-progress`) fills as the page is read, violet at its tail and mustard at its head; `main.js` writes `--read` on the thread itself, not on `<html>`, so a scroll restyles only the thread. The frosted bar is the only `backdrop-filter` on the page.
- Buttons rise one pixel toward the pointer and are pressed into their shadow; the primary one is crossed by a band of light once.
- Copy: the button turns green and says Copied, as the app's does, and the message lights up from its first letter to its last (`.ask.is-copied`). One click on the message selects all of it.
- Questions: an answer opens and closes with an animated height (`.faq-a` is the wrapper that is animated; with reduced motion or no script the native `<details>` behaviour stays).
- The slot folder beside the six steps marks the files the current step added, and the square of the step being read is ringed (`.turn.is-current`).
- What follows the scroll or the pointer (the bar and its thread, the slot folder, the uses, the light, the hub) is done in the frame's jobs (`inFrame()` in `main.js`): every job measures first, then every job writes, so the browser lays the page out once a frame. A new job keeps to that: measure in the job, write in the function it returns. A job that throws is reported as an uncaught error and the frame's other jobs still run.
- Clips play only while they are on screen. A clip is fetched only after the page has loaded and once its picture is within a screen and a half of the window; until it can play, the still stands in its place. The hero's clip is shown twice on the page; the second picture waits until the first has its file, and takes it from the browser's cache.

### Motion rules kept

One thing moves at a time, nothing loops in the corner of the eye, entrances play once. Animations use `transform` and `opacity`; the exceptions are the height of an opening answer, small `box-shadow` and colour transitions on hover, and the SVG wires, which are redrawn while the hub is on screen (only in the frames where they have moved). `prefers-reduced-motion: reduce` gives a still, complete page: no thread, no bobbing, no clips, and the wires drawn at rest.

## The rest

The message for an agent (`.ask`) appears twice, in the hero and under Install; each has its own id for its Copy button (which names it with `aria-describedby`; the `> ` before it has empty alt text, so it is not read), and the text must stay the same in both and match `AGENT-INSTALL.md` in the app's repository.

In "What the folder gives your agent", the clip row shows the clip from the hero with frame sheet 003 and the motion map of `asset-prompter-landing/loop-relay-clip/v2`. The variants picture is the app's variants dialog for `orbital-eats/hero-space-diner`.

The screenshots, logos and art are used as they are; nothing of the app or of a logo is redrawn in HTML.

## What is in assets/

- `art/`: illustrations and clips made for this page in the Asset Prompter project `asset-prompter-landing`. Each file is named after its slot: `<slot>.webp` for a picture, `<slot>.mp4` for its clip. Until a file exists, the page shows a "Needs generating" placeholder with the slot's name. A picture that has a clip (`data-video` in `index.html`) shows the still first and switches to the clip once it can play.
  - To add or replace one: approve the slot in Asset Prompter, convert its `final.png` to `assets/art/<slot>.webp` (about 1400 px wide is plenty), and for a clip save `final.mp4` as `assets/art/<slot>.mp4` without sound. Nothing in the HTML needs to change.
- `logos/`: the marks of the products in the hero, fetched on 4 October 2026. These are other companies' trademarks; keep the line under the hub that says the project is not affiliated with them. A mark is shown at about 30 to 40 px, so the ones that are pictures are lossless WebP at most 128 px wide (enough for a screen of three device pixels per px), made from the PNGs described below (still in the history of this repository).
  - From the Simple Icons package 16.33 (`cdn.jsdelivr.net/npm/simple-icons`), single-colour SVG: `claude.svg` and `gemini.svg` (given their brand colour from the package data, #D97757 and #8E75B2), `codex.svg` (the OpenAI mark), `cursor.svg`, `github-copilot.svg`, `opencode.svg`.
  - From the products' own sites: `antigravity.svg` (antigravity.google/favicon.svg, with its dark-mode rule removed so the ground stays white), `luma.svg` (lumalabs.ai/images/brand/luma-ai/logo-black.svg), `google-flow.webp` (the Flow favicon on gstatic.com, scaled to 256 px, then 128), `midjourney.webp` (midjourney.com/public/apple-touch-icon.png, cropped to the boat, 132 px), `leonardo.webp` (the icon of docs.leonardo.ai, scaled to 256 px, then 128). Fetched on 6 October 2026: `grok.webp` (grok.com/images/android-chrome-512x512.png, the white mark lifted off its black tile and made black, 256 px, then 128), `dreamina.webp` (the favicon of dreamina.capcut.com, the mark lifted off its black tile, 256 px, then 128), `chatgpt.svg` (a copy of `codex.svg`: ChatGPT uses the OpenAI mark).
- `app/`: the card of `orbital-eats/observation-dining-room` in each state, `<state>.webp` for wide screens (the app at 1000 px, saved 1600 px wide) and `<state>-narrow.webp` up to 640 px (the app at 440 px). `2-copied` is the prompt box alone, after Copy prompt was pressed. `4-notify-narrow` is the filter row with Notify agent while an agent is listening, and is used at every width. Beside each one is a smaller copy, `<name>-<width>.webp` (half its width, with exactly its shape), made by `tools/sizes.mjs`; `index.html` offers it in `srcset` with `sizes` that match the layout, so a screen of normal density takes the smaller file and a sharper screen still gets the full picture. When the layout of a picture changes, check its `sizes` again: it may be larger than the picture is shown, never smaller.
- `shots/`: `version-results.webp` (a part of the Details of `observation-dining-room`: the results of version 2, the agent's verdict and the note on what changed) and `variants-dialog.webp` (the variants dialog of `hero-space-diner`), used in "What the folder gives your agent". They have smaller copies as in `app/`.
- `vendor/`: `lenis.min.js`, Lenis 1.3.26 (MIT, licence beside it; its last line, `//# sourceMappingURL=lenis.min.js.map`, is taken out, since the map is not here and a browser's developer tools would ask for it), which eases wheel scrolling so that what follows the scroll moves evenly. main.js starts it unless the reader asked for less motion; without the file, or in a browser without `ResizeObserver` (which Lenis needs), the page scrolls natively.
- `demo/`: the app icon, two results of `orbital-eats`, and frame sheet 003 and the motion map of `asset-prompter-landing/loop-relay-clip/v2`. The page shows the icon from `app-icon-256.webp`, a lossless copy of `app-icon-256.png` (the same pixels); the PNG stays for `tools/og.html`.
- `fonts/`: the three fonts, Bricolage Grotesque, Instrument Sans and Spline Sans Mono (SIL Open Font License, licences beside them), as the WOFF2 files Google Fonts serves, named `<family>-<version>-<letters>.woff2`. Their `@font-face` rules are Google's, word for word but for the addresses, at the top of section 2 of `styles.css`. After them come six rules of the page's own for Serbian's letters with marks (Ć ć Č č Đ đ Š š Ž ž): `<family>-<version>-sr.woff2`, those letters cut out of the latin-ext file by `node tools/sr-fonts.mjs` (Python 3 with `pip install fonttools brotli`), with the same glyphs, kerning, variations and hinting, about a tenth of its bytes (4.5, 2.5 and 3.6 KB against 30, 11 and 21 KB). Declared last, they are tried first for those letters; any other letter of latin-ext still comes from Google's file. `node tools/sr-fonts.mjs --check` says whether they are still what the latin-ext files give. Last come five rules for the moment before a font is in: `Bricolage Grotesque Fallback`, `Instrument Sans Fallback` and `Spline Sans Mono Fallback`, next after each font in `--display`, `--body` and `--mono`, which set the text in a local Arial (Liberation Sans, Arimo, Helvetica) or Courier New (Liberation Mono, Cousine) with `size-adjust` and ascent, descent and line-gap overrides, so it takes the room the font will take and the page does not move when the font comes in (on a phone at 50 KB/s with a 2 s round trip, the layout shift of `/sr/` went from 0.10 to 0.002). Each `size-adjust` is how wide the page's own text is in the font against the stand-in, laid out at 360 to 1920 px in both languages; the overrides are the font's `hhea` metrics divided by it. Their `unicode-range` is only the letters all three fonts have, so any other letter still falls to the system's font, and the page looks the same once the fonts are in. After a font update, measure them again. `index.html` and `404.html` preload the latin files of Bricolage Grotesque and Instrument Sans, which the first screen is set in. To update a font, fetch Google's CSS with a current browser's user agent (`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap`), save the files under new names with the new version, and change the rules, the preloads and the `?v=` stamps; then run `node tools/sr-fonts.mjs`, change the names in the `-sr` rules, and delete the old `-sr` files.

The page shows `observation-dining-room` as approved. In the real project it is still waiting for approval; the pictures show a staged copy.

## Retaking the pictures of the app

They come from a second app instance, never from the one you work in, so nothing in the real projects changes and no other project can appear in a picture. `tools/capture-cards.mjs` takes the whole cards in `assets/app/` and `tools/capture-steps.mjs` the two pieces (the copied prompt box and the Notify agent row). They need `playwright-core` (install it in a scratch folder outside the repository, the app must not depend on it) and the installed Edge. They read the slot from the app's `projects` folder: `APP_PROJECTS` if it is set, otherwise `../asset-prompter/projects`, the app checked out next to this repository. `EDGE` overrides the path to the browser.

1. Write a config with another port (the scripts expect 4796), an empty folder as `projectsDir`, no `externalProjects` and `"openBrowser": false`, and start a second app instance from the app's repository with `ASSET_PROMPTER_CONFIG=<that config> NO_OPEN=1 bun src/server/index.ts`.
2. Run the scripts. For each state they rebuild a copy of `observation-dining-room` in that folder with only the files that exist at that point (prompt only; with the result; with your change request; with version 2 and both reviews; approved), open the app and cut out the card.
3. Convert the PNGs to WebP (wide: 1600 px; narrow: padded to 880 px with the page colour #1d1b21) and stop the second instance.
4. Run `tools/sizes.mjs` (it needs `playwright-core` and a Chromium or Edge, as the other scripts) to make the smaller copies (it deletes the old copies of a picture first), and check the widths in `srcset` in `index.html`.

For the two pictures in `assets/shots/`, copy `orbital-eats` to the scratch folder as well and approve `observation-dining-room` v2 (pick 2.png) in the copy. Capture in dark mode with `tutorial:seen` set in localStorage. `version-results.webp`: Details of `observation-dining-room` at a 480 px wide window and device scale 3, cut across the card from the top of `.results-strip` to 10 px under `.changes`; WebP, quality 90. `variants-dialog.webp`: the variants dialog of `hero-space-diner` at device scale 2, cut to `.modal`; WebP at most 1680 px wide, quality 85.

## Naming generators

A generator is named as hand-only only with its fact: no public API (Google Flow, Midjourney) or an API billed separately from its plan (Leonardo.Ai, Luma AI). Higgsfield, Kling and Runway are named as having an official MCP server (runway.com/mcp, Higgsfield's help centre, github.com/klingai-tech/claude-plugin). Check the names and the date on the page again whenever it changes.

## Notes

- `styles.css` and `main.js` are linked with a `?v=` stamp in `index.html` (and `styles.css` in `404.html`; `sr/index.html` takes them from `index.html` when it is built). Change it when any of them changes, or a browser may keep the old one: GitHub Pages lets a browser keep a file for ten minutes. A new or changed font, picture or clip gets a new file name instead.
- Loading: the page asks no other site for anything. The fonts are preloaded (on `/sr/` with their Serbian files), no script is needed for the text, the hero's picture has `fetchpriority="high"` (it is the largest thing on a wide screen), every other picture is `loading="lazy"`, and clips wait as described under "Smaller things". `content-visibility` is left out on purpose: it would clip the lit edges of the bands and change the page's height, which the reading thread, Lenis and the anchors measure.
- Product names and logos belong to their owners. The lines saying the project is not affiliated with them, and "as checked on 2 October 2026", must stay; check the claims again when the page changes.
- The download buttons point at the `master` branch ZIP of `github.com/Djordje1998/asset-prompter`. Links to the repository's pages open in a new tab (`target="_blank" rel="noopener"`); the ZIP links are downloads and do not.
- The picture for link previews is `assets/og.jpg` (1200 by 630, about 90 KB, well under what WhatsApp takes for a thumbnail); `og:image`, `twitter:image`, the page's `primaryImageOfPage` in the JSON-LD and `og:url` hold full addresses, because sites that show previews do not follow relative paths. To remake the picture, open `tools/og.html` in a browser window of 1200 by 630, save a screenshot of it as `assets/og.png` (kept as the source), and make the JPEG with `convert assets/og.png -strip -quality 85 -sampling-factor 4:4:4 assets/og-<n>.jpg` under a new name, so the sites that show previews fetch it again; change `og:image`, `twitter:image` and `primaryImageOfPage` with it. The Serbian one is `tools/og.html?lang=sr`, saved as `assets/og-sr.png` and made into `assets/og-sr-<n>.jpg` the same way; change `og.image` in `i18n.js` and run the build.
