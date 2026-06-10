import { getArticleSummaries } from "@/lib/articles";
import { categorize } from "@/lib/categories";
import type { Metadata } from "next";
import Link from "next/link";

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";
const SITE = "https://junkremovalguide.online";

export const metadata: Metadata = {
  title: "1-800-GOT-JUNK Pricing: Real Costs, Price List & Ways to Save",
  description: "1-800-GOT-JUNK? costs $139-$700+ depending on volume. See the full price list, minimum load cost, what affects pricing, and how to get a discount.",
  alternates: { canonical: "/pricing" },
};

const PRICE_ROWS = [
  { load: "Minimum load (single item)", price: "$139 – $250", example: "One mattress, small sofa, or TV" },
  { load: "1/8 truck", price: "$200 – $300", example: "A few boxes plus a chair or small appliance" },
  { load: "1/4 truck", price: "$280 – $380", example: "Small bedroom cleanout or several large items" },
  { load: "1/2 truck", price: "$370 – $500", example: "Garage corner, large furniture set" },
  { load: "3/4 truck", price: "$450 – $600", example: "Small apartment cleanout" },
  { load: "Full truck", price: "$550 – $700+", example: "Whole-room or estate cleanout" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does 1-800-GOT-JUNK cost?",
      acceptedAnswer: { "@type": "Answer", text: "1-800-GOT-JUNK? pricing is volume-based, ranging from about $139 for a single-item minimum load to $700 or more for a full truck. Exact prices vary by city. The crew gives you a firm, no-obligation quote on arrival before any work starts." },
    },
    {
      "@type": "Question",
      name: "What is the minimum price for 1-800-GOT-JUNK?",
      acceptedAnswer: { "@type": "Answer", text: "The minimum load charge is typically $139-$250 depending on your city. This covers a single large item like a mattress, sofa, or appliance." },
    },
    {
      "@type": "Question",
      name: "Is the 1-800-GOT-JUNK quote free?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. The on-site estimate is free and no-obligation. If you don't like the price, the crew leaves at no charge." },
    },
    {
      "@type": "Question",
      name: "Are there 1-800-GOT-JUNK promo codes or discounts?",
      acceptedAnswer: { "@type": "Answer", text: "1-800-GOT-JUNK? occasionally offers $10-$30 off coupons through local mailers and online booking promotions. Booking online, combining loads with neighbors, and asking the crew about same-day specials are the most reliable ways to save." },
    },
  ],
};

export default function PricingPage() {
  const pricingArticles = getArticleSummaries()
    .filter((a) => categorize(a.title).slug === "pricing")
    .slice(0, 30);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-green-600">Home</Link></li>
            <li>›</li>
            <li className="text-gray-400">Pricing</li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">1-800-GOT-JUNK? Pricing: The Complete Cost Guide</h1>
        <p className="text-lg text-gray-600 mb-8">
          1-800-GOT-JUNK? charges by how much space your junk takes in the truck — typically <strong>$139 for a minimum load</strong> up to <strong>$700+ for a full truck</strong>. Prices vary by city. Here&apos;s the full breakdown.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-10 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-700 font-medium">Exact price for your junk? Only an on-site quote can tell — and it&apos;s free.</p>
          <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors whitespace-nowrap">
            Get Free Quote →
          </a>
        </div>

        <h2 className="text-2xl font-bold mb-4">1-800-GOT-JUNK? Price List (Typical Ranges)</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="text-left px-4 py-3 rounded-tl-lg">Load Size</th>
                <th className="text-left px-4 py-3">Typical Price</th>
                <th className="text-left px-4 py-3 rounded-tr-lg">What Fits</th>
              </tr>
            </thead>
            <tbody>
              {PRICE_ROWS.map((row, i) => (
                <tr key={row.load} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-gray-900 border-b border-gray-100">{row.load}</td>
                  <td className="px-4 py-3 text-green-700 font-bold border-b border-gray-100">{row.price}</td>
                  <td className="px-4 py-3 text-gray-600 border-b border-gray-100">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mb-10">Ranges based on reported customer quotes across US cities. Your local franchise sets exact rates — always confirm with a free on-site estimate.</p>

        <h2 className="text-2xl font-bold mb-4">What Affects Your Price</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-10">
          <li><strong>Volume</strong> — the #1 factor. You pay for truck space used, not time or labor.</li>
          <li><strong>Location</strong> — big metros (NYC, SF, LA) run 15-30% higher than smaller cities.</li>
          <li><strong>Item type</strong> — heavy materials like concrete or dirt may carry surcharges.</li>
          <li><strong>Disposal fees</strong> — mattresses, tires, and some electronics cost extra to dispose of in certain states.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4">5 Ways to Pay Less</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700 mb-10">
          <li>Book online — online booking promos of $10+ off appear regularly.</li>
          <li>Consolidate your junk in one accessible spot (garage or curb) before the crew arrives.</li>
          <li>Combine with a neighbor — splitting a full truck beats two minimum loads.</li>
          <li>Ask about same-day specials when trucks are in your area.</li>
          <li>Donate or sell usable items first — less volume, lower price.</li>
        </ol>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-2xl font-bold mb-3">Get Your Exact Price — Free</h2>
          <p className="mb-6 text-green-100">No-obligation on-site estimate. If you don&apos;t like the price, they leave free of charge.</p>
          <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-colors">
            Book Free Estimate →
          </a>
        </div>

        <h2 className="text-2xl font-bold mb-4">Pricing FAQs</h2>
        <div className="space-y-6 mb-12">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">How much does 1-800-GOT-JUNK cost?</h3>
            <p className="text-gray-700">From about $139 (minimum load) to $700+ (full truck), depending on volume and city.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">What is the minimum charge?</h3>
            <p className="text-gray-700">Typically $139-$250 — covers a single large item like a sofa or mattress.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Is the quote really free?</h3>
            <p className="text-gray-700">Yes. The crew quotes on arrival; you can decline at no cost.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Do promo codes exist?</h3>
            <p className="text-gray-700">Occasionally — $10-$30 off via online booking promos and local mailers.</p>
          </div>
        </div>

        {pricingArticles.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">More Pricing Guides</h2>
            <div className="grid gap-3 sm:grid-cols-2 mb-8">
              {pricingArticles.map((a) => (
                <Link key={a.slug} href={`/articles/${a.slug}`}
                  className="block p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group">
                  <p className="font-medium text-sm text-gray-900 group-hover:text-green-600 leading-snug">{a.title}</p>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link href="/category/pricing" className="text-green-700 font-semibold hover:underline">
                See all pricing guides →
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
