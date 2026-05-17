import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for 1800GotJunk Guide.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
      <h1>Privacy Policy</h1>
      <p>Last updated: May 2026</p>

      <h2>Information We Collect</h2>
      <p>We use Google Analytics to collect anonymous usage data (pages visited, time on site, general location). No personally identifiable information is collected unless you contact us directly.</p>

      <h2>Cookies</h2>
      <p>Google Analytics uses cookies to track site usage. You can disable cookies in your browser settings at any time.</p>

      <h2>Third-Party Links</h2>
      <p>This site contains links to third-party websites including affiliate partners. We are not responsible for their privacy practices. Please review their policies before making a purchase.</p>

      <h2>Affiliate Tracking</h2>
      <p>When you click affiliate links, our partner companies may set cookies to track referrals. See our <a href="/affiliate-disclosure">Affiliate Disclosure</a> for more details.</p>

      <h2>Contact</h2>
      <p>For privacy questions, email <a href="mailto:nickdavies100@gmail.com">nickdavies100@gmail.com</a>.</p>
    </div>
  );
}
