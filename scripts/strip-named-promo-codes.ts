/**
 * Removes the named promo code "MYJUNK30" from article bodies.
 *
 * The code came from a coupon-aggregator page and cannot be verified as ever
 * having existed. Naming it across 30 articles -- even while debunking it --
 * gives the site a spammy footprint and lends the code credibility it hasn't
 * earned. The debunking point stands on its own without the name.
 *
 * Deletes the naming clause rather than substituting a phrase, so the
 * surrounding sentence stays grammatical.
 *
 * Run: npx tsx scripts/strip-named-promo-codes.ts
 */

import fs from "fs";
import path from "path";

const CODE = "MYJUNK30";
const DIR = path.join("content", "articles");

// optional bold markers + optional smart/straight quotes around the code
const wrapped = String.raw`\*{0,2}["“”'‘’]?` + CODE + String.raw`["“”'‘’]?\*{0,2}`;

const RULES: [RegExp, string][] = [
  // "Coupon codes (e.g., “MYJUNK30”)" -> "Coupon-aggregator codes"
  [new RegExp(String.raw`Coupon codes\s*\(\s*e\.g\.,?\s*` + wrapped + String.raw`\s*\)`, "gi"),
   "Coupon-aggregator codes"],
  // " (e.g., “MYJUNK30”)" -> ""
  [new RegExp(String.raw`\s*\(\s*e\.g\.,?\s*` + wrapped + String.raw`\s*\)`, "gi"), ""],
  // "codes such as/like “MYJUNK30”" -> "codes"
  [new RegExp(String.raw`\s*(?:such as|like)\s+` + wrapped, "gi"), ""],
  // "Enter code MYJUNK30" / "Use code MYJUNK30"
  [new RegExp(String.raw`Enter code\s+` + wrapped, "gi"), "Enter this code"],
  [new RegExp(String.raw`Use code\s+` + wrapped, "gi"), "Use this code"],
  // anything left standing alone
  [new RegExp(wrapped, "gi"), "these codes"],
];

let changed = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith(".json")) continue;

  const full = path.join(DIR, file);
  const article = JSON.parse(fs.readFileSync(full, "utf-8"));
  if (!article.body || !article.body.includes(CODE)) continue;

  const before = article.body;
  let body = article.body;
  for (const [pattern, replacement] of RULES) body = body.replace(pattern, replacement);

  // tidy up any double spaces the deletions left behind
  body = body.replace(/[ \t]{2,}/g, " ").replace(/ ([,.;:])/g, "$1");

  if (body !== before) {
    article.body = body;
    fs.writeFileSync(full, Buffer.from(JSON.stringify(article, null, 2), "utf-8"));
    changed++;
  }
}

console.log(`rewritten: ${changed}`);
