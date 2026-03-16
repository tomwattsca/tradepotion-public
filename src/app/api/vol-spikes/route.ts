import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h_in_currency?: number;
}

async function fetchMarkets(): Promise<CoinGeckoMarket[]> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', '250');
  url.searchParams.set('page', '1');
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '24h');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '250');
  const minVolume = parseInt(searchParams.get('minVol') || '1000000'); // default $1M min vol
  const minMcap = parseInt(searchParams.get('minMcap') || '0');

  try {
    const coins = await fetchMarkets();

    const filtered = coins
      .filter(c => c.total_volume >= minVolume && c.market_cap > 0 && c.market_cap >= minMcap)
      .map(c => ({
        ...c,
        vol_mcap_ratio: c.total_volume / c.market_cap,
        pct: c.price_change_percentage_24h_in_currency ?? 0,
      }))
      .sort((a, b) => b.vol_mcap_ratio - a.vol_mcap_ratio)
      .slice(0, limit);

    return NextResponse.json({
      coins: filtered,
      note: 'Sorted by volume/market-cap ratio — higher ratio = unusual volume spike relative to coin size',
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
