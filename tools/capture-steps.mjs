// Two more real pieces of the app for the landing page's six steps, from the same staged slot as cards.mjs:
// the prompt box right after Copy prompt, and the filter row with Notify agent while an agent is listening.
// Needs the second app instance on port 4796 (see cards.mjs).
import { chromium } from "playwright-core";
import { cpSync, mkdirSync, rmSync, utimesSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "cards");
const URL = "http://127.0.0.1:4796";
const EDGE = process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PROJECT = "orbital-eats";
const SLOT = "observation-dining-room";
// The app's projects folder: APP_PROJECTS, or the app checked out next to this repository.
const PROJECTS = process.env.APP_PROJECTS ?? join(HERE, "..", "..", "asset-prompter", "projects");
const SRC = join(PROJECTS, PROJECT, SLOT);
const DST = join(HERE, "..", "cards", "projects", PROJECT, SLOT);
mkdirSync(OUT, { recursive: true });

function stage(files) {
  rmSync(join(DST, ".."), { recursive: true, force: true });
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

async function settle(page, ms = 700) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => !i.complete);
    await Promise.all(imgs.map((i) => new Promise((r) => ((i.onload = r), (i.onerror = r)))));
  });
  await page.waitForTimeout(ms);
}

async function open(page) {
  await page.goto(URL + "/");
  await page.evaluate(
    (s) => {
      localStorage.clear();
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
    },
    { "tutorial:seen": "1", project: PROJECT, tab: "progress" },
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
  await page.screenshot({ path: join(OUT, `${name}-${size}.png`), clip });
  console.log(name, size, Math.round(box.width), "x", Math.round(box.height));
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
try {
  for (const size of Object.keys(SIZES)) {
    const context = await browser.newContext({ viewport: SIZES[size], deviceScaleFactor: 2, colorScheme: "dark" });
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: URL });
    const page = await context.newPage();

    // The prompt box, once Copy prompt was pressed: the button turns green.
    stage(["slot.md", "v1.md"]);
    await open(page);
    await page.locator(".card .prompt-bar .btn", { hasText: "Copy prompt" }).first().click();
    // Let the "Prompt copied" toast leave.
    await page.waitForTimeout(4500);
    await shoot(page, "2-copied", size, ".card .prompt");

    // The filter row with Notify agent, while an agent waits on this project.
    stage(["slot.md", "v1.md", "v1/1.png"]);
    const waiting = fetch(`${URL}/api/projects/${PROJECT}/wait`).then((r) => r.text()).catch(() => "");
    await page.waitForTimeout(800);
    await open(page);
    await settle(page, 1200);
    console.log("listening button:", await page.locator(".notify.is-listening").count());
    await shoot(page, "4-notify", size, ".filters");
    await fetch(`${URL}/api/projects/${PROJECT}/stop`, { method: "POST" });
    await waiting;

    await context.close();
  }
} finally {
  await browser.close();
}
