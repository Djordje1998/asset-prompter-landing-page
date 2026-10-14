// Checks the published site itself, after a push to main has gone live (run by .github/workflows/indexnow.yml): both
// home pages answer 200 with their own canonical address, the three hreflang links and no noindex, and /guides/ and
// /sr/guides/ with their canonical and no noindex; robots.txt lets crawlers
// in and names the sitemap; the sitemap, llms.txt, llms-full.txt and the IndexNow key are served; an address with no
// file answers 404. The checks before merging cannot see these; a failure here means the deploy went wrong.
//   node tools/live-check.mjs [origin=https://assetprompter.com]   exit 1, listing every problem, if anything is wrong
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://assetprompter.com";
const ORIGIN = (process.argv[2] ?? SITE).replace(/\/$/, "");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HREFLANG = { en: `${SITE}/`, sr: `${SITE}/sr/`, "x-default": `${SITE}/` };
const keyFile = readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
const fails = [];

async function get(path) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(ORIGIN + path, { redirect: "manual" });
      return { status: res.status, headers: res.headers, text: await res.text() };
    } catch (e) {
      if (attempt === 3) return { status: 0, headers: new Headers(), text: String(e.cause?.code || e.message) };
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
  }
}
const expect = (ok, path, msg) => ok || fails.push(`${path}: ${msg}`);
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

for (const path of ["/", "/sr/"]) {
  const { status, headers, text } = await get(path);
  if (!expect(status === 200, path, `HTTP ${status} ${status ? "" : text}`)) continue;
  const head = text.split("</head>")[0];
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const canonical = links.filter((t) => attr(t, "rel") === "canonical").map((t) => attr(t, "href"));
  expect(canonical.length === 1 && canonical[0] === SITE + path, path, `canonical is ${canonical.join(", ") || "missing"}`);
  const alts = Object.fromEntries(links.filter((t) => attr(t, "rel") === "alternate" && attr(t, "hreflang")).map((t) => [attr(t, "hreflang"), attr(t, "href")]));
  expect(JSON.stringify(alts, Object.keys(HREFLANG)) === JSON.stringify(HREFLANG) && Object.keys(alts).length === 3, path, `hreflang links are ${JSON.stringify(alts)}`);
  expect(!/<meta[^>]+name="robots"[^>]+noindex/i.test(head) && !/noindex/i.test(headers.get("x-robots-tag") ?? ""), path, "says noindex");
}
// The guides' index stands for the guides, in each language: it answers with its own canonical and no noindex.
for (const path of ["/guides/", "/sr/guides/"]) {
  const { status, headers, text } = await get(path);
  if (expect(status === 200, path, `HTTP ${status} ${status ? "" : text}`)) {
    const head = text.split("</head>")[0];
    const canonical = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((t) => attr(t, "rel") === "canonical").map((t) => attr(t, "href"));
    expect(canonical.length === 1 && canonical[0] === SITE + path, path, `canonical is ${canonical.join(", ") || "missing"}`);
    expect(!/<meta[^>]+name="robots"[^>]+noindex/i.test(head) && !/noindex/i.test(headers.get("x-robots-tag") ?? ""), path, "says noindex");
  }
}
const robots = await get("/robots.txt");
expect(robots.status === 200, "/robots.txt", `HTTP ${robots.status}`);
expect(robots.text.includes(`Sitemap: ${SITE}/sitemap.xml`), "/robots.txt", "does not name the sitemap");
expect(!/^Disallow:\s*\/\s*$/m.test(robots.text), "/robots.txt", "disallows the whole site");
for (const path of ["/sitemap.xml", "/llms.txt", "/llms-full.txt"]) {
  const { status } = await get(path);
  expect(status === 200, path, `HTTP ${status}`);
}
if (keyFile) {
  const { status, text } = await get("/" + keyFile);
  expect(status === 200 && text.trim() === keyFile.slice(0, -4), "/" + keyFile, `HTTP ${status}, or not the key`);
}
const missing = await get("/does-not-exist");
expect(missing.status === 404, "/does-not-exist", `HTTP ${missing.status}, expected 404`);

if (fails.length) {
  console.error(`live-check: ${fails.length} problem(s) on ${ORIGIN}\n` + fails.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log(`live-check: ok (${ORIGIN})`);
