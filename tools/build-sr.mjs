// Writes the Serbian pages from the English ones and the Serbian text in i18n.js and i18n-guides.js: sr/index.html from
// index.html, and sr/guides/<x>/index.html from each guides/<x>/index.html (every index.html under guides/).
//
//   node tools/build-sr.mjs           write the Serbian pages
//   node tools/build-sr.mjs --check   only say whether they are up to date (exit 1 if one is not, or is left over)
//   node tools/build-sr.mjs --keep=<key>,<key>   build, and take the Serbian of those keys as still right for their
//                                    changed English (see tools/sr-english.json below)
//
// Run it after any change to an English page, i18n.js, i18n-guides.js or the say() texts in main.js, and commit the
// sr/ pages with them. It needs Node 18 or later and nothing else.
//
// What changes on the way, and nothing more:
// - every marked text takes its Serbian: data-i18n the element's whole content (it may hold markup), data-i18n-text
//   the element's own text (its first text that is more than space), data-i18n-alt, -aria-label and -content the
//   attribute. A mark with no Serbian stays English, and --check fails on it. The Serbian of a key is in i18n.js or in
//   i18n-guides.js.
// - <html lang> is sr-Latn, the language button shows SR, and the menu checks Srpski. What stays English on purpose,
//   the message for the agent (.ask-text) and the app's status tags (.tag), says lang="en". A guide's language link
//   (a[data-lang] that is not a menu item) leads back to the English guide, and says English (EN on a phone).
// - addresses inside the site are written from sr/ (../styles.css, ../assets/...); #anchors and full addresses stay,
//   and so do the guides' root addresses (/styles.css). A link to a page that has a Serbian copy (/, /#install,
//   guides/, /guides/<x>/) leads to that copy instead, in the page's own text and in the Serbian; the language links
//   are left as they are.
// - the canonical address and og:url are the Serbian page's. The hreflang links stay: both pages name both.
//   An address with a mark (og.image) takes its Serbian, in the JSON-LD too (primaryImageOfPage, image).
// - the link to the page as Markdown (rel="alternate" type="text/markdown") is left out: that text is English only.
// - the Serbian file of each preloaded font (-sr, the letters with marks; see tools/sr-fonts.mjs) is preloaded too.
// - the JSON-LD takes the Serbian of every text it copies from the page, of the features (ld.feature.N), the keywords
//   (ld.keywords), the names of the app's topics (ld.about.N) and the other texts no element shows (LD_KEYS); the
//   page's own nodes (WebPage, FAQPage, a guide's Article and breadcrumb) move to its Serbian address, as do the
//   guides it names, and say "inLanguage": "sr-Latn". It stops if one of the texts it should copy is not on the page
//   any more.
// - the few texts main.js writes itself (say("key", ...)) go in as a small JSON block, #say, on a page that loads it.
//
// tools/sr-english.json keeps, for every marked text, a short hash of its English and of its Serbian as they were when
// the Serbian was last written. A key whose English has changed since while its Serbian has not is named, and --check
// fails on it: change the Serbian with the English, or, if it still says the same (a typo fixed in English), build
// with --keep=<key>. The build writes the file; commit it with the pages.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://assetprompter.com/";
const TAG = "sr-Latn";
const CODE = "SR";
const ATTRS = ["alt", "aria-label", "content"];
const URL_ATTRS = new Set(["href", "src", "srcset", "poster", "data-video", "data-video-av1", "data-src", "data-poster", "imagesrcset", "action"]);
// The nodes of the JSON-LD that describe this page rather than the site, the app or the author.
const PAGE_TYPES = new Set(["WebPage", "CollectionPage", "Article", "TechArticle", "FAQPage", "Question", "Answer", "HowTo", "HowToStep", "BreadcrumbList", "ListItem"]);
// The JSON-LD keys whose values are texts a reader could see on the page; names of things, kinds and addresses stay.
const TEXT_KEYS = new Set(["name", "description", "text", "headline", "alternativeHeadline", "abstract", "caption"]);
// The JSON-LD texts that are copies of the page's own: each must still be one, or the build stops.
const COPIED = {
  WebPage: ["name", "description"],
  CollectionPage: ["name", "description"],
  Article: ["headline", "description"],
  TechArticle: ["headline", "description"],
  SoftwareApplication: ["description"],
  Question: ["name"],
  Answer: ["text"],
};
// The JSON-LD texts that no element shows, besides the features, and the key of each one's Serbian in i18n.js.
const LD_KEYS = { applicationSubCategory: "ld.subcategory", softwareRequirements: "ld.requirements", audienceType: "ld.audience" };
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// What a guide's language link says on the Serbian copy, where it leads back to the English guide.
const BACK = { lang: "en", code: "EN", name: "English", label: "English (EN): this page in English" };
const header = (page) =>
  `<!-- generated by tools/build-sr.mjs — do not edit: change ${page.file}, i18n.js or ${page.home ? "main.js" : "i18n-guides.js"} and run it again -->`;

// Line ends are read as LF, so a checkout with CRLF (Git for Windows' default) builds the same page as CI.
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\r\n/g, "\n");

/** The SR objects of i18n.js and i18n-guides.js, each run in an empty sandbox (the files only declare them), as one. */
function serbian() {
  const all = {};
  for (const file of ["i18n.js", "i18n-guides.js"]) {
    const sandbox = vm.createContext({});
    const SR = new vm.Script(`${read(file)}\n;SR`, { filename: file }).runInContext(sandbox, { timeout: 1000 });
    if (!SR || typeof SR !== "object") throw new Error(`${file} has no SR object`);
    // Out of the sandbox, as plain strings.
    for (const [key, value] of Object.entries(SR)) {
      if (key in all) throw new Error(`${key} is in i18n.js and in i18n-guides.js; keep it in one`);
      all[key] = String(value);
    }
  }
  return all;
}

/** The pages: the home page, then every index.html under guides/. Each has its English address and its Serbian one. */
function pages() {
  const found = ["index.html"];
  const look = (dir) => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) look(rel);
      else if (entry.name === "index.html") found.push(rel);
    }
  };
  if (fs.existsSync(path.join(ROOT, "guides"))) look("guides");
  return found.map((file) => {
    const dir = "/" + file.replace(/index\.html$/, "");
    return { file, home: file === "index.html", dir, srDir: "/sr" + dir, en: SITE + dir.slice(1), sr: SITE + "sr" + dir };
  });
}
const PAGES = pages();

/* ---- a small reader for the page's own HTML: elements, their attributes and where each starts and ends ---- */

const TAG_RE = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const ATTR_RE = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parse(html) {
  const top = { name: "#root", attrs: [], children: [] };
  const stack = [top];
  let i = 0;
  let text = 0;
  const flush = (end) => {
    if (end > text) stack.at(-1).children.push({ text: true, start: text, end });
  };
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt < 0) break;
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      if (end < 0) throw new Error(`unclosed comment at ${lt}`);
      flush(lt);
      i = text = end + 3;
      continue;
    }
    if (html.startsWith("<!", lt)) {
      flush(lt);
      i = text = html.indexOf(">", lt) + 1;
      continue;
    }
    TAG_RE.lastIndex = lt;
    const m = TAG_RE.exec(html);
    if (!m) {
      i = lt + 1;
      continue;
    }
    flush(lt);
    const [whole, closing, rawName, rawAttrs, selfClosing] = m;
    const name = rawName.toLowerCase();
    i = text = lt + whole.length;
    if (closing) {
      const open = stack.pop();
      if (open.name !== name) throw new Error(`</${name}> at ${lt} closes <${open.name}> opened at ${open.start}`);
      open.contentEnd = lt;
      open.end = i;
      continue;
    }
    const attrs = [];
    const base = lt + 1 + rawName.length;
    for (const a of rawAttrs.matchAll(ATTR_RE)) {
      const value = a[2] ?? a[3] ?? a[4];
      const at = base + a.index;
      // Where the value itself starts and ends, without its quotes.
      const vEnd = value === undefined ? null : at + a[0].length - (a[4] === undefined ? 1 : 0);
      attrs.push({ name: a[1].toLowerCase(), value: value ?? "", start: at, end: at + a[0].length, vStart: vEnd === null ? null : vEnd - value.length, vEnd });
    }
    const el = { name, attrs, start: lt, tagEnd: i, contentStart: i, children: [] };
    stack.at(-1).children.push(el);
    if (VOID.has(name) || selfClosing) {
      el.contentEnd = el.end = i;
      continue;
    }
    if (name === "script" || name === "style") {
      const end = html.toLowerCase().indexOf(`</${name}`, i);
      el.contentEnd = end;
      el.end = html.indexOf(">", end) + 1;
      i = text = el.end;
      continue;
    }
    stack.push(el);
  }
  flush(html.length);
  if (stack.length > 1) throw new Error(`<${stack.at(-1).name}> opened at ${stack.at(-1).start} is never closed`);
  return top;
}

function* walk(node) {
  for (const child of node.children) {
    if (child.text) continue;
    yield child;
    yield* walk(child);
  }
}

const attr = (el, name) => el.attrs.find((a) => a.name === name);
const hasClass = (el, name) => (attr(el, "class")?.value ?? "").split(/\s+/).includes(name);
/** Whether an element or anything in it has a mark, and so takes Serbian. */
const marked = (el) => el.attrs.some((a) => a.name.startsWith("data-i18n")) || [...walk(el)].some(marked);

/* ---- texts ---- */

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    if (!(e in ENTITIES)) throw new Error(`unknown entity ${all}`);
    return ENTITIES[e];
  });
const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
/** Markup as a reader sees it: no tags, entities read, space as one space. */
const plain = (html) => decode(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();

/** An address inside the site, written as seen from the Serbian page; a root address stays as it is. */
function fromSr(url, page) {
  if (!url || /^(#|\/|[a-z][a-z\d+.-]*:|\?)/i.test(url)) return url;
  const u = new URL(url, "https://site" + page.dir);
  let rel = path.posix.relative(page.srDir, u.pathname);
  if (u.pathname.endsWith("/") && rel) rel += "/";
  return (rel || "./") + u.search + u.hash;
}

/** A link to a page that has a Serbian copy, made a link to that copy, written as the page writes it; else undefined. */
function toSerbianPage(url, page) {
  if (!url || /^(#|[a-z][a-z\d+.-]*:|\/\/|\?)/i.test(url)) return undefined;
  const u = new URL(url, "https://site" + page.dir);
  if (!PAGES.some((p) => p.dir === u.pathname)) return undefined;
  if (url.startsWith("/")) return "/sr" + u.pathname + u.search + u.hash;
  let rel = path.posix.relative(page.srDir, "/sr" + u.pathname);
  if (rel) rel += "/";
  return (rel || "./") + u.search + u.hash;
}

/** The links in a Serbian text, pointed as the page's own are. */
const localize = (markup, page) => markup.replace(/(\shref=")([^"]*)(")/g, (all, before, url, after) => before + (toSerbianPage(url, page) ?? fromSr(url, page)) + after);

/* ---- the JSON-LD ---- */

function translateLd(json, english, SR, page) {
  const data = JSON.parse(json);
  const graph = data["@graph"] ?? [data];
  // The @id of each node that describes this page moves to its Serbian address, wherever it is named; so does each
  // @id under a guide's address (a guide's article, named by the list of guides). The site, the app and the author stay.
  const ids = new Map();
  for (const node of graph) {
    if (PAGE_TYPES.has(node["@type"]) && node["@id"]?.startsWith(page.en + "#")) ids.set(node["@id"], page.sr + node["@id"].slice(page.en.length));
  }
  const guideId = (value) => {
    const other = PAGES.find((p) => !p.home && value.startsWith(p.en + "#"));
    return other && other.sr + value.slice(other.en.length);
  };
  // A page's own address, and the pages a breadcrumb names, move to their Serbian copies.
  const serbianPage = (value) => PAGES.find((p) => p.en === value)?.sr;
  const missing = [];
  const left = [];
  /** The Serbian of a numbered list (ld.feature.1, ld.feature.2, ...), in its order. */
  const numbered = (name) =>
    Object.keys(SR)
      .filter((key) => new RegExp(`^ld\\.${name}\\.\\d+$`).test(key))
      .sort((a, b) => a.split(".")[2] - b.split(".")[2])
      .map((key) => SR[key]);
  const features = numbered("feature");
  const topics = numbered("about");

  function visit(value, key, owner) {
    if (Array.isArray(value)) {
      if (key === "featureList") {
        if (value.length !== features.length) throw new Error(`featureList has ${value.length} features, i18n.js has ${features.length} (ld.feature.N)`);
        return features;
      }
      if (key === "keywords") {
        if (SR["ld.keywords"] === undefined) left.push(`${owner["@type"]} keywords`);
        return SR["ld.keywords"]?.split(/\s*,\s*/) ?? value;
      }
      // The app's topics: each keeps its Wikidata item, and its name is in Serbian.
      if (key === "about" && value.every((item) => item?.["@type"] === "Thing")) {
        if (value.length !== topics.length) throw new Error(`about has ${value.length} topics, i18n.js has ${topics.length} (ld.about.N)`);
        return value.map((item, n) => ({ ...item, name: topics[n] }));
      }
      return value.map((item) => visit(item, key, owner));
    }
    if (value && typeof value === "object") {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = visit(v, k, value);
      return out;
    }
    if (typeof value !== "string") return value;
    if (ids.has(value)) return ids.get(value);
    if (key === "@id" && guideId(value)) return guideId(value);
    const type = owner["@type"];
    if (key === "inLanguage" && PAGE_TYPES.has(type)) return TAG;
    if ((key === "url" || key === "item") && PAGE_TYPES.has(type) && serbianPage(value)) return serbianPage(value);
    // An address the page gives in Serbian as well: the picture of the link previews (og.image).
    if (value.startsWith(SITE) && english.has(value)) return english.get(value);
    if (key in LD_KEYS) {
      if (SR[LD_KEYS[key]] === undefined) left.push(`${type} ${key}: ${value}`);
      return SR[LD_KEYS[key]] ?? value;
    }
    if (!TEXT_KEYS.has(key)) return value;
    const sr = english.get(value.replace(/\s+/g, " ").trim());
    if (sr !== undefined) return sr;
    if (COPIED[type]?.includes(key)) missing.push(`${type} ${key}: ${value}`);
    else if (value.split(" ").length > 4) left.push(`${type} ${key}: ${value}`);
    return value;
  }

  const out = visit(data, "", {});
  if (missing.length) throw new Error(`the JSON-LD copies texts that are not on the page; make them the page's again:\n  ${missing.join("\n  ")}`);
  for (const text of left) console.warn(`build-sr: left in English in the JSON-LD (no element has this text): ${text}`);
  return out;
}

/* ---- the page ---- */

function build(page, SR, seen) {
  const html = read(page.file);
  const doc = parse(html);
  const edits = [];
  const edit = (start, end, text) => edits.push({ start, end, text });
  const setAttr = (el, name, value) => {
    const a = attr(el, name);
    const close = el.tagEnd - (html[el.tagEnd - 2] === "/" ? 2 : 1);
    if (!a) edit(close, close, ` ${name}="${escapeAttr(value)}"`);
    else if (a.vStart === null) edit(a.end, a.end, `="${escapeAttr(value)}"`);
    else edit(a.vStart, a.vEnd, escapeAttr(value));
  };
  // English and Serbian of every marked text, for the JSON-LD.
  const english = new Map();
  const pair = (key, en) => {
    if (SR[key] === undefined) return;
    english.set(plain(en), plain(SR[key]));
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key).add(en.replace(/\s+/g, " ").trim());
  };
  const unknown = new Set();
  const serbianOf = (key) => {
    if (SR[key] === undefined) unknown.add(key);
    return SR[key];
  };

  const elements = [...walk(doc)];
  // What is inside a text that takes its Serbian goes with it: the Serbian brings its own markup.
  const inside = new Set();
  for (const el of elements) {
    if (SR[attr(el, "data-i18n")?.value] !== undefined) for (const child of walk(el)) inside.add(child);
  }
  // A guide's language link, and what is in it: on the Serbian copy it leads back to the English guide.
  const back = new Set();
  for (const el of elements) {
    if (el.name === "a" && attr(el, "data-lang") && !attr(el, "aria-checked")) for (const one of [el, ...walk(el)]) back.add(one);
  }
  for (const el of elements) {
    const key = attr(el, "data-i18n")?.value;
    if (key === undefined || inside.has(el)) continue;
    pair(key, html.slice(el.contentStart, el.contentEnd));
    if (serbianOf(key) !== undefined) edit(el.contentStart, el.contentEnd, localize(SR[key], page));
  }
  for (const el of elements) {
    const key = attr(el, "data-i18n-text")?.value;
    if (key === undefined || inside.has(el)) continue;
    const node = el.children.find((c) => c.text && html.slice(c.start, c.end).trim());
    if (!node) continue;
    const raw = html.slice(node.start, node.end);
    pair(key, raw);
    if (serbianOf(key) === undefined) continue;
    // The space around the text stays: it is what separates it from the next element.
    const [, before, after] = /^(\s*)[\s\S]*?(\s*)$/.exec(raw);
    edit(node.start + before.length, node.end - after.length, escapeText(SR[key]));
  }
  for (const name of ATTRS) {
    for (const el of elements) {
      const key = attr(el, `data-i18n-${name}`)?.value;
      if (key === undefined || inside.has(el)) continue;
      pair(key, attr(el, name)?.value ?? "");
      if (serbianOf(key) !== undefined) setAttr(el, name, SR[key]);
    }
  }

  let ldDone = false;
  let sayDone = false;
  const sayKeys = [...new Set([...read("main.js").matchAll(/\bsay\(\s*"([^"]+)"/g)].map((m) => m[1]))];
  for (const el of elements) {
    if (inside.has(el)) continue;
    const rel = attr(el, "rel")?.value;
    const property = attr(el, "property")?.value;
    if (el.name === "html") setAttr(el, "lang", TAG);
    if ((hasClass(el, "ask-text") || hasClass(el, "tag")) && !marked(el)) setAttr(el, "lang", "en");
    if (hasClass(el, "lang-code")) edit(el.contentStart, el.contentEnd, back.has(el) ? BACK.code : CODE);
    if (hasClass(el, "lang-name") && back.has(el)) edit(el.contentStart, el.contentEnd, BACK.name);
    if (attr(el, "data-lang") && attr(el, "aria-checked")) setAttr(el, "aria-checked", String(attr(el, "data-lang").value === "sr"));
    if (el.name === "a" && attr(el, "data-lang") && back.has(el)) {
      setAttr(el, "href", page.dir);
      for (const name of ["hreflang", "lang", "data-lang"]) setAttr(el, name, BACK.lang);
      setAttr(el, "aria-label", BACK.label);
      continue;
    }
    if (el.name === "link" && rel === "canonical") setAttr(el, "href", page.sr);
    if (el.name === "meta" && property === "og:url") setAttr(el, "content", page.sr);
    // The Markdown copy of the page is English: the Serbian page does not offer it as its alternate.
    if (el.name === "link" && rel === "alternate" && attr(el, "type")?.value === "text/markdown") {
      edit(html.lastIndexOf("\n", el.start), el.tagEnd, "");
      continue;
    }
    // The Serbian file of a preloaded font goes right after it.
    const href = attr(el, "href")?.value ?? "";
    if (el.name === "link" && rel === "preload" && /-latin\.woff2$/.test(href)) {
      const tag = html.slice(el.start, el.tagEnd).replace(href, fromSr(href.replace(/-latin\.woff2$/, "-sr.woff2"), page));
      const indent = /[ \t]*$/.exec(html.slice(0, el.start))[0];
      edit(el.tagEnd, el.tagEnd, `\n${indent}${tag}`);
    }
    for (const a of el.attrs) {
      if (!URL_ATTRS.has(a.name) || a.vStart === null || (el.name === "link" && rel === "canonical")) continue;
      const value = a.name.endsWith("srcset")
        ? a.value
            .split(",")
            .map((part) => part.replace(/^(\s*)(\S+)/, (all, space, url) => space + fromSr(url, page)))
            .join(",")
        : (el.name === "a" && a.name === "href" && !attr(el, "data-lang") && toSerbianPage(a.value, page)) || fromSr(a.value, page);
      if (value !== a.value) edit(a.vStart, a.vEnd, value);
    }
    if (el.name === "script" && attr(el, "type")?.value === "application/ld+json") {
      const indent = /[ \t]*$/.exec(html.slice(0, el.start))[0] + "  ";
      const ld = JSON.stringify(translateLd(html.slice(el.contentStart, el.contentEnd), english, SR, page), null, 2).replace(/<\//g, "<\\/");
      edit(el.contentStart, el.contentEnd, `\n${ld.replace(/^/gm, indent)}\n${indent.slice(2)}`);
      ldDone = true;
    }
    // The texts main.js writes itself, just before main.js.
    if (el.name === "script" && /(^|\/)main\.js(\?|$)/.test(attr(el, "src")?.value ?? "")) {
      const texts = Object.fromEntries(sayKeys.filter((key) => serbianOf(key) !== undefined).map((key) => [key, SR[key]]));
      const indent = /[ \t]*$/.exec(html.slice(0, el.start))[0];
      edit(el.start, el.start, `<script type="application/json" id="say">${JSON.stringify(texts).replace(/<\//g, "<\\/")}</script>\n${indent}`);
      sayDone = true;
    }
  }
  if (!ldDone) throw new Error(`${page.file} has no JSON-LD block`);
  if (page.home && !sayDone) throw new Error("index.html does not load main.js");

  edits.sort((a, b) => a.start - b.start || a.end - b.end);
  for (let n = 1; n < edits.length; n++) {
    if (edits[n].start < edits[n - 1].end) throw new Error(`${page.file}: two changes overlap at ${edits[n].start}: is a marked text inside another?`);
  }
  let out = "";
  let at = 0;
  for (const e of edits) {
    out += html.slice(at, e.start) + e.text;
    at = e.end;
  }
  out += html.slice(at);
  const HEADER = header(page);
  out = out.replace(/^(<!doctype html>\n)/i, `$1${HEADER}\n`);
  if (!out.includes(HEADER)) out = `${HEADER}\n${out}`;
  if (unknown.size) noSerbian.push(`${page.file}: ${[...unknown].join(", ")}`);
  return out;
}

const check = process.argv.includes("--check");
const keep = new Set(process.argv.flatMap((a) => (a.startsWith("--keep=") ? a.slice(7).split(",") : [])));
const stale = [];
const seen = new Map();
// The marked texts with no Serbian at all, a line per page: left in English, and --check fails on them.
const noSerbian = [];
const SR = (() => {
  try {
    return serbian();
  } catch (error) {
    console.error(`build-sr: ${error.message}`);
    process.exit(1);
  }
})();
for (const page of PAGES) {
  const file = "sr/" + page.file;
  let built;
  try {
    built = build(page, SR, seen);
  } catch (error) {
    console.error(`build-sr: ${error.message}`);
    process.exit(1);
  }
  const target = path.join(ROOT, file);
  if (check) {
    if ((fs.existsSync(target) ? read(file) : "") !== built) stale.push(file);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, built);
    console.log(`wrote ${file} (${Buffer.byteLength(built)} bytes)`);
  }
}
// A Serbian page whose English page is gone is left over: the build does not delete it, the check names it.
const made = new Set(PAGES.map((page) => "sr/" + page.file));
const leftOver = [];
const look = (dir) => {
  if (!fs.existsSync(path.join(ROOT, dir))) return;
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) look(rel);
    else if (entry.name === "index.html" && !made.has(rel)) leftOver.push(rel);
  }
};
look("sr");
for (const file of leftOver) console.warn(`build-sr: ${file} has no English page any more; delete it`);

// The English each Serbian was written for. A key is taken as translated when it is new, when its English is what it
// was, when its Serbian has changed too, or when --keep names it; otherwise it keeps its old hashes and is named.
const RECORD = "tools/sr-english.json";
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
const record = fs.existsSync(path.join(ROOT, RECORD)) ? JSON.parse(read(RECORD)) : {};
const next = {};
const untranslated = [];
for (const key of [...seen.keys()].sort()) {
  const now = [hash([...seen.get(key)].sort().join("\n")), hash(SR[key])];
  const was = record[key];
  if (!was || was[0] === now[0] || was[1] !== now[1] || keep.has(key)) next[key] = now;
  else {
    next[key] = was;
    untranslated.push(key);
  }
}
// One key a line, so a change shows in a diff as the keys it touches.
const recorded = `{\n${Object.entries(next).map(([key, pair]) => `  ${JSON.stringify(key)}: ${JSON.stringify(pair)}`).join(",\n")}\n}\n`;
const recordStale = (fs.existsSync(path.join(ROOT, RECORD)) ? read(RECORD) : "") !== recorded;
if (!check && recordStale) fs.writeFileSync(path.join(ROOT, RECORD), recorded);
if (noSerbian.length) {
  const say = check ? console.error : console.warn;
  for (const line of noSerbian) say(`build-sr: no Serbian for ${line}: add them to i18n.js or i18n-guides.js`);
}
if (untranslated.length) {
  const say = check ? console.error : console.warn;
  say(`build-sr: the English of these texts changed and their Serbian did not: ${untranslated.join(", ")}`);
  say(`  change the Serbian in i18n.js or i18n-guides.js, or, if it still says the same, run node tools/build-sr.mjs --keep=${untranslated.join(",")}`);
}
if (check) {
  if (stale.length || leftOver.length || untranslated.length || noSerbian.length || recordStale) {
    for (const file of stale) console.error(`${file} is out of date: run node tools/build-sr.mjs and commit it`);
    if (recordStale) console.error(`${RECORD} is out of date: run node tools/build-sr.mjs and commit it`);
    process.exit(1);
  }
  console.log(`the Serbian pages are up to date (${PAGES.length})`);
}
