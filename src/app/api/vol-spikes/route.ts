import { NextResponse } from 'next/server';
import { getCachedTopCoins, getTopCoins } from '@/lib/coingecko';
import type { Coin } from '@/types';

export const runtime = 'nodejs';

type MarketCoin = Coin & { price_change_percentage_24h_in_currency?: number };

function toVolSpikeCoin(c: Coin) {
  const coin = c as MarketCoin;
  return {
    ...coin,
    vol_mcap_ratio: coin.market_cap > 0 ? coin.total_volume / coin.market_cap : 0,
    pct: coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h ?? 0,
  };
}

async function getVolumeSpikeMarkets(): Promise<{ coins: Coin[]; source: 'coingecko' | 'cached-db' }> {
  try {
    return { coins: await getTopCoins(250), source: 'coingecko' };
  } catch (err) {
    console.warn('[vol-spikes] Serving cached public market snapshot fallback', err);
    return { coins: await getCachedTopCoins(250), source: 'cached-db' };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '250');
  const minVolume = parseInt(searchParams.get('minVol') || '1000000'); // default $1M min vol
  const minMcap = parseInt(searchParams.get('minMcap') || '0');

  try {
    const market = await getVolumeSpikeMarkets();

    const filtered = market.coins
      .filter(c => c.total_volume >= minVolume && c.market_cap > 0 && c.market_cap >= minMcap)
      .map(toVolSpikeCoin)
      .sort((a, b) => b.vol_mcap_ratio - a.vol_mcap_ratio)
      .slice(0, limit);

    return NextResponse.json({
      coins: filtered,
      note: 'Sorted by volume/market-cap ratio — higher ratio = unusual volume spike relative to coin size',
      source: market.source,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
