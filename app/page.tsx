import { getAllArticles } from "@/lib/articles";
import type { Metadata } from "next";
import Link from "next/link";

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";

export const metadata: Metadata = {
  title: "1-800-GOT-JUNK? Reviews, Pricing & Junk Removal Guides",
  description: "500+ honest guides about 1-800-GOT-JUNK? — pricing, reviews, what they take, comparisons, and tips to save money on junk removal.",
};

export default function HomePage() {
  const articles = getAllArticles();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">The Complete 1-800-GOT-JUNK? Resource</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Honest reviews, real pricing, and expert guides for 1-800-GOT-JUNK? — America's #1 junk removal service.
        </p>
        <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors">
          Get Your Free Quote →
        </a>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-12 text-center">
        <h2 className="text-2xl font-bold mb-3">What Is 1-800-GOT-JUNK?</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-4">
          1-800-GOT-JUNK? is North America's largest junk removal service, operating in hundreds of cities. They haul away almost anything — furniture, appliances, electronics, yard waste, and more. You point, they haul.
        </p>
        <a href={AFFILIATE} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
          Book a Free Estimate →
        </a>
      </div>

      <h2 className="text-2xl font-bold mb-6">
        {articles.length > 0 ? `${articles.length} Junk Removal Guides` : "Guides Loading..."}
      </h2>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Articles are being generated. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`}
              className="block p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 leading-snug mb-2">{article.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{article.metaDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
