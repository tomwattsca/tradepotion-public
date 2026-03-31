import type { Metadata } from 'next';
import { Mail, BarChart3, Zap, TrendingUp } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'Newsletter — Free Crypto Market Signals & Analysis',
  description:
    'Subscribe to Trade Potion newsletter for daily crypto market signals, weekly roundups, and data-driven analysis. No hype — just alpha.',
  openGraph: {
    title: 'Trade Potion Newsletter — Crypto Market Intelligence',
    description:
      'Daily signals, weekly roundups, and deep-dive crypto analysis delivered to your inbox.',
  },
};

const features = [
  {
    icon: Zap,
    title: 'Daily Market Pulse',
    desc: 'Breakout signals, volume anomalies, and whale movements — weekdays in your inbox.',
  },
  {
    icon: BarChart3,
    title: 'Weekly Trade Roundup',
    desc: 'Top trades, market sentiment recap, and upcoming catalysts every Sunday.',
  },
  {
    icon: TrendingUp,
    title: 'Deep Dives',
    desc: 'On-chain analysis, liquidation maps, and data-driven trade ideas biweekly.',
  },
];

export default function NewsletterPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-950/60 border border-violet-800/40 px-4 py-1.5 mb-4">
          <Mail className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-violet-300">Free newsletter</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Crypto market intelligence,<br />delivered to your inbox
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Data-first analysis, no hype. Every claim backed by a chart or metric.
          Like getting alpha from a smart friend.
        </p>
      </div>

      <div className="mb-10">
        <NewsletterSignup />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <f.icon className="h-5 w-5 text-violet-400 mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">{f.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600 mt-10">
        Unsubscribe anytime. We never share your email.
      </p>
    </main>
  );
}
