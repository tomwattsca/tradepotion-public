import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
    data?: {
      price: number;
      price_change_percentage_24h?: { usd?: number };
      market_cap: string;
      total_volume: string;
    };
  };
}

export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();

    const coins = (data.coins as TrendingCoin[]).map((entry, i) => ({
      id: entry.item.id,
      name: entry.item.name,
      symbol: entry.item.symbol.toLowerCase(),
      image: entry.item.large || entry.item.thumb,
      rank: entry.item.market_cap_rank,
      trending_rank: i + 1,
      price_btc: entry.item.price_btc,
      price_usd: entry.item.data?.price ?? null,
      pct_24h: entry.item.data?.price_change_percentage_24h?.usd ?? null,
      market_cap: entry.item.data?.market_cap ?? null,
      total_volume: entry.item.data?.total_volume ?? null,
    }));

    return NextResponse.json({ coins, generated_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
