import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "How to reach Junk Removal Guide about corrections, pricing updates, questions, or partnerships.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Contact Junk Removal Guide</h1>

      <p className="mb-4 text-gray-700">
        We&apos;re an independent site covering junk removal pricing, company comparisons, and disposal guides. If
        you&apos;ve spotted something wrong, want to suggest a topic, or just have a question, we read everything that
        comes in.
      </p>

      <h2 className="text-xl font-bold mb-3 mt-8">Email</h2>
      <p className="mb-4 text-gray-700">
        The fastest way to reach us is{" "}
        <a href="mailto:nickdavies100@gmail.com" className="text-green-600 hover:underline">
          nickdavies100@gmail.com
        </a>
        . We usually reply within a few business days.
      </p>

      <h2 className="text-xl font-bold mb-3 mt-8">Corrections and Pricing Updates</h2>
      <p className="mb-4 text-gray-700">
        Junk removal pricing moves, and franchise policies differ by market. We&apos;d much rather be corrected than be
        wrong. If a price range, policy, or service detail on the site is out of date, send us the page URL and what
        needs changing and we&apos;ll update it.
      </p>

      <h2 className="text-xl font-bold mb-3 mt-8">Editorial and Advertising</h2>
      <p className="mb-4 text-gray-700">
        We earn affiliate commission on some links and run advertising on the site. Neither buys coverage or changes
        what we recommend — when a competitor or a free option is the better answer, we say so. See our{" "}
        <Link href="/affiliate-disclosure" className="text-green-600 hover:underline">
          Affiliate Disclosure
        </Link>{" "}
        for the details.
      </p>

      <h2 className="text-xl font-bold mb-3 mt-8">What We Can&apos;t Help With</h2>
      <p className="mb-4 text-gray-700">
        We&apos;re a publication, not a junk removal company. We are not affiliated with or endorsed by
        1-800-GOT-JUNK?, LoadUp, Junk King, College Hunks, or Junkluggers, and we can&apos;t book, reschedule, or
        cancel a pickup, issue a refund, or resolve a complaint about a job. For anything to do with an actual booking,
        please contact that company directly.
      </p>

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
          ← All junk removal guides
        </Link>
      </div>
    </div>
  );
}
