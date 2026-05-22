import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const SITE_URL = "https://junkremovalguide.online";
const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";

export const metadata: Metadata = {
  title: { default: "1-800-GOT-JUNK? Reviews, Pricing & Guides", template: "%s | 1800GotJunk Guide" },
  description: "Everything you need to know about 1-800-GOT-JUNK? — honest reviews, pricing, comparisons, and junk removal guides.",
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "1800GotJunk Guide", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: "rExqKrlIUHf3C8lAuDKtsLeQVUqIIZ_IaHXKvClNwrQ" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-92EGLRQFMM"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-92EGLRQFMM');` }} />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg text-green-600 hover:text-green-700">🚛 GotJunk Guide</a>
            <a href={AFFILIATE} target="_blank" rel="noopener noreferrer"
              className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full transition-colors">
              Get Free Quote →
            </a>
          </div>
        </header>
        <div className="bg-green-50 border-b border-green-200 text-center text-xs text-green-800 py-2 px-4">
          <strong>Affiliate Disclosure:</strong> We may earn a commission when you book through our links, at no extra cost to you.
        </div>
        <main>{children}</main>
        <footer className="border-t border-gray-100 mt-16 py-8 text-center text-sm text-gray-500">
          <p>GotJunk Guide is an independent review site. We may earn a commission when you use our links.</p>
          <p className="mt-2 flex items-center justify-center gap-4">
            <a href="/" className="underline hover:text-gray-700">All Guides</a>
            <a href="/affiliate-disclosure" className="underline hover:text-gray-700">Affiliate Disclosure</a>
            <a href="/privacy-policy" className="underline hover:text-gray-700">Privacy Policy</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
