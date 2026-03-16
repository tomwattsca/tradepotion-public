import Link from 'next/link';
import Image from 'next/image';
import { Coin } from '@/types';
import { formatPrice, formatMarketCap, formatPct, pctColor } from '@/lib/utils';

interface Props {
  coin: Coin;
  rank?: number;
}

export default function CoinRow({ coin, rank }: Props) {
  const pct = coin.price_change_percentage_24h;

  return (
    <Link
      href={`/coins/${coin.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors rounded-lg group"
    >
      {rank !== undefined && (
        <span className="w-6 text-right text-xs text-zinc-500 shrink-0">{rank}</span>
      )}
      <Image
        src={coin.image}
        alt={coin.name}
        width={28}
        height={28}
        className="rounded-full shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
          {coin.name}
        </p>
        <p className="text-xs text-zinc-500 uppercase">{coin.symbol}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-white">{formatPrice(coin.current_price)}</p>
        <p className={`text-xs font-medium ${pctColor(pct)}`}>{formatPct(pct)}</p>
      </div>
      <div className="hidden sm:block text-right shrink-0 w-24">
        <p className="text-xs text-zinc-400">{formatMarketCap(coin.market_cap)}</p>
        <p className="text-xs text-zinc-600">mkt cap</p>
      </div>
    </Link>
  );
}
