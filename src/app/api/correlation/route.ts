import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function fetchPrices(coinId: string, days: number): Promise<number[]> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
    { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status} for ${coinId}`);
  const data: { prices: [number, number][] } = await res.json();
  return data.prices.map(p => p[1]);
}

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const x = xs.slice(0, n);
  const y = ys.slice(0, n);
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((s, xi, i) => s + (xi - meanX) * (y[i] - meanY), 0);
  const denomX = Math.sqrt(x.reduce((s, xi) => s + (xi - meanX) ** 2, 0));
  const denomY = Math.sqrt(y.reduce((s, yi) => s + (yi - meanY) ** 2, 0));
  return denomX * denomY === 0 ? 0 : num / (denomX * denomY);
}

function correlationLabel(r: number): string {
  const abs = Math.abs(r);
  const dir = r >= 0 ? 'positive' : 'negative';
  if (abs >= 0.9) return `Strong ${dir} correlation`;
  if (abs >= 0.7) return `Moderate ${dir} correlation`;
  if (abs >= 0.4) return `Weak ${dir} correlation`;
  return 'Little to no correlation';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coinA = searchParams.get('a');
  const coinB = searchParams.get('b');
  const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);

  if (!coinA || !coinB) {
    return NextResponse.json({ error: 'a and b query params required' }, { status: 400 });
  }

  try {
    const [pricesA, pricesB] = await Promise.all([
      fetchPrices(coinA, days),
      fetchPrices(coinB, days),
    ]);

    // Use daily returns (% change) rather than raw prices for more meaningful correlation
    const dailyReturns = (prices: number[]): number[] => prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);

    const returnsA = dailyReturns(pricesA);
    const returnsB = dailyReturns(pricesB);
    const r = pearsonCorrelation(returnsA, returnsB);
    const rRounded = Math.round(r * 100) / 100;

    return NextResponse.json({
      coin_a: coinA,
      coin_b: coinB,
      days,
      correlation: rRounded,
      label: correlationLabel(r),
      data_points: Math.min(returnsA.length, returnsB.length),
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
