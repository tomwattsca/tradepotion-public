import { getGlobalMarketData } from '@/lib/coingecko';
import { formatMarketCap, formatPct, pctColor } from '@/lib/utils';

export default async function MarketStatsBar() {
  let data;
  try {
    data = await getGlobalMarketData();
  } catch {
    return null; // silent fail — don't break the page
  }

  const mcap = data.total_market_cap.usd;
  const vol = data.total_volume.usd;
  const btcDom = data.market_cap_percentage.btc;
  const ethDom = data.market_cap_percentage.eth;
  const mcapChange = data.market_cap_change_percentage_24h_usd;

  return (
    <div className="border-b border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center gap-5 overflow-x-auto whitespace-nowrap scrollbar-none">
        <span>
          Market Cap:{' '}
          <span className="text-white font-medium">{formatMarketCap(mcap)}</span>
          {mcapChange !== undefined && (
            <span className={`ml-1 ${pctColor(mcapChange)}`}>{formatPct(mcapChange)}</span>
          )}
        </span>
        <span className="text-zinc-700">|</span>
        <span>
          24h Vol: <span className="text-white font-medium">{formatMarketCap(vol)}</span>
        </span>
        <span className="text-zinc-700">|</span>
        <span>
          BTC Dom: <span className="text-white font-medium">{btcDom.toFixed(1)}%</span>
        </span>
        <span className="text-zinc-700">|</span>
        <span>
          ETH Dom: <span className="text-white font-medium">{ethDom.toFixed(1)}%</span>
        </span>
        <span className="text-zinc-700">|</span>
        <span>
          Coins: <span className="text-white font-medium">{data.active_cryptocurrencies.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}
