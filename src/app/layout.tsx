import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';

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
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', 'G-XHMGHP5MWE', { anonymize_ip: true });
          `}
        </Script>
        <Script id="delegated-event-tracking" strategy="afterInteractive">
          {`
            (function () {
              var allowedEvents = {
                price_alert_click: true,
                exchange_outbound_click: true,
                internal_link_click: true,
                filter_change: true
              };

              function getSameSiteLinkUrl(element) {
                var anchor = element.closest && element.closest('a[href]');
                if (!anchor) return undefined;
                try {
                  var url = new URL(anchor.href, window.location.href);
                  if (url.origin !== window.location.origin) return undefined;
                  return url.pathname + url.search + url.hash;
                } catch (error) {
                  return undefined;
                }
              }

              function cleanValue(value) {
                if (!value) return undefined;
                if (/@/.test(value)) return undefined;
                return String(value).slice(0, 120);
              }

              document.addEventListener('click', function (event) {
                var target = event.target && event.target.closest
                  ? event.target.closest('[data-event]')
                  : null;
                if (!target) return;

                var eventName = target.getAttribute('data-event');
                if (!eventName || !allowedEvents[eventName]) return;
                if (typeof window.gtag !== 'function') return;

                var params = {
                  cta_location: cleanValue(target.getAttribute('data-cta-location')),
                  coin_id: cleanValue(target.getAttribute('data-coin-id')),
                  coin_symbol: cleanValue(target.getAttribute('data-coin-symbol')),
                  exchange_name: cleanValue(target.getAttribute('data-exchange-name')),
                  page_type: cleanValue(target.getAttribute('data-page-type')),
                  sponsored: cleanValue(target.getAttribute('data-sponsored')),
                  filter_name: cleanValue(target.getAttribute('data-filter-name')),
                  filter_action: cleanValue(target.getAttribute('data-filter-action')),
                  filter_value: cleanValue(target.getAttribute('data-filter-value')),
                  link_url: cleanValue(getSameSiteLinkUrl(target)),
                  page_location: window.location.pathname
                };

                Object.keys(params).forEach(function (key) {
                  if (params[key] === undefined) delete params[key];
                });

                window.gtag('event', eventName, params);
              }, { capture: true });
            })();
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
        <footer className="border-t border-zinc-800 mt-12 py-6 px-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Trade Potion. Crypto data via CoinGecko. Not financial advice.
        </footer>
      </body>
    </html>
  );
}
