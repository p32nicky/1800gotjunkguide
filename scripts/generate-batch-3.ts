/**
 * Batch 3: 40 articles for the biggest UNCOVERED clusters in the Sept 2026
 * Search Console export.
 *
 * The site now earns ~14 clicks and tens of thousands of impressions, up from
 * 1 click / 986 impressions in June. The pages that convert are the ones we
 * built to a real query. These are the clusters that still have none:
 *
 *   Junkluggers   ~2,000 impressions, one passing mention sitewide
 *   RV / camper   ~800 impressions, nothing at all
 *   Philadelphia  ~1,030 impressions, one thin page
 *   Denver        ~700 impressions, nothing
 *   LoadUp        ~500, Junk King ~290, both barely covered
 *   Drywall/brick ~190, nothing
 *   "$99 service"  20% CTR -- best converting query on the site, no page
 *
 * Run: npx tsx scripts/generate-batch-3.ts
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import fs from "fs";
import path from "path";
import { FACTS } from "./lib/research-facts";

// Groq first. Cerebras has been returning 402 (allowance spent), so it is a
// dead fallback -- every Groq 429 is a hard failure. Groq reserves max_tokens
// against its 8k/min budget rather than actual usage, so 3500 + 60s pacing is
// the cadence that actually completes.
let useGroq = true;

interface Topic { title: string; angle: string; query: string; impressions: number }

const TOPICS: Topic[] = [
  // ---- JUNKLUGGERS (~2,000 impressions, essentially uncovered) ----
  { title: "How Much Does Junkluggers Cost? Real Pricing Breakdown", angle: "compete", query: "how much does junkluggers cost near me", impressions: 1135 },
  { title: "Junkluggers Review: Pricing, Service and Whether It Is Worth It", angle: "compete", query: "junkluggers review", impressions: 675 },
  { title: "Junkluggers Price List: What Each Item Costs", angle: "compete", query: "junkluggers price list", impressions: 127 },
  { title: "Junkluggers vs LoadUp: Which Should You Pick?", angle: "compare", query: "loadup vs junkluggers", impressions: 75 },
  { title: "Junkluggers vs College Hunks: Eco-Friendly Comparison", angle: "compare", query: "college hunks hauling junk vs junkluggers", impressions: 24 },

  // ---- RV / CAMPER DISPOSAL (~800 impressions, zero coverage) ----
  { title: "How to Dispose of an RV: Every Option Compared", angle: "howto", query: "how to dispose of an rv", impressions: 384 },
  { title: "How to Scrap a Camper Trailer for Cash", angle: "howto", query: "how to scrap a camper trailer", impressions: 188 },
  { title: "How to Get Rid of an Old Motorhome", angle: "howto", query: "how to get rid of an old motorhome", impressions: 154 },
  { title: "How to Dispose of an Old Travel Trailer", angle: "howto", query: "how to get rid of old camper trailer", impressions: 94 },
  { title: "RV Recycling: What Actually Gets Recycled", angle: "howto", query: "rv recycling", impressions: 13 },

  // ---- PHILADELPHIA (~1,030 impressions) ----
  { title: "1-800-GOT-JUNK Philadelphia: Costs and Coverage", angle: "city", query: "got junk philadelphia", impressions: 568 },
  { title: "Junk Removal Philadelphia Prices: Full Breakdown", angle: "city", query: "junk removal philadelphia prices", impressions: 472 },

  // ---- DENVER (~700 impressions, no page) ----
  { title: "Junk Removal Truck Cost in Denver: What You Will Pay", angle: "city", query: "junk removal truck cost denver co", impressions: 361 },
  { title: "1-800-GOT-JUNK Denver: Pricing and Service Areas", angle: "city", query: "got junk denver", impressions: 353 },

  // ---- THE $99 QUERY (20% CTR -- best converting on the site) ----
  { title: "What Is Included in a $99 Junk Removal Service?", angle: "pricing", query: "what's included in a $99 junk removal service?", impressions: 42 },
  { title: "Junk Removal Minimum Load Size Explained", angle: "pricing", query: "explain the typical minimum load size", impressions: 30 },

  // ---- LOADUP (~500) ----
  { title: "LoadUp Pricing: What You Will Actually Pay", angle: "compete", query: "loadup pricing", impressions: 144 },
  { title: "Is LoadUp Legit? An Honest Look at the Reviews", angle: "compete", query: "is loadup legit", impressions: 97 },
  { title: "LoadUp vs Junk King: Per-Item vs Volume Pricing", angle: "compare", query: "loadup vs junk king", impressions: 71 },

  // ---- JUNK KING (~290) ----
  { title: "Junk King Prices: Full Cost Breakdown", angle: "compete", query: "junk king prices", impressions: 200 },
  { title: "Junk King Truck Size: What Actually Fits", angle: "compete", query: "junk king truck size", impressions: 17 },

  // ---- CITIES WITH VOLUME AND NO PAGE ----
  { title: "1-800-GOT-JUNK Indianapolis: Prices and Coverage", angle: "city", query: "got junk indianapolis", impressions: 465 },
  { title: "1-800-GOT-JUNK Charlotte NC: What It Costs", angle: "city", query: "got junk cost in charlotte, nc", impressions: 415 },
  { title: "1-800-GOT-JUNK Fort Worth: Pricing Guide", angle: "city", query: "1800 got junk fort worth", impressions: 272 },
  { title: "1-800-GOT-JUNK Seattle: Prices and Service", angle: "city", query: "got junk seattle", impressions: 182 },
  { title: "1-800-GOT-JUNK Portland: Oregon Pricing", angle: "city", query: "got junk portland", impressions: 139 },
  { title: "1-800-GOT-JUNK San Jose: Bay Area Pricing", angle: "city", query: "got junk san jose", impressions: 94 },

  // ---- CONSTRUCTION DEBRIS (~190, zero coverage) ----
  { title: "How to Dispose of Drywall and Sheetrock", angle: "howto", query: "how to dispose of drywall", impressions: 95 },
  { title: "Is Drywall Recyclable? How Drywall Recycling Works", angle: "howto", query: "drywall recycling", impressions: 45 },
  { title: "How to Dispose of Bricks and Concrete", angle: "howto", query: "how to dispose of bricks", impressions: 62 },

  // ---- APPLIANCES / ITEMS WITH DEMAND ----
  { title: "How to Get Rid of an Old Dryer", angle: "howto", query: "what to do with old dryer", impressions: 79 },
  { title: "Bicycle Removal and Disposal: Every Option", angle: "howto", query: "bicycle removal", impressions: 165 },
  { title: "1-800-GOT-JUNK Treadmill and Exercise Bike Cost", angle: "item", query: "exercise bike got junk", impressions: 120 },

  // ---- SERVICE QUESTIONS WITH REAL VOLUME ----
  { title: "Does 1-800-GOT-JUNK Offer Dumpster Rental?", angle: "pricing", query: "got junk dumpsters", impressions: 154 },
  { title: "Does 1-800-GOT-JUNK Donate Items?", angle: "takes", query: "does got junk donate items", impressions: 166 },
  { title: "Retail Store Cleanout: Cost and Process", angle: "takes", query: "retail store cleanout", impressions: 42 },

  // ---- THE ASSISTANT-STYLE QUERIES (long natural-language, real volume) ----
  { title: "Is 1-800-GOT-JUNK More Expensive for Same-Day or Weekend Service?", angle: "pricing", query: "is 1-800-got-junk more expensive for same-day or weekend service?", impressions: 94 },
  { title: "Are There Hidden Fees in 1-800-GOT-JUNK Quotes?", angle: "pricing", query: "are there any hidden fees or additional charges in 1-800-got-junk quotes?", impressions: 63 },
  { title: "What Is the Cost Difference Between Major Junk Haulers?", angle: "compare", query: "what's the cost difference between major junk haulers?", impressions: 49 },
  { title: "How Do Junk Removal Prices Vary by Company?", angle: "compare", query: "how do junk removal prices vary by company?", impressions: 48 },
];

const ANGLE_GUIDE: Record<string, string> = {
  compete: `A COMPETITOR article about a company that is NOT 1-800-GOT-JUNK. The
reader is researching that company, so write about THAT company honestly and
in depth. Do not bait-and-switch into a 1-800-GOT-JUNK pitch -- that is the
fastest way to lose the reader and the ranking. Cover their pricing model,
minimums, what is included, coverage, and the real complaints. Compare to
1-800-GOT-JUNK only where a reader would genuinely want the comparison, and
say plainly when the competitor is the better choice.`,

  compare: `A HEAD-TO-HEAD comparison. Include a table: minimum price, pricing
model, price certainty, coverage, what is included, best-for. Let the evidence
pick the winner -- LoadUp's guaranteed up-front price is a real advantage and
College Hunks' $99 dispatch fee is a real drawback. Close with a "pick X if /
pick Y if" block, not a sales pitch.`,

  city: `A LOCAL PRICING article. Anchor to the verified national ranges, then
explain where this metro sits and why: landfill tipping fees, labor market,
drive time, disposal rules, cost of living. Include a load-size table. Mention
real local disposal options and access quirks (row homes and narrow streets in
Philadelphia, altitude and sprawl in Denver, and so on), but NEVER invent a
franchise address, phone number, or an exact local price.`,

  pricing: `A PRICING-MECHANICS article. The reader wants to predict the number
before anyone shows up. Explain the volume model concretely, what each truck
fraction means in real items, and why they will not quote over the phone. For
the "$99 service" question specifically: be honest that $99 is a teaser tied
to a very small minimum load, explain exactly what does and does not fit, and
show what people actually end up paying. Include a table mapping load fraction
to price and to example contents.`,

  howto: `A HOW-TO article where paid junk removal is at most one option among
many, and often not the best one. The reader wants the task solved. Lead with
the genuinely best routes in the order most people should try them. For
vehicles and RVs: title transfer, plates, DMV notification, salvage yards,
scrap metal value by weight, donation programs, and why an RV is harder than a
car (fiberglass, tanks, propane, appliances). For construction debris: whether
it is even accepted, recycling facilities that take it, and weight-based
tipping fees. Mention 1-800-GOT-JUNK only where it honestly fits.`,

  takes: `An ACCEPTANCE / SERVICE article. Answer the yes/no in the first
sentence, then get specific: what it costs, how it is priced, what prep is
needed, and the real exceptions. Cover what to do INSTEAD when the answer is
no -- that is the part competing pages skip and the reason readers stay.`,

  item: `A PER-ITEM COST article. Give the verified figure or range in the first
two sentences, then cover how it is priced (single item vs folded into a
volume load), when adding it to a bigger load is cheaper than a solo pickup,
prep required, and the cheaper alternatives. Include a table of realistic
options with costs.`,
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildPrompt(t: Topic): string {
  return `You are writing for Junk Removal Guide, an independent review site. Write the definitive article on: "${t.title}"

This targets a real Search Console query -- "${t.query}" -- drawing roughly
${t.impressions} impressions a month with no page on this site answering it.
Answer that query completely and better than anything currently ranking.

${FACTS}

ANGLE-SPECIFIC DIRECTION:
${ANGLE_GUIDE[t.angle]}

REQUIREMENTS:
- 1600-2200 words.
- Answer the question directly in the first two sentences. No preamble.
- 5-7 H2 sections with real substance, H3 subsections inside them.
- At least ONE markdown table with real numbers or a real comparison.
- At least one worked dollar example with the arithmetic shown.
- A "common mistakes" or "what people get wrong" section.
- An FAQ of 5-6 questions real searchers ask, 2-4 sentences each.
- A short concrete takeaway. No hype.

HONESTY RULES (non-negotiable):
- Use ONLY the pricing figures in the data above for 1-800-GOT-JUNK and the
  named competitors. Never invent a number. Where you genuinely do not have a
  figure -- a specific Junkluggers item price, a local franchise rate -- say
  that it varies and tell the reader how to find out, rather than guessing.
- Never name a promo or coupon code. None can be verified.
- Never claim a discount or program exists unless it is in the data above.
- Never claim first-hand research. Do not write "we tested", "we called",
  "in testing", "our research team" or anything similar. None of it happened.
- Recommend the competitor, the free route, or DIY whenever it is genuinely
  the better answer.

TONE & FORMAT:
- Plain, direct, knowledgeable. A contractor explaining it, not a brochure.
- Short paragraphs, 2-3 sentences. Bullet lists. Bold the key numbers.
- Reads well on a phone.

AFFILIATE CTA:
- Exactly ONE [CTA] placeholder, roughly 60-75% down, after real value has
  been delivered. Never in the intro. On competitor and how-to articles, place
  it only where 1-800-GOT-JUNK is honestly a relevant option.

OUTPUT FORMAT:
- First line: META: <140-158 chars stating the actual answer, so it earns the
  click from the search result>
- Second line: KEYWORDS: five comma-separated keywords
- Then the article in markdown, starting with an H1.

Write it now.`;
}

async function generate(groq: Groq, cerebras: Cerebras, t: Topic, i: number) {
  const slug = slugify(t.title);
  const outPath = path.join("content", "articles", `${slug}.json`);
  const n = `[${i + 1}/${TOPICS.length}]`;

  if (fs.existsSync(outPath)) {
    try {
      const ex = JSON.parse(fs.readFileSync(outPath, "utf-8"));
      if (ex.quality && ex.body) { console.log(`${n} SKIP (exists): ${t.title}`); return; }
    } catch { /* corrupt -- regenerate */ }
  }

  try {
    let content = "";

    if (useGroq) {
      for (let attempt = 1; attempt <= 4 && !content; attempt++) {
        try {
          const c = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: buildPrompt(t) }],
            max_tokens: 3500,
            temperature: 0.7,
          });
          content = c.choices[0]?.message?.content ?? "";
        } catch (e: unknown) {
          const msg = String(e);
          const rateLimited = msg.includes("429") || msg.includes("Rate limit");
          if (rateLimited && attempt < 4) {
            console.log(`  ${n} rate limited, waiting 65s (attempt ${attempt}/3)`);
            await new Promise((r) => setTimeout(r, 65000));
          } else {
            console.log(`  ${n} Groq failed (${msg.slice(0, 90)}) -- trying Cerebras`);
            break;
          }
        }
      }
    }

    if (!content) {
      const c = await cerebras.chat.completions.create({
        model: "gpt-oss-120b",
        messages: [{ role: "user", content: buildPrompt(t) }],
        max_tokens: 3500,
        // @ts-ignore
        temperature: 0.7,
      });
      content = (c.choices[0]?.message?.content as string) ?? "";
    }

    const meta = content.match(/META:\s*(.+)/);
    const kw = content.match(/KEYWORDS:\s*(.+)/);
    const words = content.split(/\s+/).length;

    fs.writeFileSync(outPath, Buffer.from(JSON.stringify({
      slug,
      title: t.title,
      metaDescription: meta ? meta[1].trim() : `${t.title} -- real pricing, honest answers.`,
      keywords: kw ? kw[1].split(",").map((k) => k.trim()) : ["junk removal", "junk removal cost"],
      body: content,
      generatedAt: new Date().toISOString(),
      quality: true,
      angle: t.angle,
      targetQuery: t.query,
      targetImpressions: t.impressions,
    }, null, 2), "utf-8"));

    console.log(`${n} DONE (${words}w): ${t.title}`);
  } catch (err: unknown) {
    console.error(`${n} ERROR: ${t.title} -- ${err instanceof Error ? err.message : String(err)}`);
  }

  await new Promise((r) => setTimeout(r, 60000));
}

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
      const [k, v] = line.split("=");
      if (k && v) process.env[k.trim()] = v.trim();
    });
  }

  const gk = process.env.GROQ_API_KEY;
  const ck = process.env.CEREBRAS_API_KEY;
  if (!gk && !ck) {
    console.error("ERROR: set GROQ_API_KEY and/or CEREBRAS_API_KEY in .env.local");
    process.exit(1);
  }
  if (!gk) { useGroq = false; console.log("No Groq key -- Cerebras only"); }

  const groq = new Groq({ apiKey: gk ?? "none" });
  const cerebras = new Cerebras({ apiKey: ck ?? "none" });

  const total = TOPICS.reduce((s, t) => s + t.impressions, 0);
  console.log(`Batch 3: ${TOPICS.length} articles covering ~${total.toLocaleString()} monthly impressions\n`);
  for (let i = 0; i < TOPICS.length; i++) await generate(groq, cerebras, TOPICS[i], i);
  console.log("\nDone.");
}

main().catch(console.error);
