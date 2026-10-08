// Checks Lighthouse reports (lighthouse --output=json) against the budgets below, as the "lighthouse" job of
// .github/workflows/check.yml does. The reports of one address are taken together, by the median of the runs.
// - SEO, Best Practices and Accessibility must be 100: they do not move from run to run.
// - Agentic Browsing (Lighthouse 13.3 and later) is the share of its audits that pass, so each audit that applies to
//   the page must pass by itself: a yes/no audit with 1, a measured one (layout shift) with 0.9, Lighthouse's own line.
// - Layout shift, blocking time and the bytes the page loads have a budget: the numbers of October 2026 (CLS 0, TBT
//   50 to 120 ms, 1.13 MB on /, 1.19 MB on /sr/ with the first clip) with room for a slower machine. Above "warn" it
//   only warns, above "fail" it fails.
// - Largest Contentful Paint only warns: the headline fades in on load (kept on purpose), which holds the mobile lab
//   LCP at about 2.7 s on / and 3.1 s on /sr/, over the 2.5 s Google calls good.
//   node tools/lh-assert.mjs <report.json>...
import { readFileSync } from "node:fs";

const MIN_SCORE = { seo: 1, "best-practices": 1, accessibility: 1 };
const METRICS = {
  // audit id: [warn above, fail above]
  "cumulative-layout-shift": [0.01, 0.05],
  "total-blocking-time": [200, 400],
  "total-byte-weight": [1_300_000, 1_500_000],
  "largest-contentful-paint": [3_500, Infinity],
};
const PASS = { binary: 1, numeric: 0.9 };

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const show = (id, v) => (id.includes("shift") ? v.toFixed(3) : Math.round(v));
const warn = (msg) => process.env.GITHUB_ACTIONS && console.log(`::warning title=Lighthouse::${msg}`);
let failed = 0;
const byUrl = new Map();
for (const f of process.argv.slice(2)) {
  const r = JSON.parse(readFileSync(f, "utf8"));
  if (r.runtimeError) {
    console.log(`FAIL ${f}: ${r.runtimeError.code} ${r.runtimeError.message}`);
    failed++;
    continue;
  }
  const key = `${r.requestedUrl} (${r.configSettings.formFactor})`;
  (byUrl.get(key) ?? byUrl.set(key, []).get(key)).push(r);
}
if (!byUrl.size) {
  console.log("lh-assert: no reports");
  process.exit(1);
}
for (const [url, runs] of byUrl) {
  console.log(`\n${url}: ${runs.length} run(s), Lighthouse ${runs[0].lighthouseVersion}`);
  for (const [cat, min] of Object.entries(MIN_SCORE)) {
    const s = median(runs.map((r) => r.categories[cat]?.score ?? 0));
    const bad = s < min;
    failed += bad;
    console.log(`  ${bad ? "FAIL" : "ok  "} ${cat} ${Math.round(s * 100)} (min ${min * 100})`);
    // Name the audits that cost the points, from the first run that lost them.
    const r = runs.find((r) => (r.categories[cat]?.score ?? 0) < min);
    if (bad && r)
      for (const ref of r.categories[cat]?.auditRefs ?? [])
        if (ref.weight > 0 && r.audits[ref.id].score !== null && r.audits[ref.id].score < 1) console.log(`         - ${ref.id}: ${r.audits[ref.id].title}`);
  }
  if (!runs[0].categories["agentic-browsing"]) {
    console.log("  FAIL agentic-browsing was not run (--only-categories)");
    failed++;
  } else {
    // An audit fails here if it fails in most runs.
    for (const ref of runs[0].categories["agentic-browsing"].auditRefs) {
      const results = runs.map((r) => r.audits[ref.id]);
      const mode = results[0].scoreDisplayMode;
      if (!(mode in PASS)) continue; // notApplicable, informative, manual: nothing to pass
      const s = median(results.map((a) => a.score ?? 0));
      const bad = s < PASS[mode];
      failed += bad;
      console.log(`  ${bad ? "FAIL" : "ok  "} agentic ${ref.id} ${s}${bad ? `: ${results[0].title}` : ""}`);
    }
  }
  console.log(`  info performance ${Math.round(median(runs.map((r) => r.categories.performance?.score ?? 0)) * 100)}`);
  for (const [id, [over, fail]] of Object.entries(METRICS)) {
    const v = median(runs.map((r) => r.audits[id]?.numericValue ?? Infinity));
    const level = v > fail ? "FAIL" : v > over ? "warn" : "ok  ";
    failed += level === "FAIL";
    if (level === "warn") warn(`${url} ${id} ${show(id, v)} is above ${over}`);
    console.log(`  ${level} ${id} ${show(id, v)} (warn ${over}${fail === Infinity ? "" : `, fail ${fail}`})`);
  }
}
console.log(failed ? `\nlh-assert: ${failed} failure(s)` : "\nlh-assert: ok");
process.exit(failed ? 1 : 0);
