// Cuts the Serbian letters with marks (Ć ć Č č Đ đ Š š Ž ž) out of each latin-ext font file in assets/fonts/, as
// <family>-<version>-sr.woff2 beside it: the same glyphs, kerning, features, variations and hinting, a tenth of the bytes.
// styles.css names each after Google's rules with the same unicode-range, so a browser takes it first for those letters
// (of rules that cover a letter, the last one is tried first) and Google's latin-ext file for any other.
//
//   node tools/sr-fonts.mjs           write the -sr files
//   node tools/sr-fonts.mjs --check   only say whether each -sr file is what its latin-ext file gives (exit 1 if not)
//
// Run it after a font is updated. It needs Node 18 or later and Python 3 with fontTools and brotli
// (pip install fonttools brotli; PYTHON overrides the python3 it runs).
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = join(ROOT, "assets/fonts");
// The unicode-range of the -sr rules in styles.css.
const LETTERS = "U+0106-0107,U+010C-010D,U+0110-0111,U+0160-0161,U+017D-017E";
const PYTHON = process.env.PYTHON ?? "python3";
const check = process.argv.includes("--check");

const scratch = mkdtempSync(join(tmpdir(), "sr-fonts-"));
let stale = 0;
try {
  for (const file of readdirSync(FONTS).filter((f) => f.endsWith("-latin-ext.woff2"))) {
    const name = file.replace(/-latin-ext\.woff2$/, "-sr.woff2");
    const out = join(scratch, name);
    const run = spawnSync(
      PYTHON,
      [
        "-m",
        "fontTools.subset",
        join(FONTS, file),
        `--unicodes=${LETTERS}`,
        // Every feature, script, name and the hinting stay, so the letters are drawn as from the latin-ext file.
        "--layout-features=*",
        "--layout-scripts=*",
        "--name-IDs=*",
        "--name-languages=*",
        "--notdef-outline",
        "--flavor=woff2",
        `--output-file=${out}`,
      ],
      { encoding: "utf8" },
    );
    if (run.status !== 0) throw new Error(`fontTools.subset failed on ${file}:\n${run.stderr || run.error}`);
    const made = readFileSync(out);
    const target = join(FONTS, name);
    if (check) {
      if (!existsSync(target) || !made.equals(readFileSync(target))) {
        console.error(`${name} is not what ${file} gives: run node tools/sr-fonts.mjs and commit it`);
        stale++;
      }
    } else {
      writeFileSync(target, made);
      console.log(`wrote assets/fonts/${name} (${made.length} bytes, from ${readFileSync(join(FONTS, file)).length})`);
    }
  }
} catch (error) {
  console.error(`sr-fonts: ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
if (stale) process.exitCode = 1;
else if (check && !process.exitCode) console.log("the -sr font files are up to date");
