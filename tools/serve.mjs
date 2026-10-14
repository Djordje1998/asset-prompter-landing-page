// Serves a folder the way GitHub Pages serves this site, for Lighthouse in .github/workflows/check.yml and for a local
// preview: Cache-Control max-age=600, gzip for text, ETag and 304, a folder's index.html (a folder without its slash is
// sent to it, /sr -> /sr/), and 404.html with status 404 for an address with no file. Node 18 or later, no packages.
//   node tools/serve.mjs [folder=.] [port=8080]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

const root = path.resolve(process.argv[2] || ".");
const port = Number(process.argv[3] || 8080);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".gif": "image/gif", ".ico": "image/x-icon", ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2",
  ".woff": "font/woff", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".webmanifest": "application/manifest+json",
  ".md": "text/markdown; charset=utf-8",
};
const TEXT = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/;

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { res.writeHead(400).end(); return; }
  let file = path.join(root, p);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  // Like GitHub Pages: a folder without its trailing slash is redirected to it (/sr -> /sr/), a folder serves its
  // index.html, and /name serves name.html when there is no such file or folder.
  try {
    if (fs.statSync(file).isDirectory()) {
      if (!p.endsWith("/")) { const u = new URL(req.url, "http://x"); res.writeHead(301, { Location: p + "/" + u.search }).end(); return; }
      file = path.join(file, "index.html");
    }
  } catch { if (!path.extname(file) && fs.existsSync(file + ".html")) file += ".html"; }
  let st;
  try { st = fs.statSync(file); } catch {
    const nf = path.join(root, "404.html");
    const body = fs.existsSync(nf) ? fs.readFileSync(nf) : Buffer.from("404 Not Found");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end(body); return;
  }
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  const etag = '"' + crypto.createHash("md5").update(st.size + ":" + st.mtimeMs).digest("hex") + '"';
  const headers = {
    "Content-Type": type, "Cache-Control": "max-age=600", ETag: etag,
    "Last-Modified": st.mtime.toUTCString(), "Access-Control-Allow-Origin": "*", Vary: "Accept-Encoding",
  };
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers).end(); return; }
  const gz = TEXT.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"] || "");
  const range = req.headers.range;
  if (!gz && range && /^bytes=\d*-\d*$/.test(range)) {
    let [s, e] = range.slice(6).split("-");
    let start = s === "" ? st.size - Number(e) : Number(s);
    let end = s === "" || e === "" ? st.size - 1 : Number(e);
    end = Math.min(end, st.size - 1);
    if (start > end || start < 0) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }).end(); return; }
    res.writeHead(206, { ...headers, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file, { start, end }).pipe(res); return;
  }
  if (gz) {
    const body = zlib.gzipSync(fs.readFileSync(file), { level: 6 });
    res.writeHead(200, { ...headers, "Content-Encoding": "gzip", "Content-Length": body.length });
    res.end(req.method === "HEAD" ? undefined : body); return;
  }
  res.writeHead(200, { ...headers, "Accept-Ranges": "bytes", "Content-Length": st.size });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} at http://localhost:${port}`));
