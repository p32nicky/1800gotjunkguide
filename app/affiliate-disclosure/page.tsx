import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Affiliate disclosure for 1800GotJunk Guide.",
};

export default function AffiliatDisclosure() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1>Affiliate Disclosure</h1>
      <p>
        1800GotJunk Guide is a participant in affiliate advertising programs. When you click links on this site and make a purchase or booking, we may earn a commission at <strong>no extra cost to you</strong>.
      </p>
      <h2>How It Works</h2>
      <p>
        Some links on this site are affiliate links. If you click one and complete a booking or purchase, the company pays us a small referral fee. This helps us keep the site free and fund our research.
      </p>
      <h2>Our Promise</h2>
      <p>
        Affiliate relationships never influence our reviews or recommendations. We only recommend services we believe provide genuine value. Our editorial opinions are our own.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email us at <a href="mailto:nickdavies100@gmail.com">nickdavies100@gmail.com</a>.</p>
    </div>
  );
}
