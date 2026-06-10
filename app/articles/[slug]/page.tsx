import { getArticleBySlug, getAllSlugs, getArticleSummaries } from "@/lib/articles";
import { categorize } from "@/lib/categories";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

function getRelated(slug: string, title: string, count = 6) {
  const all = getArticleSummaries().filter((a) => a.slug !== slug);
  const cat = categorize(title).slug;
  const sameCat = all.filter((a) => categorize(a.title).slug === cat);
  const pool = sameCat.length >= count ? sameCat : all;
  // deterministic shuffle seeded by slug — stable across builds
  const seed = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return [...pool]
    .sort((a, b) => ((seed * 31 + a.slug.length) % 97) - ((seed * 31 + b.slug.length + 1) % 97))
    .slice(0, count);
}

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";
const SITE = "https://junkremovalguide.online";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    openGraph: { title: article.title, description: article.metaDescription, type: "article" },
    alternates: { canonical: `/articles/${slug}` },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const related = getRelated(slug, article.title);

  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: article.title, description: article.metaDescription,
    keywords: article.keywords.join(", "),
    datePublished: article.generatedAt, dateModified: article.generatedAt,
    author: { "@type": "Organization", name: "GotJunk Guide", url: SITE },
    publisher: { "@type": "Organization", name: "GotJunk Guide", url: SITE },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/articles/${slug}` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: article.title, item: `${SITE}/articles/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-green-600">Home</a></li>
            <li>›</li>
            <li className="text-gray-400">{article.title}</li>
          </ol>
        </nav>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-700 font-medium">Get a free, no-obligation junk removal quote today.</p>
          <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors whitespace-nowrap">
            Get Free Quote →
          </a>
        </div>

        <article
          className="prose prose-gray prose-headings:font-bold prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline max-w-none"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        <div className="mt-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Clear the Clutter?</h2>
          <p className="mb-6 text-green-100">Get a free, no-obligation estimate from 1-800-GOT-JUNK? They haul it all away — you just point.</p>
          <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-colors">
            Book Free Estimate →
          </a>
          <p className="text-xs text-green-200 mt-3">Free quote. No obligation. Same-day service available.</p>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Guides</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <a key={r.slug} href={`/articles/${r.slug}`}
                  className="block p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group">
                  <p className="font-medium text-sm text-gray-900 group-hover:text-green-600 leading-snug">{r.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">← All junk removal guides</a>
        </div>
      </div>
    </>
  );
}
