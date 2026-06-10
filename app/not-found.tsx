import Link from "next/link";
import { getArticleSummaries } from "@/lib/articles";

export default function NotFound() {
  const popular = getArticleSummaries().slice(0, 6);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">🗑️</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-600 mb-8">Looks like this page got hauled away. Try one of these guides instead:</p>

      <div className="grid gap-3 sm:grid-cols-2 text-left mb-10">
        {popular.map((a) => (
          <Link key={a.slug} href={`/articles/${a.slug}`}
            className="block p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group">
            <p className="font-medium text-sm text-gray-900 group-hover:text-green-600 leading-snug">{a.title}</p>
          </Link>
        ))}
      </div>

      <Link href="/" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-full transition-colors">
        Browse All Guides →
      </Link>
    </div>
  );
}
