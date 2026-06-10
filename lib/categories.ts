export interface Category {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  matcher: RegExp;
}

// Order matters — first match wins
export const CATEGORIES: Category[] = [
  {
    slug: "pricing",
    name: "Pricing & Costs",
    emoji: "💰",
    description: "How much 1-800-GOT-JUNK? costs — real prices, discounts, promo codes, and ways to save.",
    matcher: /pricing|cost|price|charge|expensive|cheap|discount|promo|coupon|deal|fee|rate|free quote|estimate/i,
  },
  {
    slug: "cities",
    name: "City Guides",
    emoji: "📍",
    description: "1-800-GOT-JUNK? service, pricing, and availability in cities across the US.",
    matcher: / in [A-Z]|new york|los angeles|chicago|houston|phoenix|philadelphia|dallas|san diego|san jose|austin|jacksonville|seattle|denver|boston|nashville|miami|atlanta|portland|las vegas|detroit|memphis|baltimore|louisville|oklahoma|columbus|charlotte|san francisco|fort worth|indianapolis|minneapolis|tampa|orlando|pittsburgh|st louis|kansas city|salt lake|sacramento|raleigh|richmond/i,
  },
  {
    slug: "what-they-take",
    name: "What They Take",
    emoji: "📦",
    description: "What 1-800-GOT-JUNK? will and won't haul away — appliances, electronics, furniture, and more.",
    matcher: /does 1-800|will junk removal|what does.*take|won't take|not take/i,
  },
  {
    slug: "comparisons",
    name: "Comparisons & Reviews",
    emoji: "⚖️",
    description: "1-800-GOT-JUNK? vs LoadUp, Junk King, College Hunks, and other junk removal services.",
    matcher: / vs |loadup|junk king|college hunks|junkluggers|trash gators|review|alternative|compared|ranking|legit|complaints|better business/i,
  },
  {
    slug: "recycling",
    name: "Recycling & Donation",
    emoji: "♻️",
    description: "Eco-friendly junk disposal — recycling, donations, e-waste, and sustainability.",
    matcher: /recycl|eco|e-waste|donat|sustain|green|environment|zero waste/i,
  },
  {
    slug: "how-to",
    name: "How-To Guides",
    emoji: "🔧",
    description: "Step-by-step guides for getting rid of junk — from old sofas to entire house cleanouts.",
    matcher: /how to|how do|step by step|guide to/i,
  },
  {
    slug: "tips",
    name: "Tips & FAQ",
    emoji: "💡",
    description: "Junk removal tips, decluttering advice, and answers to common questions.",
    matcher: /./,
  },
];

export function categorize(title: string): Category {
  return CATEGORIES.find((c) => c.matcher.test(title)) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
