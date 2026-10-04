// Captures the real slot card of Asset Prompter in each state of one slot's history, for the landing page.
// A second app instance (port 4796) serves a staged copy of one slot; this script rebuilds that copy per state.
//
//   node cards.mjs            every state, wide and narrow
//
// Start the instance first:
//   ASSET_PROMPTER_CONFIG=<research>/cards/config.json NO_OPEN=1 bun src/server/index.ts
import { chromium } from "playwright-core";
import { cpSync, mkdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RESEARCH = join(HERE, "..");
const OUT = join(HERE, "cards");
const URL = "http://127.0.0.1:4796";
const EDGE = process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PROJECT = "orbital-eats";
const SLOT = "observation-dining-room";
// The app's projects folder: APP_PROJECTS, or the app checked out next to this repository.
const PROJECTS = process.env.APP_PROJECTS ?? join(HERE, "..", "..", "asset-prompter", "projects");
const SRC = join(PROJECTS, PROJECT, SLOT);
const ROOT = join(RESEARCH, "cards", "projects");
const DST = join(ROOT, PROJECT, SLOT);
mkdirSync(OUT, { recursive: true });

const V1 = ["slot.md", "v1.md"];
const V1_RESULT = [...V1, "v1/1.png"];
const V1_ASKED = [...V1_RESULT, "v1.feedback.md"];
const V2_REVIEWED = [...V1_ASKED, "v1.review.md", "v2.md", "v2/1.png", "v2/2.png", "v2/3.png", "v2.review.md"];

/** Rebuilds the staged slot with exactly these files. Reviews get a later time than the results they judge. */
function stage(files) {
  rmSync(join(ROOT, PROJECT), { recursive: true, force: true });
  mkdirSync(DST, { recursive: true });
  let tick = Date.now() / 1000 - 600;
  for (const file of files) {
    const to = join(DST, file);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(join(SRC, file), to);
    tick += 20;
    utimesSync(to, tick, tick);
  }
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => !i.complete);
    await Promise.all(imgs.map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r)))));
  });
  await page.waitForTimeout(700);
}

async function open(page, tab) {
  await page.goto(URL + "/");
  await page.evaluate(
    (s) => {
      localStorage.clear();
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
    },
    { "tutorial:seen": "1", project: PROJECT, tab },
  );
  await page.reload();
  await page.waitForSelector(".topbar");
  await settle(page);
}

const SIZES = { wide: { width: 1000, height: 900 }, narrow: { width: 440, height: 1700 } };
const PAD = 14;

async function shoot(page, name, size, selector) {
  await page.mouse.move(1, 1);
  await page.waitForTimeout(300);
  const box = await page.locator(selector).first().boundingBox();
  const clip = { x: Math.max(0, box.x - PAD), y: Math.max(0, box.y - PAD), width: box.width + 2 * PAD, height: box.height + 2 * PAD };
  const full = clip.y + clip.height > SIZES[size].height;
  await page.screenshot({ path: join(OUT, `${name}-${size}.png`), clip, fullPage: full });
  console.log(name, size, Math.round(box.width), "x", Math.round(box.height));
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
try {
  for (const size of Object.keys(SIZES)) {
    const context = await browser.newContext({ viewport: SIZES[size], deviceScaleFactor: 2, colorScheme: "dark" });
    const page = await context.newPage();

    stage(V1);
    await open(page, "progress");
    await shoot(page, "1-asked", size, ".card");

    stage(V1_RESULT);
    await open(page, "progress");
    await shoot(page, "2-result", size, ".card");

    stage(V1_ASKED);
    await open(page, "progress");
    await shoot(page, "3-change-request", size, ".card");

    stage(V2_REVIEWED);
    await open(page, "progress");
    await shoot(page, "4-reviewed", size, ".card");
    await page.locator(".card .pop-chip", { hasText: "Agent approves" }).first().click();
    await settle(page);
    await shoot(page, "5-review-open", size, ".card");

    const res = await page.request.put(`${URL}/api/projects/${PROJECT}/slots/${SLOT}/approval`, { data: { version: 2 } });
    console.log("approve", res.status());
    await open(page, "done");
    await shoot(page, "6-done-shelf", size, ".done-grid");
    await page.locator(".tile .tile-details").first().click();
    await page.waitForSelector(".detail-view");
    // Details opens over the Done shelf. Clear what is behind it, so the card sits on the plain page colour like the others.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll(".done-grid, .tabs")) el.style.visibility = "hidden";
      for (let el = document.querySelector(".detail-view"); el && el !== document.body; el = el.parentElement) {
        if (getComputedStyle(el).position === "fixed" || el.classList.contains("detail-view")) el.style.background = "#1d1b21";
      }
    });
    await settle(page);
    await shoot(page, "7-approved", size, ".detail-view > .card");

    await context.close();
  }
} finally {
  await browser.close();
}
writeFileSync(join(OUT, "README.txt"), "Real cards of the app, captured by ../cards.mjs from a staged copy of one slot.\n");
