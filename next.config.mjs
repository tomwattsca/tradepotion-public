import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const LEGACY_PUBLIC_REDIRECTS = [
  // GSC still sees this older category alias. Consolidate it into the
  // canonical CoinGecko category URL rather than serving a duplicate
  // indexable category page with a self-canonical.
  { source: '/category/defi', destination: '/category/decentralized-finance-defi' },
  { source: '/coin/:slug', destination: '/coins/:slug' },
  { source: '/compare', destination: '/compare/bitcoin-vs-ethereum' },
  { source: '/movers/volume-spikes', destination: '/top/vol-spikes' },
  { source: '/defi', destination: '/category/decentralized-finance-defi' },
  { source: '/layer2', destination: '/category/layer-2' },
  { source: '/meme', destination: '/category/meme-token' },
  { source: '/markets', destination: '/' },
];

const nextConfig = {
  async redirects() {
    return LEGACY_PUBLIC_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: true,
    }));
  },
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
