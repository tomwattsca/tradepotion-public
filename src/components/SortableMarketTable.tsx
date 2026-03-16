'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coin } from '@/types';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'price_change_percentage_7d_in_currency' | 'market_cap' | 'total_volume';

interface Props {
  coins: Coin[];
  pageSize?: number;
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 text-zinc-600" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-violet-400" />
    : <ChevronDown className="h-3 w-3 text-violet-400" />;
}

const COLS: { key: SortKey; label: string; align: string }[] = [
  { key: 'market_cap_rank', label: '#', align: 'text-right' },
  { key: 'current_price', label: 'Price', align: 'text-right' },
  { key: 'price_change_percentage_24h', label: '24h %', align: 'text-right' },
  { key: 'price_change_percentage_7d_in_currency', label: '7d %', align: 'text-right' },
  { key: 'market_cap', label: 'Market Cap', align: 'text-right' },
  { key: 'total_volume', label: 'Volume (24h)', align: 'text-right' },
];

const PAGE_SIZE = 50;

export default function SortableMarketTable({ coins, pageSize = PAGE_SIZE }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'market_cap_rank' ? 'asc' : 'desc');
    }
    setPage(0);
  }

  const sorted = useMemo(() => {
    return [...coins].sort((a, b) => {
      const aVal = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bVal = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [coins, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_repeat(5,8rem)] px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
          {COLS.map(col => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={`flex items-center gap-1 hover:text-zinc-300 transition-colors ${col.align} ${col.key === 'market_cap_rank' ? 'justify-end' : 'justify-end'}`}
            >
              {col.label}
              <SortIcon active={sortKey === col.key} dir={sortDir} />
            </button>
          ))}
          <span /> {/* name col — not sortable */}
        </div>

        {/* Header row with Name label */}
        <div className="divide-y divide-zinc-800/40">
          {paginated.map((coin) => {
            const pct24h = coin.price_change_percentage_24h;
            const pct7d = (coin as unknown as Record<string, number | null>).price_change_percentage_7d_in_currency ?? null;
            return (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="grid grid-cols-[2rem_1fr_repeat(5,8rem)] items-center px-4 py-3 hover:bg-zinc-900 transition-colors group"
              >
                <span className="text-xs text-zinc-500 text-right">{coin.market_cap_rank}</span>
                <div className="flex items-center gap-2.5 pl-3 min-w-0">
                  <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{coin.name}</p>
                    <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <span className="text-sm text-right text-white">{formatPrice(coin.current_price)}</span>
                <span className={`text-sm text-right font-medium ${pctColor(pct24h)}`}>{formatPct(pct24h)}</span>
                <span className={`text-sm text-right font-medium ${pct7d != null ? pctColor(pct7d) : 'text-zinc-500'}`}>
                  {pct7d != null ? formatPct(pct7d) : '—'}
                </span>
                <span className="text-sm text-right text-zinc-300">{formatMarketCap(coin.market_cap)}</span>
                <span className="text-sm text-right text-zinc-400">{formatMarketCap(coin.total_volume)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-zinc-400">
          <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  i === page
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {i + 1}
              </button>
            )).slice(Math.max(0, page - 2), page + 3)}
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
