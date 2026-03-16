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
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
}

// CoinGecko free tier supports price_change_percentage=1h,24h,7d on /coins/markets
async function fetchMarketsWithIntraday(): Promise<CoinGeckoMarket[]> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', '250');
  url.searchParams.set('page', '1');
  url.searchParams.set('sparkline', 'false');
  url.searchParams.set('price_change_percentage', '1h,24h,7d');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  return res.json();
}

function getPctField(coin: CoinGeckoMarket, range: string): number {
  switch (range) {
    case '1h':  return coin.price_change_percentage_1h_in_currency ?? 0;
    case '4h':  return coin.price_change_percentage_1h_in_currency ?? 0; // approximation — CoinGecko doesn't provide 4h natively
    case '24h': return coin.price_change_percentage_24h_in_currency ?? 0;
    case '7d':  return coin.price_change_percentage_7d_in_currency ?? 0;
    default:    return coin.price_change_percentage_24h_in_currency ?? 0;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '24h';
  const type = searchParams.get('type') || 'gainers'; // gainers | losers
  const limit = parseInt(searchParams.get('limit') || '250');
  const minVolume = parseInt(searchParams.get('minVol') || '0');

  try {
    const coins = await fetchMarketsWithIntraday();

    const filtered = coins
      .filter(c => c.total_volume >= minVolume)
      .map(c => ({ ...c, pct: getPctField(c, range) }))
      .filter(c => type === 'gainers' ? c.pct > 0 : c.pct < 0)
      .sort((a, b) => type === 'gainers' ? b.pct - a.pct : a.pct - b.pct)
      .slice(0, limit);

    return NextResponse.json({
      range,
      type,
      coins: filtered,
      note: range === '4h' ? '4h approximated from 1h data (CoinGecko free tier)' : undefined,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
