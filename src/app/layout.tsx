import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Trade Potion',
    default: 'Crypto Market Snapshot Tracker | Bitcoin, Ethereum & Altcoin Prices | Trade Potion',
  },
  description: 'Track CoinGecko crypto market snapshots for Bitcoin, Ethereum, altcoins, watchlists, and informational price alerts. Prices can lag exchange quotes; no financial advice.',
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
                  page_location: window.location.pathname,
                  transport_type: 'beacon'
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
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://tradepotion.com/#organization',
                  name: 'Trade Potion',
                  url: 'https://tradepotion.com',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://tradepotion.com/#website',
                  name: 'Trade Potion',
                  url: 'https://tradepotion.com',
                  publisher: { '@id': 'https://tradepotion.com/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://tradepotion.com/search?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
                <Navbar />
        {children}
        <footer className="border-t border-zinc-800 mt-12 px-4 py-6 text-center text-xs leading-5 text-zinc-500">
          <p>© {new Date().getFullYear()} Trade Potion. Crypto market snapshots via CoinGecko. Informational only; not financial advice.</p>
          <p className="mt-1 text-zinc-600">Public tools do not require a wallet connection. Verify prices, venue access, and regional rules independently.</p>
        </footer>
      </body>
    </html>
  );
}
