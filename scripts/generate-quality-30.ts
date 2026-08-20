/**
 * Generates 30 HIGH-QUALITY articles using researched, verified pricing data.
 * Modeled on the 4 templates that actually converted:
 *   discounts/savings (7 conv), city pricing (5), "does it take X" (3), comparisons (2)
 * Run: npx tsx scripts/generate-quality-30.ts
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import fs from "fs";
import path from "path";

let useGroq = true;

/* ------------------------------------------------------------------ *
 * VERIFIED RESEARCH DATA — injected into every prompt.
 * Sources: 1800gotjunk.com/how-our-pricing-works, homeguide.com,
 * movebuddha.com, move.org, goloadup.com (Aug 2026)
 * ------------------------------------------------------------------ */
const FACTS = `
VERIFIED PRICING DATA — use these real numbers. Do NOT invent different ones.

1-800-GOT-JUNK? pricing (volume-based, priced in 1/8-truck increments):
- Minimum load (1/8 truck): $100-$150
- Small loads: $107-$396
- Medium loads: $396-$600
- Large loads: $600-$1,099
- Half truckload: $400-$600
- Full truckload: $600-$1,000
- Average job across all customers: about $240
- Single-item examples: sofa ~$170, loveseat ~$100, refrigerator ~$115

Truck dimensions (official):
- Minimum load: 1.25ft long x 5ft high x 8ft wide
- Half load: 5ft long x 5ft high x 8ft wide
- Full load: 10ft long x 5ft high x 8ft wide (about 18 cubic yards)

What the price includes: all labor, loading from anywhere on the property
(you do NOT have to move items to the curb), hauling, disposal and recycling
fees, and cleanup afterward. Crews are licensed and insured.

How booking works: book online or call 1-800-468-5865. They do NOT quote
prices online or over the phone. You get a free on-site estimate first, no
credit card required. Crew calls 25-30 minutes before arrival. Same-day
service is often available. They also run a separate product called "Flex"
with instant online pricing starting at $39 (you load a bag/container
yourself, they collect it).

DISCOUNTS — THE HONEST TRUTH (this is important, most sites lie about this):
- There is NO official military discount.
- There is NO official senior discount.
- There is NO official student discount.
- There is NO official AAA discount.
- The coupon aggregator sites listing codes like "MYJUNK30" are publishing
  unverified or expired codes. Most do not work at checkout. Say so plainly.
- What DOES work: joining the email list via the popup or footer form on
  their homepage gets you $10-$25 off codes. Individual franchises sometimes
  run local seasonal promotions.
- The biggest real savings levers are behavioral, not codes:
  consolidating everything into one pickup instead of two, splitting a truck
  with a neighbor, being flexible on scheduling (mid-week and off-season are
  softer), pre-sorting so the crew loads faster, donating or selling usable
  items first to shrink the volume, and getting 2-3 competing quotes.

COMPETITOR PRICING (for honest comparison):
- LoadUp: $89 minimum. Prices PER ITEM, not by volume. You get a guaranteed
  price online at booking and it does not change on service day. Covers all
  50 states. Customers commonly report quotes 20-30% below competitors.
- Junk King: about $99 minimum. Volume-based. Half truck $389-$488, full
  truck $589-$658. Online estimate is approximate, confirmed on site.
  Coverage has gaps in several states.
- College Hunks Hauling Junk: $150-$750 per job, volume-based. Widely
  reported $99 service/dispatch fee that customers discover after booking.

Regional note: pricing genuinely varies by market because local landfill
tipping fees, labor costs, and disposal regulations differ. High cost-of-
living metros (NYC, SF, Boston, Seattle) trend toward the upper end of every
range above; midwest and southern metros trend toward the middle or lower
end. Do NOT fabricate a precise city-specific dollar figure that you cannot
support — instead explain where that city falls within the verified ranges
and WHY (landfill fees, permit rules, traffic/drive time, labor market).
`.trim();

/* ------------------------------------------------------------------ *
 * 30 TOPICS — new slugs, modeled on the 4 converting patterns.
 * Deliberately does NOT overwrite the proven converter
 * ("how-to-get-a-discount-on-1-800-got-junk").
 * ------------------------------------------------------------------ */
const TOPICS: { title: string; angle: string }[] = [
  // ---- DISCOUNTS / SAVINGS (10) — highest converting pattern ----
  { title: "Do 1-800-GOT-JUNK Promo Codes Actually Work? We Checked",
    angle: "discount" },
  { title: "1-800-GOT-JUNK Military Discount: The Honest Answer",
    angle: "discount" },
  { title: "1-800-GOT-JUNK Senior Discount: What's Real and What Isn't",
    angle: "discount" },
  { title: "11 Ways to Lower Your 1-800-GOT-JUNK Bill",
    angle: "discount" },
  { title: "Cheapest Way to Book 1-800-GOT-JUNK: Timing, Volume and Prep",
    angle: "discount" },
  { title: "How to Split a Junk Removal Truck With Your Neighbors",
    angle: "discount" },
  { title: "1-800-GOT-JUNK Flex vs Full Service: Which Actually Costs Less?",
    angle: "discount" },
  { title: "Is the 1-800-GOT-JUNK Minimum Charge Worth It for One Item?",
    angle: "discount" },
  { title: "How to Get Three Junk Removal Quotes in One Afternoon",
    angle: "discount" },
  { title: "Junk Removal Hidden Fees: What Every Company Charges Extra For",
    angle: "discount" },

  // ---- CITY PRICING (10) — second best converting pattern ----
  { title: "1-800-GOT-JUNK Cost in Boston: What Massachusetts Rates Look Like",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Sacramento: California Pricing Explained",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Minneapolis: Twin Cities Rates",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Tampa: Florida Pricing Breakdown",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Pittsburgh: Western PA Rates",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Raleigh: Triangle Area Pricing",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Salt Lake City: Utah Rates Explained",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Kansas City: Missouri and Kansas Rates",
    angle: "city" },
  { title: "1-800-GOT-JUNK Cost in Orlando: Central Florida Pricing",
    angle: "city" },
  { title: "Why 1-800-GOT-JUNK Costs More in Some Cities Than Others",
    angle: "city" },

  // ---- "DOES IT TAKE X" (6) ----
  { title: "Does 1-800-GOT-JUNK Take Washers and Dryers? Cost and Rules",
    angle: "takes" },
  { title: "Does 1-800-GOT-JUNK Take Treadmills and Home Gym Equipment?",
    angle: "takes" },
  { title: "Does 1-800-GOT-JUNK Take Sheds? What They Will and Won't Demo",
    angle: "takes" },
  { title: "Does 1-800-GOT-JUNK Take Lawn Mowers and Gas-Powered Tools?",
    angle: "takes" },
  { title: "Does 1-800-GOT-JUNK Take Bathroom Fixtures and Old Toilets?",
    angle: "takes" },
  { title: "Does 1-800-GOT-JUNK Take Broken Furniture Nobody Wants?",
    angle: "takes" },

  // ---- COMPARISONS (4) ----
  { title: "LoadUp vs 1-800-GOT-JUNK: Per-Item vs Volume Pricing Compared",
    angle: "compare" },
  { title: "Junk King vs 1-800-GOT-JUNK: Real Price Comparison",
    angle: "compare" },
  { title: "College Hunks vs 1-800-GOT-JUNK: Watch the Dispatch Fee",
    angle: "compare" },
  { title: "1-800-GOT-JUNK vs a $400 Dumpster Rental: Which Wins?",
    angle: "compare" },
];

const ANGLE_GUIDE: Record<string, string> = {
  discount: `
This is a SAVINGS article. The reader is price-sensitive and actively looking
for a way to pay less. Most competing pages on this query are coupon-farm spam
listing fake codes. Your competitive advantage is HONESTY.
- Lead with the truthful answer, even when the truthful answer is "no, that
  discount does not exist."
- Then immediately pivot to what DOES save money, with real dollar math.
- Show at least one worked example: "a 1/4-truck load quoted at $320 drops to
  the $150 minimum band if you donate the two usable dressers first."
- Include a comparison table of savings tactics vs realistic dollars saved.`,

  city: `
This is a LOCAL PRICING article. The reader wants to know what THEY will pay.
- Anchor to the verified national ranges, then explain where this metro sits
  and WHY: landfill tipping fees, labor market, drive time/traffic, permit or
  disposal rules, cost of living.
- Include a table of load size -> expected local range.
- Mention realistic local specifics (neighborhoods, disposal facilities,
  apartment/walk-up access, HOA or permit quirks) WITHOUT inventing precise
  facts you cannot support. Speak in terms of what to expect and verify.
- Never fabricate a franchise phone number, address, or an exact local price.`,

  takes: `
This is an ACCEPTANCE article. The reader has a specific object and wants a
yes/no plus what it costs.
- Answer yes/no in the FIRST paragraph. Do not bury it.
- Then: what it typically costs, how it's priced (single item vs volume),
  prep required, and the exceptions that get a "no" (fuel, refrigerant,
  hazardous material, asbestos, structural demo needing a permit).
- Cover what to do INSTEAD when the answer is no. That's the part every
  competing page skips, and it's why readers stay on the page.`,

  compare: `
This is a COMPARISON article. The reader is deciding between two services.
- Include a head-to-head table: minimum price, pricing model, price certainty,
  coverage, what's included, best-for.
- Be genuinely even-handed. Say plainly when the competitor is cheaper or has
  a better model — LoadUp's guaranteed up-front pricing IS a real advantage,
  and College Hunks' $99 dispatch fee IS a real drawback.
- End with a "pick X if / pick Y if" decision block, not a sales pitch.
- A comparison that always concludes "1-800-GOT-JUNK wins" reads as an ad and
  will not rank. Let the data decide.`,
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildPrompt(topic: string, angle: string): string {
  return `You are writing for Junk Removal Guide, an independent review site. Write the definitive article on: "${topic}"

${FACTS}

ANGLE-SPECIFIC DIRECTION:
${ANGLE_GUIDE[angle]}

WHY THIS MATTERS: this site publishes hundreds of shallow AI-written pages and
Google has suppressed nearly all of them. This article must read like it was
written by a person who has actually priced junk removal jobs. Specificity,
real numbers, honest trade-offs, and admitting what you don't know are what
separate it from the pages that got buried.

REQUIREMENTS:
- 1800-2400 words.
- Open by answering the question directly in the first two sentences. No
  throat-clearing, no "In today's world" preamble.
- 4-6 H2 sections with real substance. Use H3 subsections inside them.
- Include at least ONE markdown table with real numbers from the data above.
- Include at least one worked dollar example with the arithmetic shown.
- Include a "What people get wrong" or "Common mistakes" section.
- Include an FAQ section with 5-6 questions real searchers ask, each answered
  in 2-4 sentences.
- Close with a short, concrete takeaway. No hype.

HONESTY RULES (non-negotiable):
- Use ONLY the pricing figures given above. Never invent a number.
- When something varies or you can't verify it, say so: "quotes in this range
  are typical, but you'll need the on-site estimate to know yours."
- Never claim a discount, coupon code, or program exists unless it's in the
  data above. If the honest answer is "that discount doesn't exist," lead with
  that — it is the most useful thing you can tell the reader.
- Mention the competitor honestly where relevant. Don't pretend 1-800-GOT-JUNK
  is always the best or cheapest choice, because it isn't.

TONE & FORMAT:
- Plain, direct, knowledgeable. Like a contractor explaining it, not a brochure.
- Short paragraphs, 2-3 sentences max. Bullet lists. Bold the key numbers.
- Reads well on a phone.

AFFILIATE CTA:
- Exactly ONE [CTA] placeholder, placed after you've delivered real value —
  never in the intro. Around 60-75% of the way down.

OUTPUT FORMAT:
- First line: META: <a 140-158 char meta description that states the actual
  answer, so it earns the click from the search result>
- Second line: KEYWORDS: five comma-separated keywords
- Then the article in markdown, starting with an H1.

Write it now.`;
}

async function generate(groq: Groq, cerebras: Cerebras, t: { title: string; angle: string }, i: number) {
  const slug = slugify(t.title);
  const outPath = path.join("content", "articles", `${slug}.json`);
  const prompt = buildPrompt(t.title, t.angle);
  const n = `[${i + 1}/${TOPICS.length}]`;

  // Already generated at quality? leave it alone. Makes re-runs fill gaps only.
  if (fs.existsSync(outPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
      if (existing.quality && existing.body) {
        console.log(`${n} SKIP (exists): ${t.title}`);
        return;
      }
    } catch { /* corrupt file -- fall through and regenerate */ }
  }

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

    const metaMatch = content.match(/META:\s*(.+)/);
    const kwMatch = content.match(/KEYWORDS:\s*(.+)/);
    const metaDescription = metaMatch ? metaMatch[1].trim() : `${t.title} — real pricing, honest answers.`;
    const keywords = kwMatch
      ? kwMatch[1].split(",").map((k) => k.trim())
      : ["1-800-GOT-JUNK", "junk removal cost", "junk removal pricing"];

    const wordCount = content.split(/\s+/).length;

    const article = {
      slug,
      title: t.title,
      metaDescription,
      keywords,
      body: content,
      generatedAt: new Date().toISOString(),
      quality: true,
      angle: t.angle,
    };

    fs.writeFileSync(outPath, Buffer.from(JSON.stringify(article, null, 2), "utf-8"));
    console.log(`${n} DONE (${wordCount}w): ${t.title}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${n} ERROR: ${t.title} -- ${msg}`);
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

  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  console.log(`Generating ${TOPICS.length} QUALITY articles with verified pricing data...\n`);
  for (let i = 0; i < TOPICS.length; i++) {
    await generate(groq, cerebras, TOPICS[i], i);
  }
  console.log("\nDone. 30 quality articles written.");
}

main().catch(console.error);
