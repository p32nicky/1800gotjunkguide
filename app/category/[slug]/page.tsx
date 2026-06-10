import { getArticleSummaries } from "@/lib/articles";
import { CATEGORIES, categorize, getCategoryBySlug } from "@/lib/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — 1-800-GOT-JUNK? Guides`,
    description: category.description,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = getArticleSummaries().filter((a) => categorize(a.title).slug === slug);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-green-600">Home</Link></li>
          <li>›</li>
          <li className="text-gray-400">{category.name}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {category.emoji} {category.name}
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">{category.description}</p>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-700 font-medium">Ready to get rid of your junk? Get a free quote in minutes.</p>
        <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors whitespace-nowrap">
          Get Free Quote →
        </a>
      </div>

      <h2 className="text-xl font-bold mb-6">{articles.length} guides in this category</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.slug} href={`/articles/${article.slug}`}
            className="block p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group">
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 leading-snug mb-2">{article.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{article.metaDescription}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">← All junk removal guides</Link>
      </div>
    </div>
  );
}
