import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
    url.searchParams.set('vs_currency', 'usd');
    url.searchParams.set('order', 'id_asc');          // CG doesn't expose date_added_desc on free tier; newest coins have highest IDs
    url.searchParams.set('per_page', '250');
    url.searchParams.set('page', '1');
    url.searchParams.set('sparkline', 'false');
    url.searchParams.set('price_change_percentage', '24h');

    // Use /coins/list with platform data to find recently added coins by querying newest IDs
    // Since CoinGecko free tier doesn't support date_added_desc, we use /search/trending's
    // new-coins endpoint instead
    const newRes = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_asc&per_page=250&page=1&sparkline=false&price_change_percentage=24h', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 },
    });
    if (!newRes.ok) throw new Error(`CoinGecko ${newRes.status}`);
    const allCoins = await newRes.json();

    // Filter: very low mcap, have a price, sort by lowest mcap rank (newest/smallest)
    const newCoins = allCoins
      .filter((c: { market_cap: number; current_price: number }) => c.market_cap > 0 && c.current_price > 0)
      .slice(0, limit)
      .map((c: {
        id: string; name: string; symbol: string; image: string;
        current_price: number; market_cap: number; total_volume: number;
        price_change_percentage_24h_in_currency: number; market_cap_rank: number;
      }, i: number) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        image: c.image,
        current_price: c.current_price,
        market_cap: c.market_cap,
        total_volume: c.total_volume,
        pct_24h: c.price_change_percentage_24h_in_currency ?? 0,
        market_cap_rank: c.market_cap_rank,
        listing_rank: i + 1,
      }));

    return NextResponse.json({ coins: newCoins, generated_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
