/**
 * Batch 2: 45 articles aimed at GSC queries that already draw impressions
 * but have no dedicated page yet.
 *
 * Every topic below is lifted from the Search Console query export, not
 * invented. Same four converting shapes as batch 1 (savings, city pricing,
 * "does it take X", comparisons) plus a per-item cost cluster, which is
 * where a lot of the uncovered demand sits.
 *
 * Run: npx tsx scripts/generate-batch-2.ts
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import fs from "fs";
import path from "path";
import { FACTS } from "./lib/research-facts";

// Groq first: Cerebras is returning 402 (free allowance spent). Groq's
// gpt-oss-120b returns ~1,800 words in about 6s at a 5k token budget, but
// stalls indefinitely at 6k -- keep max_tokens at 5000.
let useGroq = true;

interface Topic { title: string; angle: string; query: string }

const TOPICS: Topic[] = [
  // ---- per-item cost (uncovered, high intent) ----
  { title: "1-800-GOT-JUNK Mattress Removal Cost: What You Will Actually Pay", angle: "item", query: "1800 got junk mattress removal cost" },
  { title: "1-800-GOT-JUNK Couch and Sofa Removal Cost", angle: "item", query: "1800 got junk couch removal price" },
  { title: "1-800-GOT-JUNK Appliance Removal Cost by Item", angle: "item", query: "got junk appliance cost" },
  { title: "1-800-GOT-JUNK TV Removal: Will They Take Old Televisions?", angle: "item", query: "will 1-800-got-junk pick up old televisions" },
  { title: "1-800-GOT-JUNK Hot Tub Removal Cost and What Is Involved", angle: "item", query: "got junk hot tub removal" },
  { title: "Office Desk Removal: Cost and Options", angle: "item", query: "office desk removal" },
  { title: "What to Do With Old Bicycles", angle: "item", query: "what to do with old bicycles" },

  // ---- pricing mechanics (uncovered) ----
  { title: "Is There a 1-800-GOT-JUNK Price Estimator? How to Get a Number", angle: "pricing", query: "1 800 got junk pricing estimator" },
  { title: "1-800-GOT-JUNK Fees: The Complete List of What You Pay For", angle: "pricing", query: "got junk fees" },
  { title: "What Actually Determines Your 1-800-GOT-JUNK Price", angle: "pricing", query: "1-800-got-junk pricing factors item type location volume" },
  { title: "1-800-GOT-JUNK Payment Methods: What They Accept", angle: "pricing", query: "got junk payment options" },
  { title: "1-800-GOT-JUNK Truck Size: What Actually Fits Inside", angle: "pricing", query: "1800gotjunk truck size" },
  { title: "How to Get a 1-800-GOT-JUNK Quote Without Surprises", angle: "pricing", query: "got junk quote" },
  { title: "Does 1-800-GOT-JUNK Offer Bin or Dumpster Rental?", angle: "pricing", query: "got junk bin rental" },

  // ---- free / low-cost (strong query cluster, all uncovered) ----
  { title: "How to Get Junk Hauled Away for Free", angle: "free", query: "haul off junk for free" },
  { title: "Free Junk Removal for Seniors: What Is Actually Available", angle: "free", query: "free junk removal for seniors near me" },
  { title: "Free Junk Removal for Disabled Homeowners", angle: "free", query: "free junk removal for disabled" },
  { title: "Cheapest Way to Get Rid of Junk in 2026", angle: "free", query: "cheapest way to get rid of junk" },
  { title: "Free Scrap Metal Removal: How It Works and Who Does It", angle: "free", query: "free scrap removal near me" },

  // ---- comparisons (uncovered competitors) ----
  { title: "Junk King Cost: Full Price Breakdown", angle: "compare", query: "junk king cost" },
  { title: "LoadUp Reviews: What Customers Actually Say", angle: "compare", query: "loadup reviews" },
  { title: "Dropcurb vs 1-800-GOT-JUNK: How They Compare", angle: "compare", query: "dropcurb vs 1-800-got-junk" },
  { title: "Best Alternatives to Bagster", angle: "compare", query: "alternative to bagster" },
  { title: "1-800-GOT-JUNK vs Renting a Pickup Truck: Real Cost Math", angle: "compare", query: "1800 got junk vs truck rental" },

  // ---- cities (2nd best converting shape; includes Canada, which draws real traffic) ----
  { title: "1-800-GOT-JUNK Toronto Prices: What Canadians Pay", angle: "city", query: "got junk toronto prices" },
  { title: "1-800-GOT-JUNK Cost in Milwaukee: Wisconsin Rates", angle: "city", query: "junk removal milwaukee" },
  { title: "1-800-GOT-JUNK Cost in Cleveland: Northeast Ohio Rates", angle: "city", query: "junk removal cleveland" },
  { title: "1-800-GOT-JUNK Cost in Cincinnati: Southwest Ohio Pricing", angle: "city", query: "junk removal cincinnati" },
  { title: "1-800-GOT-JUNK Cost in New Orleans: Louisiana Rates", angle: "city", query: "junk removal new orleans" },
  { title: "1-800-GOT-JUNK Cost in Buffalo: Western New York Pricing", angle: "city", query: "junk removal buffalo" },
  { title: "1-800-GOT-JUNK Cost in Albuquerque: New Mexico Rates", angle: "city", query: "junk removal albuquerque" },
  { title: "1-800-GOT-JUNK Cost in Tucson: Southern Arizona Pricing", angle: "city", query: "junk removal tucson" },
  { title: "1-800-GOT-JUNK Cost in Fresno: Central Valley Rates", angle: "city", query: "junk removal fresno" },
  { title: "1-800-GOT-JUNK Cost in Omaha: Nebraska Pricing", angle: "city", query: "junk removal omaha" },

  // ---- old car cluster (many query variants, one thin page today) ----
  { title: "Best Way to Get Rid of an Old Car", angle: "howto", query: "best way to get rid of old car" },
  { title: "How to Get Rid of a Car That Needs Repairs", angle: "howto", query: "how to get rid of a car that needs repairs" },
  { title: "How to Get Rid of a Car Without a Title", angle: "howto", query: "get rid of car no title" },
  { title: "How to Scrap a Car for Cash: Step by Step", angle: "howto", query: "scrap car for cash" },

  // ---- cell phone cluster (largest single query cluster in the export) ----
  { title: "Where to Recycle Old Cell Phones Near You", angle: "howto", query: "cell phone disposal near me" },
  { title: "How to Wipe a Phone Before Recycling or Donating It", angle: "howto", query: "how to destroy old cell phones" },
  { title: "Who Takes Old Cell Phones? Every Option Compared", angle: "howto", query: "who takes old cell phones" },
  { title: "How to Dispose of Old Mobile Phones Safely", angle: "howto", query: "how to dispose of old mobile phones" },

  // ---- discounts (best converting shape) ----
  { title: "1-800-GOT-JUNK Deals: What Is Real Right Now", angle: "discount", query: "gotjunk deals" },
  { title: "How to Get a Free Estimate From 1-800-GOT-JUNK", angle: "discount", query: "free estimate 1800 junk" },
];

const ANGLE_GUIDE: Record<string, string> = {
  item: `A PER-ITEM COST article. The reader has one specific object and wants a
number. Give the verified figure or range in the first two sentences. Then:
how it is priced (single-item vs folded into a volume load), when adding it to
a bigger load beats a solo pickup, prep required, and the cheaper alternatives
(municipal bulky pickup, retailer haul-away on delivery, donation, scrap).
Include a table of the realistic options with costs.`,

  pricing: `A PRICING-MECHANICS article. The reader wants to predict the number
before anyone shows up. Be concrete about how the volume model works, what the
truck fractions mean in real items, and why they refuse to quote over the
phone. Include a table mapping load fraction to price and to example contents.
Say plainly where the model is opaque -- that honesty is why this page beats
the brochure pages.`,

  free: `A FREE / CHEAPEST-OPTION article. The reader does not want to pay, so do
not push a paid service at them. Lead with the genuinely free routes:
municipal bulky-item pickup, scrap metal collectors, Buy Nothing groups,
Habitat ReStore and charity pickups, retailer haul-away, freecycle. Be honest
that paid removal is the fallback for items nobody will take free. Include a
table of options with what each will and will not accept. A page that pretends
free options do not exist will not rank on these queries.`,

  compare: `A COMPARISON article. Head-to-head table: minimum price, pricing
model, price certainty, coverage, what is included, best-for. Let the evidence
decide the winner. LoadUp's guaranteed up-front price is a real advantage and
College Hunks' $99 dispatch fee is a real drawback -- say so. Close with a
"pick X if / pick Y if" block.`,

  city: `A LOCAL PRICING article. Anchor to the verified national ranges, then
explain where this metro sits and why: landfill tipping fees, labor market,
drive time, disposal rules, cost of living. Include a load-size table. For
Toronto, note that pricing is in CAD and Canadian franchises price separately
from the US ones. Mention real local disposal options and access quirks, but
never invent a franchise address, phone number, or an exact local price.`,

  howto: `A HOW-TO article where 1-800-GOT-JUNK is at most one option among many.
The reader wants the task solved, not a service sold. Give the genuinely best
routes first, ordered by what most people should actually do. For anything
holding data, cover wiping and data destruction properly. For vehicles, cover
title, plates, and notifying the DMV. Mention paid junk removal only where it
honestly fits.`,

  discount: `A SAVINGS article. Most competing pages are coupon-farm spam listing
codes that do not work. Your advantage is honesty: lead with the truthful
answer even when it is "that discount does not exist", then pivot to what
genuinely lowers the bill, with dollar math. Never name a specific promo code
-- they cannot be verified, and naming them makes this page look like the spam
it is competing against.`,
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildPrompt(t: Topic): string {
  return `You are writing for Junk Removal Guide, an independent review site. Write the definitive article on: "${t.title}"

This page targets the real search query: "${t.query}" -- people search this
now and land on nothing good. Answer that query completely.

${FACTS}

ANGLE-SPECIFIC DIRECTION:
${ANGLE_GUIDE[t.angle]}

REQUIREMENTS:
- 1800-2400 words.
- Answer the question directly in the first two sentences. No preamble.
- 5-7 H2 sections with real substance, H3 subsections inside them.
- At least ONE markdown table with real numbers or a real comparison.
- At least one worked dollar example with the arithmetic shown.
- A "common mistakes" or "what people get wrong" section.
- An FAQ of 5-6 questions real searchers ask, 2-4 sentences each.
- A short concrete takeaway. No hype.

HONESTY RULES (non-negotiable):
- Use ONLY the pricing figures in the data above. Never invent a number.
- Never name a promo or coupon code. None of them can be verified.
- Never claim a discount or program exists unless it is in the data above.
- Never claim first-hand research. Do not write "we tested", "we called",
  "in testing", "our research team" or anything similar -- none of that
  happened.
- Where something varies by market or franchise, say so and point the reader
  at the on-site estimate.
- Recommend the competitor, the free route, or DIY whenever it is genuinely
  the better answer. A page that only ever recommends one company will not
  rank and does not deserve to.

TONE & FORMAT:
- Plain, direct, knowledgeable. A contractor explaining it, not a brochure.
- Short paragraphs, 2-3 sentences. Bullet lists. Bold the key numbers.
- Reads well on a phone.

AFFILIATE CTA:
- Exactly ONE [CTA] placeholder, roughly 60-75% down, after real value has
  been delivered. Never in the intro. On "free" angle articles, place it only
  where paid removal is honestly the right fallback.

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
    } catch { /* corrupt file -- fall through and regenerate */ }
  }

  try {
    let content = "";

    if (useGroq) {
      // Groq caps tokens-per-minute, and one article costs roughly 7,500.
      // A 429 means the window is simply full, so wait for it to refill and
      // retry rather than burning the article -- Cerebras is out of credit
      // and cannot catch these.
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
            const waitMs = 65000;
            console.log(`  ${n} rate limited, waiting ${waitMs / 1000}s (attempt ${attempt}/3)`);
            await new Promise((r) => setTimeout(r, waitMs));
          } else {
            console.log(`  ${n} Groq failed (${msg.slice(0, 90)}) -- trying Cerebras`);
            break;
          }
        }
      }
    }

    if (!useGroq || !content) {
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
      keywords: kw ? kw[1].split(",").map((k) => k.trim()) : ["junk removal", "1-800-GOT-JUNK", "junk removal cost"],
      body: content,
      generatedAt: new Date().toISOString(),
      quality: true,
      angle: t.angle,
      targetQuery: t.query,
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

  console.log(`Batch 2: generating ${TOPICS.length} articles from live GSC queries...\n`);
  for (let i = 0; i < TOPICS.length; i++) await generate(groq, cerebras, TOPICS[i], i);
  console.log("\nDone.");
}

main().catch(console.error);
