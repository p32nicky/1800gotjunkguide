"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/articles";

interface CategoryInfo {
  slug: string;
  name: string;
  emoji: string;
  count: number;
}

interface Props {
  articles: ArticleSummary[];
  categories: CategoryInfo[];
}

export default function ArticleList({ articles, categories }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.metaDescription.toLowerCase().includes(query.toLowerCase())
      )
    : articles;

  return (
    <div>
      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="text-sm border border-gray-200 rounded-full px-4 py-1.5 hover:border-green-400 hover:text-green-700 transition-colors"
          >
            {c.emoji} {c.name} <span className="text-gray-400">({c.count})</span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder={`Search ${articles.length} guides...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-5 py-3 mb-8 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
      />

      <h2 className="text-2xl font-bold mb-6">
        {query ? `${filtered.length} results for "${query}"` : `${articles.length} Junk Removal Guides`}
      </h2>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No guides match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 leading-snug mb-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">{article.metaDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
