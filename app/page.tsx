import { getArticleSummaries } from "@/lib/articles";
import { CATEGORIES, categorize } from "@/lib/categories";
import type { Metadata } from "next";
import ArticleList from "@/app/components/ArticleList";

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";

export const metadata: Metadata = {
  title: "1-800-GOT-JUNK? Reviews, Pricing & Junk Removal Guides",
  description: "400+ honest guides about 1-800-GOT-JUNK? — pricing, reviews, what they take, comparisons, and tips to save money on junk removal.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Junk Removal Guide",
  url: "https://junkremovalguide.online",
  description: "Honest reviews, pricing guides, and tips for 1-800-GOT-JUNK? junk removal service.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://junkremovalguide.online/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Junk Removal Guide",
  url: "https://junkremovalguide.online",
};

export default function HomePage() {
  const articles = getArticleSummaries();
  const categories = CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    emoji: c.emoji,
    count: articles.filter((a) => categorize(a.title).slug === c.slug).length,
  })).filter((c) => c.count > 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">The Complete 1-800-GOT-JUNK? Resource</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Honest reviews, real pricing, and expert guides for 1-800-GOT-JUNK? — America&apos;s #1 junk removal service.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors">
              Get Your Free Quote →
            </a>
            <a href="/pricing"
              className="inline-block border-2 border-green-600 text-green-700 hover:bg-green-50 font-bold px-8 py-3 rounded-full text-lg transition-colors">
              See Pricing Guide
            </a>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-3">What Is 1-800-GOT-JUNK?</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-4">
            1-800-GOT-JUNK? is North America&apos;s largest junk removal service, operating in hundreds of cities. They haul away almost anything — furniture, appliances, electronics, yard waste, and more. You point, they haul.
          </p>
          <a href={AFFILIATE} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
            Book a Free Estimate →
          </a>
        </div>

        <ArticleList articles={articles} categories={categories} />
      </div>
    </>
  );
}
