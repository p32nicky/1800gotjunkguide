/**
 * Rewrites the pages that ALREADY rank (GSC positions ~4-57) at full depth,
 * keeping slug, title and URL identical so no ranking equity is lost.
 *
 * These are proven-demand pages sitting 600-800 words deep. The bet is that
 * depth + verified numbers moves them up, not that new pages outrank them.
 *
 * Originals are backed up to content/_backup_pre_upgrade/ before this runs.
 * Run: npx tsx scripts/upgrade-ranking-pages.ts
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import fs from "fs";
import path from "path";
import { FACTS } from "./lib/research-facts";

let useGroq = true;

interface Target {
  slug: string;
  position: number;   // current GSC average position
  impressions: number;
  brief: string;      // what this specific page must do better
}

const TARGETS: Target[] = [
  {
    slug: "is-1-800-got-junk-expensive-honest-price-analysis",
    position: 57, impressions: 496,
    brief: `Highest-demand page on the site and the worst-ranked. The title
promises an HONEST analysis, so deliver one: the answer is "yes, they are
usually the most expensive option, and here is exactly when that premium is
worth paying and when it isn't." Build the whole piece around that trade-off.
Compare against LoadUp, Junk King and College Hunks with the real minimums.
Show the arithmetic on a specific job. A reader who lands here is skeptical
about the price -- meet that skepticism head-on instead of defending them.`,
  },
  {
    slug: "is-junk-removal-tax-deductible",
    position: 7.4, impressions: 25,
    brief: `Already ranks page 1 and converts -- do not break what works. Keep
the same direct structure, just go deeper. Cover the real distinctions:
personal residence cleanout (not deductible), rental/investment property
(deductible as a maintenance or turnover expense), home office portion,
business cleanouts, moving-related rules, and charitable deduction for
DONATED items (fair market value, needs a receipt, Form 8283 above $500).
This is tax content: state plainly that it is general information and the
reader should confirm with a CPA for their situation. Never state a rule with
more confidence than you have.`,
  },
  {
    slug: "veteran-junk-removal-discounts",
    position: 7.8, impressions: 23,
    brief: `Ranks page 1 already. Lead with the honest answer -- 1-800-GOT-JUNK
has no official veteran or military discount -- then make this the most
genuinely useful page on the query by covering what veterans CAN actually
use: VA-adjacent assistance programs, local nonprofit and municipal cleanout
help, junk haulers that do advertise veteran pricing, veteran-owned haulers
worth calling, and the behavioural savings levers. The value here is the
honest map, not a fake coupon.`,
  },
  {
    slug: "does-1-800-got-junk-take-medical-equipment",
    position: 5.4, impressions: 7,
    brief: `Ranks page 1. Answer yes/no in the first sentence, then get specific
by item: hospital beds, wheelchairs, walkers, scooters, lift chairs, oxygen
concentrators, CPAP machines, nebulizers, hoyer lifts. Cover the real
exceptions -- sharps, biohazard, medications, anything with residual oxygen
or refrigerant. Add the part competitors skip: where to DONATE working
mobility equipment instead of paying to dump it, because that is both the
cheaper answer and the reason people stay on the page.`,
  },
  {
    slug: "office-furniture-removal-services",
    position: 4.7, impressions: 3,
    brief: `Best-ranked page on the site. Written for a business decision-maker
-- office manager, facilities lead, someone closing or moving an office.
Cover volume estimation (desks/chairs/cubicles per truckload), scheduling
around business hours, certificate of insurance and building COI
requirements, freight elevator and loading dock logistics, secure disposal of
anything with data on it, liquidation vs donation vs disposal, and how the
per-truck math works for a 10 vs 50 vs 100 workstation office. Concrete
logistics, not generic decluttering advice.`,
  },
  {
    slug: "1-800-got-junk-for-electronics-recycling",
    position: 11.4, impressions: 53,
    brief: `Position 11 with real demand -- one page off the front page. Be
specific by device: CRT and flat-panel TVs, monitors, desktops, laptops,
printers, phones, tablets, batteries, servers. Cover what actually happens
downstream (R2/e-Stewards certified recyclers, data destruction, what is
genuinely recovered vs landfilled), state e-waste laws that make some items
illegal to bin, and honest free alternatives: manufacturer takeback, Best Buy
and Staples programs, municipal e-waste days. Say plainly when free beats
paying for pickup.`,
  },
  {
    slug: "how-1-800-got-junk-decides-what-to-recycle",
    position: 10.3, impressions: 20,
    brief: `Position 10. The reader is asking a process question and half
suspects the eco-friendly marketing is greenwashing. Answer it properly:
sorting at the truck vs at the transfer station, what the published
diversion-rate claims actually mean and how they are measured, which material
streams genuinely have resale or recycling markets (metal, appliances,
electronics, usable furniture) versus which realistically go to landfill
(mixed upholstery, treated wood, contaminated material), and franchise
variation. Skeptical but fair. That honesty is the differentiator.`,
  },
  {
    slug: "1-800-got-junk-vs-junkluggers-which-is-greener",
    position: 12.5, impressions: 31,
    brief: `Position 12.5, one push off page 1. A genuine head-to-head on
environmental claims, with a comparison table. The Junkluggers model is built
around donation and reuse with donation receipts; 1-800-GOT-JUNK is built
around speed, scale and coverage. Let the comparison land where the evidence
lands -- if Junkluggers is greener on donation-first policy, say so, and note
that 1-800-GOT-JUNK usually wins on availability and same-day service. Then
give a clear "pick X if / pick Y if". A rigged comparison will not hold
position 12, let alone climb.`,
  },
  {
    slug: "1-800-got-junk-in-san-diego",
    position: 10.7, impressions: 11,
    brief: `Position 10.7. Make it a real San Diego page, not a template with
a city name dropped in. Cover local pricing expectation against the verified
national ranges and why California markets sit higher (disposal fees, labor,
CalRecycle rules), city bulky-item pickup as the free alternative, Miramar
Landfill and local disposal options, and practical local realities -- canyon
lots, narrow older streets in North Park and Hillcrest, HOA rules in
condo-heavy neighbourhoods, permit questions for anything structural. Never
invent a franchise address, phone number or exact local price.`,
  },
];

function buildPrompt(t: Target, title: string): string {
  return `You are rewriting an existing article on Junk Removal Guide, an independent review site. The article is titled: "${title}"

${FACTS}

WHY THIS REWRITE EXISTS:
This page already ranks at Google position ~${t.position} with ${t.impressions} impressions
in the last 28 days. The demand is proven. The problem is the page is only
~600-800 words and shallow, so it stalls where it is. Your job is to make it
comprehensively better than everything else on that query WITHOUT changing
what it is about. Same topic, same promise in the title, far more substance.

WHAT THIS SPECIFIC PAGE MUST DO:
${t.brief}

REQUIREMENTS:
- 1800-2400 words.
- Answer the title's question directly in the first two sentences. No preamble.
- 5-7 H2 sections with real substance, H3 subsections inside them.
- At least ONE markdown table carrying real numbers or a real comparison.
- At least one worked example with the arithmetic shown.
- A "what people get wrong" or "common mistakes" section.
- An FAQ of 5-6 questions real searchers ask, answered in 2-4 sentences each.
- A short concrete takeaway to close. No hype.

HONESTY RULES (non-negotiable):
- Use ONLY the pricing figures in the data above. Never invent a number.
- Never claim a discount, coupon code or program exists unless it appears in
  the data above. Where the honest answer is "that does not exist", lead with
  it -- that is the most useful thing you can tell the reader.
- Never claim a source you do not have. Do not write phrases like "our
  testing", "we called", "verified franchise pricing sheets" or "our research
  team" -- none of that happened.
- Where something genuinely varies by market or franchise, say so and tell
  the reader to confirm on the on-site estimate.
- Recommend the competitor, the free option, or the DIY route whenever it is
  genuinely the better answer for the reader. This page has to be worth
  ranking, and a page that only ever recommends one company is not.

TONE & FORMAT:
- Plain, direct, knowledgeable. A contractor explaining it, not a brochure.
- Short paragraphs, 2-3 sentences. Bullet lists. Bold the key numbers.
- Reads well on a phone.

AFFILIATE CTA:
- Exactly ONE [CTA] placeholder, roughly 60-75% down, after real value has
  been delivered. Never in the intro.

OUTPUT FORMAT:
- First line: META: <140-158 chars, stating the actual answer so it earns the
  click from the search result>
- Second line: KEYWORDS: five comma-separated keywords
- Then the article in markdown, starting with an H1 that matches the title.

Write it now.`;
}

async function upgrade(groq: Groq, cerebras: Cerebras, t: Target, i: number) {
  const outPath = path.join("content", "articles", `${t.slug}.json`);
  const n = `[${i + 1}/${TARGETS.length}]`;

  if (!fs.existsSync(outPath)) {
    console.error(`${n} MISSING, skipped: ${t.slug}`);
    return;
  }

  const original = JSON.parse(fs.readFileSync(outPath, "utf-8"));
  const beforeWords = (original.body || "").split(/\s+/).length;
  const prompt = buildPrompt(t, original.title);

  try {
    let content = "";

    if (useGroq) {
      try {
        const c = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 6000,
          temperature: 0.7,
        });
        content = c.choices[0]?.message?.content ?? "";
      } catch (e: unknown) {
        // Any Groq failure -- quota, decommissioned model, outage -- falls
        // through to Cerebras. Groq retires model IDs without notice, and a
        // narrow 429-only guard silently failed a whole 44-article batch.
        console.log(`Groq unavailable (${String(e).slice(0, 120)}) -- switching to Cerebras`);
        useGroq = false;
      }
    }

    if (!useGroq || !content) {
      const c = await cerebras.chat.completions.create({
        model: "gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 6000,
        // @ts-ignore
        temperature: 0.7,
      });
      content = (c.choices[0]?.message?.content as string) ?? "";
    }

    const afterWords = content.split(/\s+/).length;

    // Refuse to publish a regression. Backup stays authoritative.
    if (afterWords < beforeWords * 1.4) {
      console.error(`${n} REJECTED (${beforeWords}w -> ${afterWords}w, not deeper): ${t.slug}`);
      return;
    }

    const metaMatch = content.match(/META:\s*(.+)/);
    const kwMatch = content.match(/KEYWORDS:\s*(.+)/);

    // slug + title preserved exactly -- the URL and its ranking must not move
    const article = {
      ...original,
      metaDescription: metaMatch ? metaMatch[1].trim() : original.metaDescription,
      keywords: kwMatch ? kwMatch[1].split(",").map((k) => k.trim()) : original.keywords,
      body: content,
      generatedAt: new Date().toISOString(),
      quality: true,
      upgradedFromPosition: t.position,
    };

    fs.writeFileSync(outPath, Buffer.from(JSON.stringify(article, null, 2), "utf-8"));
    console.log(`${n} DONE (${beforeWords}w -> ${afterWords}w, pos ${t.position}): ${t.slug}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${n} ERROR: ${t.slug} -- ${msg}`);
  }

  await new Promise((r) => setTimeout(r, 8000));
}

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
      const [k, v] = line.split("=");
      if (k && v) process.env[k.trim()] = v.trim();
    });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  if (!groqKey && !cerebrasKey) {
    console.error("ERROR: set GROQ_API_KEY and/or CEREBRAS_API_KEY in .env.local");
    process.exit(1);
  }
  if (!groqKey) { useGroq = false; console.log("No Groq key -- Cerebras only"); }

  const groq = new Groq({ apiKey: groqKey ?? "none" });
  const cerebras = new Cerebras({ apiKey: cerebrasKey ?? "none" });

  console.log(`Upgrading ${TARGETS.length} already-ranking pages (slugs preserved)...\n`);
  for (let i = 0; i < TARGETS.length; i++) {
    await upgrade(groq, cerebras, TARGETS[i], i);
  }
  console.log("\nDone. Originals remain in content/_backup_pre_upgrade/");
}

main().catch(console.error);
