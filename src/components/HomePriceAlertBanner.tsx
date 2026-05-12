'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
}

interface Props {
  topCoins: CoinOption[];
}

export default function HomePriceAlertBanner({ topCoins }: Props) {
  const [email, setEmail] = useState('');
  const [coinId, setCoinId] = useState(topCoins[0]?.id ?? '');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedCoin = topCoins.find((c) => c.id === coinId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          coin_id: coinId,
          target_price: parseFloat(targetPrice),
          direction,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setEmail('');
      setTargetPrice('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to set alert');
    }
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-950/60 to-zinc-900 border border-violet-800/40 p-5 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="h-5 w-5 text-violet-400" />
        <h2 className="text-base font-semibold text-white">Set a Price Alert</h2>
      </div>
      <p className="text-xs text-zinc-400 mb-4">
        Get notified by email when any coin hits your target price.
      </p>

      {status === 'success' ? (
        <div className="rounded-lg bg-emerald-950/60 border border-emerald-700/40 px-4 py-3">
          <p className="text-sm text-emerald-400 font-medium">
            ✓ Alert set! We{"'"} email you when {selectedCoin?.name ?? 'your coin'} goes{' '}
            {direction} your target.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Email */}
          <div className="lg:col-span-1">
            <label className="block text-xs text-zinc-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Coin */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Coin</label>
            <select
              value={coinId}
              onChange={(e) => {
                setCoinId(e.target.value);
                setTargetPrice('');
              }}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors h-[38px]"
            >
              {topCoins.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Target price + direction */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">Target Price (USD)</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={
                  selectedCoin
                    ? selectedCoin.current_price >= 1
                      ? selectedCoin.current_price.toFixed(2)
                      : selectedCoin.current_price.toFixed(6)
                    : '0.00'
                }
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">When</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors h-[38px]"
              >
                <option value="above">Goes above</option>
                <option value="below">Goes below</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div>
            {status === 'error' && (
              <p className="text-xs text-red-400 mb-1">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              data-event="price_alert_click"
              data-cta-location="home_alert_form"
              className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors h-[38px]"
            >
              {status === 'loading' ? 'Setting…' : 'Set Alert'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
