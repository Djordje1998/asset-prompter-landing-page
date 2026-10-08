// Measures the stand-in faces at the end of section 2 of styles.css (the "... Fallback" rules): for each, the
// size-adjust that lays the page's own text out closest to the font it stands in for, at 360 to 1920 px in both
// languages, and the ascent, descent and line-gap overrides that go with it (the font's own, divided by size-adjust).
//
//   node tools/serve.mjs . 8080                      in another terminal
//   node tools/fallback-fonts.mjs [http://localhost:8080]
//
// It prints each rule's values as styles.css has them and as measured; change them there when they differ (after a
// font update, or a change of the text that moves them). Run it where Arial and Courier New, or Liberation Sans and
// Liberation Mono, are installed. Needs playwright-core and a Chromium or Edge (CHROME, or EDGE, overrides the path).
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");
const BROWSER = process.env.CHROME ?? process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "styles.css"), "utf8");
const PAGES = ["/", "/sr/"];
const WIDTHS = [360, 412, 768, 1280, 1920];

// The stand-in rules: their family, weights, sources and range, and the font each stands in for.
const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)]
  .map(([, body]) => Object.fromEntries([...body.matchAll(/([a-z-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])))
  .filter((f) => / Fallback"$/.test(f["font-family"]))
  .map((f) => ({ ...f, font: f["font-family"].replace(/ Fallback"$/, '"'), sa: parseFloat(f["size-adjust"]) / 100 }));
if (!faces.length) throw new Error("no ... Fallback rules in styles.css");

const browser = await chromium.launch({ executablePath: BROWSER });
const pages = [];
for (const path of PAGES)
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    // The height of every element with text of its own, in the fonts; the stand-ins are then put in their place.
    await page.evaluate(async () => {
      await document.fonts.ready;
      const els = [...document.querySelectorAll("body *")].filter((e) => e.getClientRects().length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
      const heights = () => els.map((e) => e.getBoundingClientRect().height);
      const inFonts = heights();
      const style = document.head.appendChild(document.createElement("style"));
      const root = getComputedStyle(document.documentElement);
      // Each stack without its first font, so the stand-in after it takes over.
      const stacks = ["--display", "--body", "--mono"].map((v) => `${v}: ${root.getPropertyValue(v).split(",").slice(1).join(",")};`).join("");
      window.__apart = async (rules) => {
        style.textContent = `${rules} :root { ${stacks} }`;
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        let off = 0;
        heights().forEach((h, i) => (off += Math.abs(h - inFonts[i]) * (els[i].closest(".hero") ? 4 : 1)));
        return off;
      };
    });
    pages.push(page);
  }

// The font's own ascent, descent and line gap, as fractions of its size, from the page that has it loaded.
const metrics = await pages[0].evaluate(async (list) => {
  const out = [];
  for (const { font, weight } of list) {
    const w = weight.split(" ")[0] === "100" ? "400" : weight.split(" ")[0];
    const at = `${w} 1000px ${font}`;
    await document.fonts.load(at);
    const m = Object.assign(document.createElement("canvas").getContext("2d"), { font: at }).measureText("Hg");
    const line = Object.assign(document.body.appendChild(document.createElement("span")), { textContent: "Hg" });
    line.style.cssText = `font: ${at}; line-height: normal; display: inline-block`;
    const normal = line.getBoundingClientRect().height / 1000;
    line.remove();
    const asc = m.fontBoundingBoxAscent / 1000;
    const desc = m.fontBoundingBoxDescent / 1000;
    out.push({ asc, desc, gap: Math.max(0, +(normal - asc - desc).toFixed(3)) });
  }
  return out;
}, faces.map((f) => ({ font: f.font, weight: f["font-weight"] })));

const pct = (n) => `${(n * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
const rule = (f, sa, m) =>
  `@font-face { font-family: ${f["font-family"]}; font-weight: ${f["font-weight"]}; src: ${f.src}; size-adjust: ${pct(sa)}; ` +
  `ascent-override: ${pct(m.asc / sa)}; descent-override: ${pct(m.desc / sa)}; line-gap-override: ${pct(m.gap / sa)}; unicode-range: ${f["unicode-range"]}; }`;
const rules = (sas) => faces.map((f, i) => rule(f, sas[i], metrics[i])).join("\n");
const apart = async (sas) => {
  let sum = 0;
  for (const page of pages) sum += await page.evaluate((r) => window.__apart(r), rules(sas));
  return Math.round(sum);
};

// One face at a time, 6 % either side in steps of 0.5 %, twice round.
const now = faces.map((f) => f.sa);
const best = [...now];
for (let round = 0; round < 2; round++)
  for (let i = 0; i < faces.length; i++) {
    let pick = { sa: best[i], off: await apart(best) };
    for (let k = -12; k <= 12; k++) {
      const sa = +(now[i] + k * 0.005).toFixed(3);
      const off = await apart(best.map((v, j) => (j === i ? sa : v)));
      if (off < pick.off) pick = { sa, off };
    }
    best[i] = pick.sa;
  }
const [offNow, offBest] = [await apart(now), await apart(best)];
await browser.close();

console.log(`Text out of place in the stand-ins (px of height, the hero's counted 4 times): ${offNow} as in styles.css, ${offBest} as measured`);
faces.forEach((f, i) => {
  const m = metrics[i];
  console.log(`${f["font-family"]} ${f["font-weight"]}: size-adjust ${pct(now[i])} -> ${pct(best[i])}; ascent ${pct(m.asc / best[i])}, descent ${pct(m.desc / best[i])}, line gap ${pct(m.gap / best[i])}`);
});
