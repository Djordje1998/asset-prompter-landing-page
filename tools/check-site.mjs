// Checks the published files without a browser and without packages (Node 18 or later), as the "files" job of
// .github/workflows/check.yml does before a change reaches main:
// - the Serbian pages (sr/index.html, sr/guides/...) are what tools/build-sr.mjs makes from the current English pages,
//   i18n.js and i18n-guides.js;
// - the pages are every index.html in the folder (the home page, the guides, their Serbian copies under sr/); a page X
//   and sr/X, when it exists, are one page in two languages;
// - every address on this site that a page, the stylesheet, the JSON-LD, the manifest, robots.txt, the sitemap or
//   llms.txt names is a real file, and every in-page #anchor has its id;
// - the head of each page: one canonical, its own address (og:url too); hreflang links that name each language of the
//   page once, plus x-default (the English one), the same in each language and in the sitemap; title and description
//   lengths; one h1; no noindex; the pages below the home pages use root addresses only, as 404.html does;
// - each page links its other language with an <a href>, its other links to pages stay in its language (/sr/ links
//   /sr/guides/), and no address on the pages, in the JSON-LD, the sitemap or llms.txt carries ?lang= (the script at the
//   top of the <head> still reads it, for old links);
// - the JSON-LD parses, has what each kind of node needs, every @id is defined once in a page and every reference to
//   one resolves on some page (a guide points at the site, the app and the author of the home page), the page's name
//   and description are its title and description, an article's headline is its h1, the questions are as many as the
//   page shows, and the page's dateModified is its lastmod in sitemap.xml and the date the page shows (<time>);
// - one ?v= stamp for the stylesheet and the scripts across the pages, and the IndexNow key file holds its own name.
//   node tools/check-site.mjs [folder]   exit 1, listing every problem, if anything is wrong
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://assetprompter.com";
const OTHER_HTML = ["404.html", "tools/og.html"];
// The folders that hold no page.
const SKIP_DIRS = new Set([".git", ".github", ".claude", "node_modules", "tools", "assets", "lh", "cards"]);
// What each kind of node in the JSON-LD must have (a dotted path is a property of a property).
const REQUIRED = {
  WebSite: ["url", "name", "publisher"],
  WebPage: ["url", "name", "description", "inLanguage", "isPartOf", "primaryImageOfPage.url", "dateModified"],
  CollectionPage: ["url", "name", "description", "inLanguage", "isPartOf", "primaryImageOfPage.url", "dateModified"],
  Article: ["headline", "description", "inLanguage", "author", "publisher", "image", "datePublished", "dateModified"],
  TechArticle: ["headline", "description", "inLanguage", "author", "publisher", "image", "datePublished", "dateModified"],
  BreadcrumbList: ["itemListElement"],
  SoftwareApplication: ["name", "description", "url", "applicationCategory", "operatingSystem", "offers.price", "offers.priceCurrency", "author"],
  SoftwareSourceCode: ["codeRepository", "license", "author"],
  Person: ["name", "url"],
  FAQPage: ["inLanguage", "mainEntity"],
};
const fails = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);
const read = (f) => readFileSync(join(ROOT, f), "utf8");

// file -> its address: every index.html in the folder, the home page first.
function findPages(dir = "") {
  const found = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) found.push(...findPages(rel));
    else if (entry.isFile() && entry.name === "index.html") found.push(rel);
  }
  return found;
}
const PAGES = Object.fromEntries(
  findPages()
    .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b))
    .map((f) => [f, "/" + f.replace(/index\.html$/, "")]),
);
// The languages of a page: { en: file, sr: file } for X and sr/X.
const languagesOf = (file) => {
  const en = file.replace(/^sr\//, "");
  return Object.fromEntries(Object.entries({ en, sr: "sr/" + en }).filter(([, f]) => f in PAGES));
};
// The home pages may address the site relatively; every other page is reached at its own depth, so starts at the root.
const HOMES = new Set(["index.html", "sr/index.html"]);

// An address on this site -> the file GitHub Pages serves for it, or null for anything elsewhere.
function toFile(url, fromFile) {
  if (!url || /^(data:|mailto:|tel:|javascript:|#|%23)/i.test(url)) return null;
  if (url.startsWith(ORIGIN)) url = url.slice(ORIGIN.length) || "/";
  else if (/^[a-z]+:|^\/\//i.test(url)) return null;
  url = decodeURI(url.split("#")[0].split("?")[0]);
  if (!url) return null;
  let p = url.startsWith("/") ? url.slice(1) : posix.join(posix.dirname(fromFile), url);
  if (p === "" || p === "." || p.endsWith("/")) p = posix.join(p, "index.html");
  else if (existsSync(join(ROOT, p)) && statSync(join(ROOT, p)).isDirectory()) p += "/index.html";
  return p;
}
const mustExist = (url, fromFile, where) => {
  const f = toFile(url, fromFile);
  if (f && !existsSync(join(ROOT, f))) fail(where, `${url} -> missing ${f}`);
};
// The full address a link on a page leads to.
const resolve = (href, pageUrl) => new URL(href, ORIGIN + pageUrl).href.split("#")[0];
const hasLang = (s) => /[?&]lang=/.test(s);

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1];
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => m[0]);
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " })[e]);
const stripScripts = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
const types = (n) => [].concat(n?.["@type"] ?? []);
const get = (o, path) => path.split(".").reduce((v, k) => (v == null ? v : Array.isArray(v) ? v[0]?.[k] : v[k]), o);

// ---- sitemap.xml, read first: the pages are checked against it
const sitemap = read("sitemap.xml");
const entries = new Map(); // address -> { lastmod, alternates }
for (const [, block] of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) { fail("sitemap.xml", "a <url> without <loc>"); continue; }
  const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  if (!lastmod) fail("sitemap.xml", `${loc} has no lastmod`);
  else if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2}))?$/.test(lastmod) || Number.isNaN(Date.parse(lastmod)))
    fail("sitemap.xml", `lastmod ${lastmod} of ${loc} is not a W3C date`);
  const alternates = Object.fromEntries(tags(block, "xhtml:link").map((t) => [attr(t, "hreflang"), attr(t, "href")]));
  entries.set(loc, { lastmod, alternates });
  mustExist(loc, "", "sitemap.xml");
  if (hasLang(loc)) fail("sitemap.xml", `${loc} carries ?lang=`);
}

const versions = new Map(); // "styles.css" -> Map(page -> ?v= value)

function checkRefs(file, html) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  // The scripts' own addresses first: what follows reads the page without its scripts.
  const scripts = tags(html.replace(/<!--[\s\S]*?-->/g, ""), "script")
    .map((t) => attr(t, "src"))
    .filter((v) => v !== undefined)
    .map((v) => [, "src", v]);
  const body = stripScripts(html);
  // The 404 page is shown at any depth, and the guides sit deeper than the home pages: their addresses start at the root.
  const rootOnly = file === "404.html" || (file in PAGES && !HOMES.has(file));
  for (const [, a, v] of [...scripts, ...body.matchAll(/\s(href|src|poster|data-video|data-video-av1|data-src)="([^"]*)"/g)]) {
    if (v.startsWith("#")) {
      if (v.length > 1 && !ids.has(v.slice(1))) fail(file, `${a}="${v}" has no element with that id`);
      continue;
    }
    if (rootOnly && !/^(\/|https?:|mailto:)/.test(v)) fail(file, `${a}="${v}" is relative; this page needs root addresses`);
    mustExist(v, file, file);
    const ver = v.match(/(?:^|\/)(styles\.css|main\.js|i18n\.js)\?v=([^"&#]+)/);
    if (ver) (versions.get(ver[1]) ?? versions.set(ver[1], new Map()).get(ver[1])).set(file, ver[2]);
  }
  for (const m of body.matchAll(/\ssrcset="([^"]*)"/g))
    for (const part of m[1].split(",")) mustExist(part.trim().split(/\s+/)[0], file, `${file} srcset`);
  for (const t of tags(body, "meta")) {
    const prop = attr(t, "property") ?? attr(t, "name") ?? "";
    if (/^(og:image|twitter:image|og:url)$/.test(prop)) {
      const c = attr(t, "content");
      if (!c?.startsWith("https://")) fail(file, `${prop} must be a full https address, got ${c}`);
      else mustExist(c, file, `${file} ${prop}`);
    }
  }
}

const alternatesOf = new Map(); // page file -> { hreflang: address }

function checkHead(file, url, html) {
  const head = html.split(/<\/head>/i)[0];
  const links = tags(stripScripts(head), "link");
  const canon = links.filter((t) => attr(t, "rel") === "canonical");
  if (canon.length !== 1) fail(file, `expected one canonical, found ${canon.length}`);
  else if (attr(canon[0], "href") !== ORIGIN + url) fail(file, `canonical ${attr(canon[0], "href")} is not ${ORIGIN + url}`);
  const alts = {};
  for (const t of links.filter((t) => attr(t, "rel") === "alternate" && attr(t, "hreflang"))) {
    const lang = attr(t, "hreflang");
    if (lang in alts) fail(file, `two hreflang ${lang} links`);
    alts[lang] = attr(t, "href");
  }
  alternatesOf.set(file, alts);
  const ogUrl = tags(head, "meta").find((t) => attr(t, "property") === "og:url");
  if (ogUrl && attr(ogUrl, "content") !== ORIGIN + url) fail(file, `og:url ${attr(ogUrl, "content")} is not ${ORIGIN + url}`);
  const title = decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? "");
  if (!title || title.length > 60) fail(file, `title is ${title.length} characters (1 to 60): ${title}`);
  const desc = tags(head, "meta").find((t) => attr(t, "name") === "description");
  const d = decode(desc ? attr(desc, "content") ?? "" : "");
  if (d.length < 70 || d.length > 160) fail(file, `description is ${d.length} characters (70 to 160)`);
  const robots = tags(head, "meta").find((t) => attr(t, "name") === "robots");
  if (robots && /noindex/i.test(attr(robots, "content"))) fail(file, "an indexed page says noindex");
  const h1 = (stripScripts(html).match(/<h1\b/gi) ?? []).length;
  if (h1 !== 1) fail(file, `expected one h1, found ${h1}`);
  if (!/<html\b[^>]*\slang="[^"]+"/i.test(html)) fail(file, "<html> has no lang");
}

// Each page links its other language with a plain <a href>, so a crawler that skips hreflang still finds it, and
// none of its addresses carries ?lang=.
function checkLinks(file, url, html) {
  const body = stripScripts(html);
  const targets = new Set(tags(body, "a").map((t) => attr(t, "href")).filter(Boolean).map((h) => resolve(h, url)));
  for (const other of Object.values(languagesOf(file)))
    if (other !== file && !targets.has(ORIGIN + PAGES[other])) fail(file, `no <a href> to the other language, ${ORIGIN + PAGES[other]}`);
  for (const [, a, v] of body.matchAll(/\s([a-z-]+)="([^"]*)"/g)) if (hasLang(v)) fail(file, `${a}="${v}" carries ?lang=`);
  // Every other link to a page stays in the page's language when that page is in it (/sr/ links /sr/guides/, not
  // /guides/); a language link says hreflang.
  const lang = file.startsWith("sr/") ? "sr" : "en";
  for (const t of tags(body, "a")) {
    const href = attr(t, "href");
    if (!href || attr(t, "hreflang") !== undefined || href.startsWith("#")) continue;
    const target = resolve(href, url);
    if (!target.startsWith(ORIGIN + "/")) continue;
    const page = Object.keys(PAGES).find((f) => ORIGIN + PAGES[f] === target);
    const own = page && languagesOf(page)[lang];
    if (own && own !== page) fail(file, `<a href="${href}"> leads to ${target}; in this language it is ${ORIGIN + PAGES[own]}`);
  }
}

const ldIds = new Set(); // every @id a page defines
const ldRefs = []; // [file, @id, path]: resolved once every page is read

function checkJsonLd(file, url, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length !== 1) return fail(file, `expected one JSON-LD block, found ${blocks.length}`);
  let data;
  try {
    data = JSON.parse(blocks[0][1]);
  } catch (e) {
    return fail(file, `JSON-LD does not parse: ${e.message}`);
  }
  if (data["@context"] !== "https://schema.org") fail(file, `@context is ${data["@context"]}`);
  const graph = data["@graph"] ?? [data];
  // A node is defined where it has more than its @id, anywhere in the block; an object with only @id points to one.
  const defined = new Set();
  const refs = [];
  const walk = (v, path) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (v && typeof v === "object") {
      const id = v["@id"];
      if (id && Object.keys(v).length === 1) refs.push([id, path]);
      else if (id) defined.has(id) ? fail(file, `@id ${id} is defined twice`) : defined.add(id);
      for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
    } else if (typeof v === "string" && v.startsWith(ORIGIN)) {
      mustExist(v, file, `${file} JSON-LD ${path}`);
      if (hasLang(v)) fail(file, `JSON-LD ${path} ${v} carries ?lang=`);
    }
  };
  walk(graph, "@graph");
  for (const id of defined) ldIds.add(id);
  for (const [id, path] of refs) ldRefs.push([file, id, path]);
  for (const n of graph) {
    if (!types(n).length) fail(file, `JSON-LD node ${n["@id"] ?? "?"} has no @type`);
    for (const t of types(n))
      for (const p of REQUIRED[t] ?? []) {
        const v = get(n, p);
        if (v == null || v === "" || (Array.isArray(v) && !v.length)) fail(file, `JSON-LD ${t} ${n["@id"] ?? ""} has no ${p}`);
      }
  }
  const lang = html.match(/<html\b[^>]*\slang="([^"]+)"/i)?.[1];
  const page = graph.find((n) => types(n).some((t) => t === "WebPage" || t === "CollectionPage"));
  const head = html.split(/<\/head>/i)[0];
  const text = (s) => decode(s.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
  if (!page) fail(file, "JSON-LD has no WebPage");
  else {
    if (page.url !== ORIGIN + url) fail(file, `WebPage url ${page.url} is not ${ORIGIN + url}`);
    if (page.inLanguage !== lang) fail(file, `WebPage inLanguage ${page.inLanguage} is not the page's lang ${lang}`);
    const lastmod = entries.get(ORIGIN + url)?.lastmod;
    if (page.dateModified !== lastmod) fail(file, `WebPage dateModified ${page.dateModified} is not its lastmod in sitemap.xml, ${lastmod}`);
    const title = text(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    if (page.name !== title) fail(file, `WebPage name is not the title: ${page.name}`);
    const desc = tags(head, "meta").find((t) => attr(t, "name") === "description");
    if (desc && page.description !== decode(attr(desc, "content") ?? "")) fail(file, "WebPage description is not the meta description");
  }
  for (const article of graph.filter((n) => types(n).some((t) => /Article$/.test(t)))) {
    const h1 = text(stripScripts(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
    if (article.headline !== h1) fail(file, `${types(article)[0]} headline is not the h1: ${article.headline}`);
    if (article.inLanguage !== lang) fail(file, `${types(article)[0]} inLanguage ${article.inLanguage} is not the page's lang ${lang}`);
    if (page && article.dateModified !== page.dateModified) fail(file, `${types(article)[0]} dateModified is not the WebPage's`);
    if (!new RegExp(`<time datetime="${article.dateModified}"`).test(html)) fail(file, `the page shows no <time datetime="${article.dateModified}">, its dateModified`);
  }
  const faq = graph.find((n) => types(n).includes("FAQPage"));
  if (faq) {
    const visible = (stripScripts(html).match(/<details\b/gi) ?? []).length;
    const questions = [].concat(faq.mainEntity ?? []);
    if (questions.length !== visible) fail(file, `FAQPage has ${questions.length} questions, the page shows ${visible}`);
    questions.forEach((q, i) => {
      if (!types(q).includes("Question") || !q.name || !q.acceptedAnswer?.text) fail(file, `FAQPage question ${i + 1} needs @type Question, name and acceptedAnswer.text`);
    });
    if (faq.inLanguage !== lang) fail(file, `FAQPage inLanguage ${faq.inLanguage} is not the page's lang ${lang}`);
  }
}

// ---- the Serbian pages are up to date
const sr = spawnSync(process.execPath, [join(ROOT, "tools/build-sr.mjs"), "--check"], { encoding: "utf8" });
if (sr.status !== 0) fail("sr/", (sr.stderr || sr.stdout).trim() || "tools/build-sr.mjs --check failed");

// ---- pages
const pages = Object.entries(PAGES).filter(([f]) => existsSync(join(ROOT, f)));
for (const f of Object.keys(PAGES)) if (!existsSync(join(ROOT, f))) fail(f, "missing (listed in PAGES)");
for (const [file, url] of pages) {
  const html = read(file);
  checkRefs(file, html);
  checkHead(file, url, html);
  checkLinks(file, url, html);
  checkJsonLd(file, url, html);
  if (!entries.has(ORIGIN + url)) fail("sitemap.xml", `does not list ${ORIGIN + url}`);
}
// Every @id a page points to is defined on some page.
for (const [file, id, path] of ldRefs) if (!ldIds.has(id)) fail(file, `JSON-LD ${path} points to ${id}, which no page defines`);
// hreflang: each language of a page names each of its languages once, by its address, plus x-default for the English
// one; its languages and the sitemap say the same.
for (const [file, alts] of alternatesOf) {
  const langs = languagesOf(file);
  const expected = { ...Object.fromEntries(Object.entries(langs).map(([l, f]) => [l, ORIGIN + PAGES[f]])), "x-default": ORIGIN + PAGES[langs.en] };
  const sorted = (o) => JSON.stringify(o, Object.keys(o).sort());
  if (sorted(alts) !== sorted(expected)) fail(file, `hreflang links are ${sorted(alts)}; expected ${sorted(expected)}`);
  for (const [l] of Object.entries(alts)) if (l !== "x-default" && !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(l)) fail(file, `hreflang ${l} is not a language code`);
  for (const other of Object.values(langs))
    if (other !== file && alternatesOf.has(other) && sorted(alternatesOf.get(other)) !== sorted(alts))
      fail(file, `hreflang links differ from those of ${other}, so they do not point back`);
  const entry = entries.get(ORIGIN + PAGES[file]);
  if (entry && JSON.stringify(entry.alternates, Object.keys(entry.alternates).sort()) !== JSON.stringify(alts, Object.keys(alts).sort()))
    fail("sitemap.xml", `the alternates of ${ORIGIN + PAGES[file]} are not those in ${file}`);
}
for (const file of OTHER_HTML.filter((f) => existsSync(join(ROOT, f)))) {
  const html = read(file);
  checkRefs(file, html);
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) fail(file, "should say noindex");
}
for (const loc of entries.keys())
  if (!Object.values(PAGES).some((u) => ORIGIN + u === loc)) fail("sitemap.xml", `${loc} is not a page here`);
for (const [asset, byFile] of versions)
  if (new Set(byFile.values()).size > 1) fail(asset, `?v= differs between pages: ${JSON.stringify(Object.fromEntries(byFile))}`);

// ---- stylesheet, manifest, crawl files
for (const m of read("styles.css").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) mustExist(m[1], "styles.css", "styles.css");
const manifest = JSON.parse(read("site.webmanifest"));
for (const u of [manifest.start_url, manifest.scope, ...(manifest.icons ?? []).map((i) => i.src)]) if (u) mustExist(u, "site.webmanifest", "site.webmanifest");
const robots = read("robots.txt");
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail("robots.txt", "does not name the sitemap");
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt", "disallows the whole site");
for (const f of ["llms.txt", "llms-full.txt"].filter((f) => existsSync(join(ROOT, f))))
  for (const [u] of read(f).matchAll(/https:\/\/assetprompter\.com[^\s)>\]"'`]*/g)) {
    const url = u.replace(/[.,;:!?]+$/, "");
    mustExist(url, "", f);
    if (hasLang(url)) fail(f, `${url} carries ?lang=`);
  }

// ---- IndexNow key file: <32 hex>.txt at the root holding exactly its own name
const keys = readdirSync(ROOT).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (keys.length !== 1) fail("IndexNow key", `expected one <32 hex>.txt at the root, found ${keys.length}`);
for (const k of keys) if (read(k).trim() !== k.slice(0, -4)) fail(k, "does not hold its own name as the IndexNow key");

if (fails.length) {
  console.error(`check-site: ${fails.length} problem(s)\n` + fails.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log(`check-site: ok (${pages.length} pages, ${entries.size} sitemap addresses, IndexNow key ${keys[0]})`);
