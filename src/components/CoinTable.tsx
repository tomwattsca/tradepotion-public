'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coin } from '@/types';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'price_change_percentage_7d_in_currency' | 'market_cap' | 'total_volume';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

interface Props {
  coins: Coin[];
}

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-violet-400" />
    : <ChevronDown className="h-3 w-3 text-violet-400" />;
}

export default function CoinTable({ coins }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'market_cap_rank' ? 'asc' : 'desc');
    }
    setPage(0);
  }

  const sorted = useMemo(() => {
    return [...coins].sort((a, b) => {
      const av = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bv = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [coins, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const Col = ({ label, col, className = '' }: { label: string; col: SortKey; className?: string }) => (
    <th
      className={`px-4 py-2 text-left text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon col={col} sortKey={sortKey} dir={sortDir} />
      </span>
    </th>
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <Col label="#" col="market_cap_rank" className="w-12" />
              <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 w-48">Coin</th>
              <Col label="Price" col="current_price" className="text-right" />
              <Col label="24h %" col="price_change_percentage_24h" className="text-right" />
              <Col label="7d %" col="price_change_percentage_7d_in_currency" className="text-right hidden sm:table-cell" />
              <Col label="Market Cap" col="market_cap" className="text-right hidden md:table-cell" />
              <Col label="Volume (24h)" col="total_volume" className="text-right hidden lg:table-cell" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {paginated.map((coin) => {
              const pct24 = coin.price_change_percentage_24h;
              const pct7d = (coin as unknown as Record<string, number | undefined>).price_change_percentage_7d_in_currency;
              return (
                <tr key={coin.id} className="hover:bg-zinc-900 transition-colors group">
                  <td className="px-4 py-3 text-xs text-zinc-500 w-12">{coin.market_cap_rank}</td>
                  <td className="px-4 py-3">
                    <Link href={`/coins/${coin.id}`} className="flex items-center gap-2 group-hover:text-violet-300 transition-colors">
                      <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate max-w-[130px]">{coin.name}</p>
                        <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">{formatPrice(coin.current_price)}</td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${pctColor(pct24)}`}>{formatPct(pct24)}</td>
                  <td className={`px-4 py-3 text-right text-xs font-medium hidden sm:table-cell ${pct7d !== undefined ? pctColor(pct7d) : 'text-zinc-500'}`}>
                    {pct7d !== undefined ? formatPct(pct7d) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-zinc-400 hidden md:table-cell">{formatMarketCap(coin.market_cap)}</td>
                  <td className="px-4 py-3 text-right text-xs text-zinc-400 hidden lg:table-cell">{formatMarketCap(coin.total_volume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  i === page ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
