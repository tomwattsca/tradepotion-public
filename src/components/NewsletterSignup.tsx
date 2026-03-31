'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export default function NewsletterSignup({ compact = false }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to subscribe');
    }
  }

  if (status === 'success') {
    return (
      <div className={compact ? '' : 'rounded-xl bg-gradient-to-br from-violet-950/60 to-zinc-900 border border-violet-800/40 p-5'}>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-emerald-400" />
          <p className="text-sm text-emerald-400 font-medium">
            You{"'"}re in! Check your inbox for a welcome email.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg bg-zinc-900 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 border border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {status === 'loading' ? 'Joining...' : 'Subscribe'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}
      </form>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-950/60 to-zinc-900 border border-violet-800/40 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="h-5 w-5 text-violet-400" />
        <h2 className="text-base font-semibold text-white">Trade Potion Newsletter</h2>
      </div>
      <p className="text-xs text-zinc-400 mb-4">
        Get daily market signals, weekly roundups, and deep-dive crypto analysis. No hype — just data.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-2 text-sm font-medium text-white transition-colors"
        >
          {status === 'loading' ? 'Joining...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
