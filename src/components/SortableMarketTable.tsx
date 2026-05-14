'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import CoinImage from '@/components/CoinImage';
import { Coin } from '@/types';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import WatchlistStar from '@/components/WatchlistStar';
import FreshnessBar from '@/components/FreshnessBar';
import Sparkline from '@/components/Sparkline';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_1h_in_currency' | 'price_change_percentage_24h' | 'price_change_percentage_7d_in_currency' | 'market_cap' | 'total_volume' | 'vol_mcap_ratio';

interface Props {
  coins: Coin[];
  pageSize?: number;
  fetchedAt?: number;
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 text-zinc-600" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-violet-400" />
    : <ChevronDown className="h-3 w-3 text-violet-400" />;
}

function volMcapColor(ratio: number): string {
  if (ratio >= 1.0) return 'text-amber-400 font-semibold';
  if (ratio >= 0.5) return 'text-zinc-300';
  return 'text-zinc-500';
}

const PAGE_SIZE = 50;

type CoinWithRatio = Coin & { vol_mcap_ratio: number };

export default function SortableMarketTable({ coins, pageSize = PAGE_SIZE, fetchedAt }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [showVolMcap, setShowVolMcap] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'market_cap_rank' ? 'asc' : 'desc');
    }
    setPage(0);
  }

  const coinsWithRatio: CoinWithRatio[] = useMemo(
    () => coins.map(c => ({ ...c, vol_mcap_ratio: c.market_cap > 0 ? c.total_volume / c.market_cap : 0 })),
    [coins]
  );

  const sorted = useMemo(() => {
    return [...coinsWithRatio].sort((a, b) => {
      const aVal = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bVal = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [coinsWithRatio, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Grid: #, Coin, Price, Sparkline, 24h%, 7d%, Market Cap, Volume, [Vol/MCap]
  const gridCols = showVolMcap
    ? 'grid-cols-[2rem_1fr_7rem_5rem_5rem_6rem_6rem_2.5rem] md:grid-cols-[2rem_1fr_7rem_5rem_5rem_6rem_6rem_8rem_8rem_7rem_2.5rem]'
    : 'grid-cols-[2rem_1fr_7rem_5rem_5rem_6rem_6rem_2.5rem] md:grid-cols-[2rem_1fr_7rem_5rem_5rem_6rem_6rem_8rem_8rem_2.5rem]';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          {fetchedAt && <FreshnessBar fetchedAt={fetchedAt} />}
        </div>
        <button
          onClick={() => setShowVolMcap(v => !v)}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            showVolMcap
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
          title="Shows 24h Volume ÷ Market Cap. Higher = more trading relative to coin size. Useful for spotting unusual activity."
        >
          Vol/MCap Ratio {showVolMcap ? '✓' : ''}
        </button>
      </div>

      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className={`grid ${gridCols} px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500`}>
          <span />
          <span className="pl-3">Coin</span>
          <button onClick={() => handleSort('current_price')} className="flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors">
            Price <SortIcon active={sortKey === 'current_price'} dir={sortDir} />
          </button>
          <span className="text-right text-zinc-600 text-xs pr-1">7D</span>
          <button onClick={() => handleSort('price_change_percentage_1h_in_currency')} className="flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors" title="Price change in the last 1 hour">
            1h % <SortIcon active={sortKey === 'price_change_percentage_1h_in_currency'} dir={sortDir} />
          </button>
          <button onClick={() => handleSort('price_change_percentage_24h')} className="flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors">
            24h % <SortIcon active={sortKey === 'price_change_percentage_24h'} dir={sortDir} />
          </button>
          <button onClick={() => handleSort('price_change_percentage_7d_in_currency')} className="flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors">
            7d % <SortIcon active={sortKey === 'price_change_percentage_7d_in_currency'} dir={sortDir} />
          </button>
          <button onClick={() => handleSort('market_cap')} className="hidden md:flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors">
            Market Cap <SortIcon active={sortKey === 'market_cap'} dir={sortDir} />
          </button>
          <button onClick={() => handleSort('total_volume')} className="hidden md:flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors">
            Volume (24h) <SortIcon active={sortKey === 'total_volume'} dir={sortDir} />
          </button>
          {showVolMcap && (
            <button onClick={() => handleSort('vol_mcap_ratio')} className="flex items-center gap-1 justify-end hover:text-zinc-300 transition-colors" title="24h Volume ÷ Market Cap. A ratio above 0.1 suggests unusually high trading activity for the coin's size.">
              Vol/MCap <SortIcon active={sortKey === 'vol_mcap_ratio'} dir={sortDir} />
            </button>
          )}
          <span title="Watchlist" className="text-center">★</span>
        </div>

        <div className="divide-y divide-zinc-800/40">
          {paginated.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-zinc-300">Market table data is temporarily unavailable.</p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
                CoinGecko data can be rate-limited or delayed. Try search, top-list pages, or check back shortly for refreshed market rows.
              </p>
            </div>
          )}
          {paginated.map((coin, rowIdx) => {
            const pct24h = coin.price_change_percentage_24h;
            const pct1h = coin.price_change_percentage_1h_in_currency ?? null;
            const pct7d = (coin as unknown as Record<string, number | null>).price_change_percentage_7d_in_currency ?? null;
            const sparkPrices = coin.sparkline_in_7d?.price ?? [];
            return (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className={`grid ${gridCols} items-center px-4 py-3 hover:bg-zinc-900 transition-colors group`}
              >
                <span className="text-xs text-zinc-500 text-right">{coin.market_cap_rank ?? (page * pageSize + rowIdx + 1)}</span>
                <div className="flex items-center gap-2.5 pl-3 min-w-0">
                  <CoinImage src={coin.image} alt={coin.name} name={coin.name} symbol={coin.symbol} width={24} height={24} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-violet-200 truncate group-hover:text-violet-300 group-hover:underline transition-colors">{coin.name}</p>
                    <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <span className="text-sm text-right text-white">{formatPrice(coin.current_price)}</span>
                <div className="flex justify-end pr-1">
                  <Sparkline prices={sparkPrices} width={52} height={28} />
                </div>
                <span className={`text-sm text-right font-medium ${pct1h != null ? pctColor(pct1h) : 'text-zinc-500'}`}>
                  {pct1h != null ? formatPct(pct1h) : '—'}
                </span>
                <span className={`text-sm text-right font-medium ${pctColor(pct24h)}`}>{formatPct(pct24h)}</span>
                <span className={`text-sm text-right font-medium ${pct7d != null ? pctColor(pct7d) : 'text-zinc-500'}`}>
                  {pct7d != null ? formatPct(pct7d) : '—'}
                </span>
                <span className="hidden md:block text-sm text-right text-zinc-300">{formatMarketCap(coin.market_cap)}</span>
                <span className="hidden md:block text-sm text-right text-zinc-400">{formatMarketCap(coin.total_volume)}</span>
                {showVolMcap && (
                  <span className={`text-sm text-right ${volMcapColor(coin.vol_mcap_ratio)}`}>
                    {coin.vol_mcap_ratio.toFixed(2)}
                  </span>
                )}
                <div className="flex justify-center">
                  <WatchlistStar coinId={coin.id} coinName={coin.name} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-sm text-zinc-400">
          <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length} coins</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              disabled={page === 0}
              onClick={() => setPage(0)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              «
            </button>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {page > 2 && (
              <>
                <button onClick={() => setPage(0)} className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">1</button>
                {page > 3 && <span className="px-1 text-zinc-600">…</span>}
              </>
            )}
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(i => i >= Math.max(0, page - 2) && i <= Math.min(totalPages - 1, page + 2))
              .map(i => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                    i === page
                      ? 'bg-violet-600 border-violet-600 text-white font-medium'
                      : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            {page < totalPages - 3 && (
              <>
                {page < totalPages - 4 && <span className="px-1 text-zinc-600">…</span>}
                <button onClick={() => setPage(totalPages - 1)} className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">{totalPages}</button>
              </>
            )}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
