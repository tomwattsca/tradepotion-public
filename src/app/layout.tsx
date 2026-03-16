import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Trade Potion',
    default: 'Trade Potion — Crypto & Altcoin Tracker',
  },
  description: 'Live prices, charts, and market data for 10,000+ cryptocurrencies. Find your next trade.',
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
                <Navbar />
        {children}
        <footer className="border-t border-zinc-800 mt-12 py-6 px-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Trade Potion. Crypto data via CoinGecko. Not financial advice.
        </footer>
      </body>
    </html>
  );
}
