'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

interface Props {
  coinId: string;
  coinName: string;
  currentPrice: number;
}

export default function PriceAlertForm({ coinId, coinName, currentPrice }: Props) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-zinc-300">Price Alert</h3>
      </div>

      {status === 'success' ? (
        <p className="text-sm text-green-400">
          ✓ Alert set! We&apos;ll email you when {coinName} goes {direction} your target.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
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
                placeholder={currentPrice.toFixed(2)}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors h-[38px]"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {status === 'loading' ? 'Setting alert…' : 'Set Alert'}
          </button>
        </form>
      )}
    </div>
  );
}
