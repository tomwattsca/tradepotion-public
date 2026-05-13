import { Metadata } from 'next';
import WatchlistClient from './WatchlistClient';

export const metadata: Metadata = {
  title: 'Crypto Watchlist Utility | Trade Potion',
  description: 'Save cryptocurrencies in a browser-based watchlist for repeat checks, then return to live prices, market cap rankings, and price-alert workflows on Trade Potion.',
  alternates: { canonical: 'https://tradepotion.com/watchlist' },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Crypto Watchlist Utility | Trade Potion',
    description: 'A local browser watchlist for tracking crypto markets on Trade Potion. Use it for research, not financial advice.',
    url: 'https://tradepotion.com/watchlist',
    type: 'website',
  },
};

export default function WatchlistPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Crypto Watchlist Utility',
            url: 'https://tradepotion.com/watchlist',
            description: 'A local browser watchlist for repeat crypto market research on Trade Potion.',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Trade Potion',
              url: 'https://tradepotion.com',
            },
          }),
        }}
      />
      <WatchlistClient />
    </>
  );
}
