// The smaller copies of the screenshots in assets/app/ and assets/shots/, which index.html offers in srcset beside the
// full picture: half and three quarters of its width, as <name>-<width>.webp. A phone or a screen of normal density
// takes one of them; a sharper screen still gets the full picture. WebP at quality 90, scaled in the browser at its
// best quality. The illustrations and the clips are pixel art and are never scaled or encoded again.
// Needs playwright-core and a Chromium or Edge (CHROME, or EDGE, overrides the path). Run it again after retaking a picture.
import { chromium } from "playwright-core";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BROWSER = process.env.CHROME ?? process.env.EDGE ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const FOLDERS = ["assets/app", "assets/shots"];
const SHARES = [0.5, 0.75];
const QUALITY = 0.9;

const browser = await chromium.launch({ executablePath: BROWSER });
const page = await browser.newPage();
for (const folder of FOLDERS) {
  // A copy is named after its width; it is not scaled again.
  for (const file of readdirSync(join(ROOT, folder)).filter((f) => f.endsWith(".webp") && !/-\d+\.webp$/.test(f))) {
    const data = `data:image/webp;base64,${readFileSync(join(ROOT, folder, file)).toString("base64")}`;
    const copies = await page.evaluate(
      async ({ data, shares, quality }) => {
        const img = new Image();
        img.src = data;
        await img.decode();
        const out = [];
        for (const share of shares) {
          // Even widths, and the height that keeps the picture's shape.
          const w = Math.round((img.naturalWidth * share) / 2) * 2;
          const h = Math.round((img.naturalHeight * w) / img.naturalWidth);
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
