// The icons beside favicon.svg, drawn from it: favicon.ico (16, 32 and 48 px), apple-touch-icon.png, icon-192.png,
// icon-512.png and icon-512-maskable.png. The SVG is 16 by 16 pixel art, so each icon draws it at a whole number of
// pixels per square, and every pixel stays one of its colours.
// Needs playwright-core and pngjs, and a Chromium or Edge (CHROME, or EDGE, overrides the path). Writes to the repository root.
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BROWSER = process.env.CHROME ?? process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const svg = readFileSync(join(ROOT, "favicon.svg"), "utf8");
// --page in styles.css, the colour of the icon's own tile.
const PAGE = "#1d1b21";

// size: the icon's edge; scale: pixels per square of the SVG; ground: a colour under it all, or none (the tile's corners stay clear).
const ICONS = [
  { name: "16", size: 16, scale: 1 },
  { name: "32", size: 32, scale: 2 },
  { name: "48", size: 48, scale: 3 },
  { name: "icon-192.png", size: 192, scale: 12 },
  { name: "icon-512.png", size: 512, scale: 32 },
  // iOS draws a clear pixel black, so this one has a ground: 11 pixels a square (176 px) in the middle of 180.
  { name: "apple-touch-icon.png", size: 180, scale: 11, ground: PAGE },
  // A maskable icon is cut to a circle or a rounded square, so the drawing keeps inside the middle 80%: 20 pixels a square.
  { name: "icon-512-maskable.png", size: 512, scale: 20, ground: PAGE },
];

const browser = await chromium.launch({ executablePath: BROWSER });
const page = await browser.newPage();
const drawn = {};
for (const { name, size, scale, ground } of ICONS) {
  const edge = scale * 16;
  const at = (size - edge) / 2;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:${ground ?? "transparent"}}svg{position:absolute;left:${at}px;top:${at}px}</style>` +
      svg.replace("<svg ", `<svg width="${edge}" height="${edge}" `),
  );
  drawn[name] = PNG.sync.read(await page.screenshot({ omitBackground: !ground }));
}
await browser.close();

// At 16 px Chromium rounds only two corners of the tile; the other two are cut here, so the four match.
for (const [x, y] of [[0, 0], [15, 0], [0, 15], [15, 15]]) drawn["16"].data[(y * 16 + x) * 4 + 3] = 0;

for (const { name } of ICONS) if (name.endsWith(".png")) writeFileSync(join(ROOT, name), PNG.sync.write(drawn[name]));

// favicon.ico holds 16, 32 and 48 px as 32-bit bitmaps: rows from the bottom up, BGRA, then a 1-bit mask of the clear pixels.
const bitmap = ({ width: w, height: h, data }) => {
  const maskRow = Math.ceil(w / 32) * 4;
  const out = Buffer.alloc(40 + w * h * 4 + maskRow * h);
  out.writeUInt32LE(40, 0);
  out.writeInt32LE(w, 4);
  out.writeInt32LE(h * 2, 8);
  out.writeUInt16LE(1, 12);
  out.writeUInt16LE(32, 14);
  out.writeUInt32LE(w * h * 4 + maskRow * h, 20);
  let o = 40;
  for (let y = h - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      out.set([data[i + 2], data[i + 1], data[i], data[i + 3]], o);
      o += 4;
    }
  }
  for (let y = h - 1; y >= 0; y--, o += maskRow) {
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] === 0) out[o + (x >> 3)] |= 0x80 >> (x & 7);
  }
  return { w, h, body: out };
};
const parts = ["16", "32", "48"].map((name) => bitmap(drawn[name]));
const head = Buffer.alloc(6 + 16 * parts.length);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(parts.length, 4);
let offset = head.length;
parts.forEach(({ w, h, body }, n) => {
  const at = 6 + 16 * n;
  head[at] = w;
  head[at + 1] = h;
  head.writeUInt16LE(1, at + 4);
  head.writeUInt16LE(32, at + 6);
  head.writeUInt32LE(body.length, at + 8);
  head.writeUInt32LE(offset, at + 12);
  offset += body.length;
});
writeFileSync(join(ROOT, "favicon.ico"), Buffer.concat([head, ...parts.map((p) => p.body)]));
