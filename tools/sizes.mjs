// The smaller copies of the screenshots in assets/app/ and assets/shots/, which index.html offers in srcset beside the
// full picture, as <name>-<width>.webp: half its width. A screen that needs no more device pixels than that takes it;
// any other still gets the full picture. Only the half: a copy at three quarters saved less than a fifth of the bytes,
// and a phone of two device pixels per px would have taken it instead of the full picture. A copy keeps the exact shape of the full picture
// (width and height divided by the same number), because the page lays a picture out by the shape of the file it got:
// a copy a fraction of a pixel taller would move everything under it. A picture whose shape allows no such size near
// the half gets no copy. WebP at quality 90, scaled in the browser at its best quality. The illustrations and the clips
// are pixel art and are never scaled or encoded again.
// Needs playwright-core and a Chromium or Edge (CHROME, or EDGE, overrides the path). Run it again after retaking a picture.
import { chromium } from "playwright-core";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BROWSER = process.env.CHROME ?? process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const FOLDERS = ["assets/app", "assets/shots"];
const SHARES = [0.5];
const QUALITY = 0.9;

const browser = await chromium.launch({ executablePath: BROWSER });
const page = await browser.newPage();
for (const folder of FOLDERS) {
  // A copy is named after its width; it is not scaled again.
  const files = readdirSync(join(ROOT, folder));
  for (const file of files.filter((f) => f.endsWith(".webp") && !/-\d+\.webp$/.test(f))) {
    // The copies made before go first, so a picture retaken at another size leaves no copy of its old size behind.
    const stem = file.replace(/\.webp$/, "");
    for (const old of files.filter((f) => f.startsWith(stem + "-") && /^\d+\.webp$/.test(f.slice(stem.length + 1)))) {
      rmSync(join(ROOT, folder, old));
    }
    const data = `data:image/webp;base64,${readFileSync(join(ROOT, folder, file)).toString("base64")}`;
    const copies = await page.evaluate(
      async ({ data, shares, quality }) => {
        const img = new Image();
        img.src = data;
        await img.decode();
        const out = [];
        // The smallest size with the picture's exact shape; every exact size is a whole number of it.
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const step = img.naturalWidth / gcd(img.naturalWidth, img.naturalHeight);
        const widths = new Set(shares.map((share) => Math.round((img.naturalWidth * share) / step) * step));
        for (const w of widths) {
          // Too close to the full picture to be worth a file.
          if (!w || w > img.naturalWidth * 0.85) continue;
          const h = (img.naturalHeight * w) / img.naturalWidth;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          const blob = await new Promise((done) => canvas.toBlob(done, "image/webp", quality));
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let text = "";
          for (const b of bytes) text += String.fromCharCode(b);
          out.push({ w, h, base64: btoa(text) });
        }
        return out;
      },
      { data, shares: SHARES, quality: QUALITY },
    );
    for (const { w, h, base64 } of copies) {
      const name = file.replace(/\.webp$/, `-${w}.webp`);
      writeFileSync(join(ROOT, folder, name), Buffer.from(base64, "base64"));
      console.log(`${folder}/${name} ${w}x${h}`);
    }
  }
}
await browser.close();
