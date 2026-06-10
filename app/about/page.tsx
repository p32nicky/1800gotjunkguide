import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who's behind Junk Removal Guide — how we research junk removal pricing, reviews, and guides, and how this site makes money.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">About Junk Removal Guide</h1>
      <p className="mb-4 text-gray-700">
        Junk Removal Guide is an independent resource for anyone trying to get rid of stuff — from a single old couch to an entire estate cleanout. We publish detailed guides on junk removal pricing, what companies will and won&apos;t take, eco-friendly disposal, and comparisons between major services like 1-800-GOT-JUNK?, LoadUp, and Junk King.
      </p>
      <h2 className="text-xl font-bold mb-3 mt-8">How We Research</h2>
      <p className="mb-4 text-gray-700">
        Our guides draw on published pricing data, customer review platforms (BBB, Trustpilot, Google, Yelp), company policy pages, and reported quotes from real customers across US cities. Junk removal pricing varies by location and load, so we present typical ranges and always recommend confirming with a free on-site estimate.
      </p>
      <h2 className="text-xl font-bold mb-3 mt-8">How This Site Makes Money</h2>
      <p className="mb-4 text-gray-700">
        We&apos;re reader-supported. When you request a quote or book a service through links on this site, we may earn a referral commission at no extra cost to you. This never changes our editorial opinions — see our <Link href="/affiliate-disclosure" className="text-green-700 underline">affiliate disclosure</Link> for details.
      </p>
      <h2 className="text-xl font-bold mb-3 mt-8">What We Are Not</h2>
      <p className="mb-4 text-gray-700">
        We are not 1-800-GOT-JUNK? and we&apos;re not affiliated with or endorsed by them. We&apos;re an independent review and information site. For official bookings, pricing, and service questions, always confirm directly with the company.
      </p>
      <h2 className="text-xl font-bold mb-3 mt-8">Contact</h2>
      <p className="mb-4 text-gray-700">
        Questions, corrections, or feedback? Email <a href="mailto:nickdavies100@gmail.com" className="text-green-700 underline">nickdavies100@gmail.com</a>.
      </p>
    </div>
  );
}
