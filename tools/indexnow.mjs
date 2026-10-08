// Tells the IndexNow search engines (Bing, and through it Copilot and DuckDuckGo; Yandex, Seznam, Naver, Yep: one
// submission reaches all of them) which addresses changed. Google does not take IndexNow; it reads sitemap.xml.
// Run by .github/workflows/indexnow.yml after each push to main.
//   node tools/indexnow.mjs <from-commit> <to-commit>   the addresses that changed between the two commits: a page
//                                                       of sitemap.xml whose file or lastmod changed, llms.txt and
//                                                       llms-full.txt when they changed
//   node tools/indexnow.mjs --all                        every address in sitemap.xml
//   add --dry-run to see what would be sent and whether the site serves it yet, without sending
// The key is the name of the <32 hex>.txt file at the root, which holds the same text. Before sending, it waits until
// the site serves the files of this commit byte for byte (GitHub Pages publishes a push within a few minutes), so the
// crawlers that come read the new text; after 10 minutes it sends anyway, with a warning. When IndexNow itself is
// down or busy it warns and ends without failing; only a refusal of our own request (a wrong key or host) fails.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://assetprompter.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const EXTRA = ["llms.txt", "llms-full.txt"]; // read by AI assistants, not in the sitemap

const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const [from, to] = args.filter((a) => !a.startsWith("--"));
const warn = (msg) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=IndexNow::${msg}` : `warning: ${msg}`);
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

const keyFile = readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("no <key>.txt at the root");
const key = keyFile.slice(0, -4);
if (readFileSync(join(ROOT, keyFile), "utf8").trim() !== key) throw new Error(`${keyFile} does not hold its own name`);

// sitemap.xml -> Map(address -> lastmod); an address's file is the one GitHub Pages serves for it.
const lastmods = (xml) =>
  new Map([...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, b]) => [b.match(/<loc>([^<]+)<\/loc>/)?.[1], b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]]));
const fileOf = (url) => url.slice(SITE.length + 1).replace(/(^|\/)$/, "$1index.html");
const now = lastmods(readFileSync(join(ROOT, "sitemap.xml"), "utf8"));

let urls;
if (args.includes("--all")) urls = [...now.keys()];
else {
  if (!from || !to) throw new Error("usage: indexnow.mjs <from> <to> | --all  [--dry-run]");
  const changed = new Set(git("diff", "--name-only", "--no-renames", "--diff-filter=AM", `${from}..${to}`).split("\n"));
  let before = new Map();
  try {
    before = lastmods(git("show", `${from}:sitemap.xml`));
  } catch {} // no sitemap then: every address is new
  urls = [...now].filter(([url, lastmod]) => changed.has(fileOf(url)) || before.get(url) !== lastmod).map(([url]) => url);
  for (const f of EXTRA) if (changed.has(f)) urls.push(`${SITE}/${f}`);
}
if (!urls.length) {
  console.log("indexnow: no address changed, nothing to send");
  process.exit(0);
}
console.log("indexnow:", urls.join(" "));

// Wait until the site serves the files of this commit: the key file too, since the engines fetch it to check the key.
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const live = async (path) => {
  // No cache-busting query: what matters is what a crawler gets for the plain address.
  try {
    const res = await fetch(SITE + path);
    return res.ok ? sha(Buffer.from(await res.arrayBuffer())) : `HTTP ${res.status}`;
  } catch (e) {
    return String(e.cause?.code || e.cause?.message || e.message);
  }
};
const pending = [...urls.map(fileOf), keyFile].map((f) => [f, "/" + f.replace(/(^|\/)index\.html$/, "$1"), sha(readFileSync(join(ROOT, f)))]);
for (let i = 0; pending.length; i++) {
  for (const [j, [f, path, want]] of [...pending.entries()].reverse()) {
    const got = await live(path);
    if (got === want) pending.splice(j, 1), console.log(`  live: ${f}`);
    else if (dry) console.log(`  not live yet: ${f} (${got.startsWith("HTTP") || got.length !== 64 ? got : "other bytes"})`);
  }
  if (!pending.length || dry) break;
  if (i === 20) {
    warn(`after 10 minutes the site still serves other bytes for ${pending.map((p) => p[0]).join(", ")}; sending anyway`);
    break;
  }
  await new Promise((r) => setTimeout(r, 30_000));
}

const body = { host: new URL(SITE).host, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls };
if (dry) {
  console.log(`POST ${ENDPOINT}\n${JSON.stringify(body, null, 2)}`);
  process.exit(0);
}
// 200: received. 202: received, the key is still being checked (the first time). 400, 403, 422: our request is wrong
// (the key, the host, an address of another site), so fail. 429 (too many requests), 5xx or no answer: try twice
// more, then warn; the next push sends again.
for (let attempt = 1; ; attempt++) {
  let status, text;
  try {
    const res = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(body) });
    [status, text] = [res.status, (await res.text()).trim()];
  } catch (e) {
    [status, text] = [0, String(e.cause?.code || e.cause?.message || e.message)];
  }
  console.log(`indexnow: ${status ? `HTTP ${status}` : "no answer"} ${text}`.trim());
  if (status === 200 || status === 202) break;
  if (status >= 400 && status < 500 && status !== 429) {
    console.log(process.env.GITHUB_ACTIONS ? `::error title=IndexNow::HTTP ${status}: the request was refused` : `error: HTTP ${status}`);
    process.exit(1);
  }
  if (attempt === 3) {
    warn(`IndexNow did not take the addresses (${status ? `HTTP ${status}` : text}); they go with the next push, or run the workflow by hand`);
    break;
  }
  await new Promise((r) => setTimeout(r, attempt * 60_000));
}
