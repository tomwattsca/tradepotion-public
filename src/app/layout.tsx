import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import NewsletterSignup from '@/components/NewsletterSignup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Trade Potion',
    default: 'Crypto Price Tracker | Live Bitcoin, Ethereum & Altcoin Prices | Trade Potion',
  },
  description: 'Live crypto prices for 10,000+ coins. Real-time Bitcoin, Ethereum, altcoin tracking with price alerts. View gainers, losers, and market cap rankings.',
  metadataBase: new URL('https://tradepotion.com'),
  // openGraph and twitter are intentionally absent here so page-level metadata
  // is not overridden by layout defaults. Each page sets its own og tags.
  openGraph: {
    siteName: 'Trade Potion',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XHMGHP5MWE"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XHMGHP5MWE');
          `}
        </Script>
                <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Trade Potion',
              description: 'Crypto price tracker with real-time alerts for 10,000+ coins',
              url: 'https://tradepotion.com',
              applicationCategory: 'FinanceApplication',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
                <Navbar />
        {children}
        <footer className="border-t border-zinc-800 mt-12 py-8 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 max-w-md mx-auto">
              <p className="text-sm font-medium text-zinc-300 text-center mb-3">Get crypto market signals in your inbox</p>
              <NewsletterSignup compact />
            </div>
            <p className="text-center text-xs text-zinc-600">
              © {new Date().getFullYear()} Trade Potion. Crypto data via CoinGecko. Not financial advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
