import { NextRequest, NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db';
import { searchCoins } from '@/lib/coingecko';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

async function searchCachedCoins(q: string): Promise<SearchResult[]> {
  const term = `%${q.trim().toLowerCase()}%`;
  return dbQuery<SearchResult>(
    `
      SELECT
        c.slug AS id,
        c.name,
        c.symbol,
        COALESCE(c.image_url, '/favicon.ico') AS thumb,
        NULL::integer AS market_cap_rank
      FROM coins c
      WHERE LOWER(c.name) LIKE $1
         OR LOWER(c.symbol) LIKE $1
         OR LOWER(c.slug) LIKE $1
      ORDER BY
        CASE
          WHEN LOWER(c.symbol) = LOWER($2) THEN 0
          WHEN LOWER(c.slug) = LOWER($2) THEN 1
          WHEN LOWER(c.name) = LOWER($2) THEN 2
          WHEN LOWER(c.name) LIKE LOWER($2) || '%' THEN 3
          ELSE 4
        END,
        c.name ASC
      LIMIT 20
    `,
    [term, q.trim()]
  );
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json([]);

  try {
    const results = await searchCoins(q);
    return NextResponse.json(results);
  } catch {
    try {
      const cachedResults = await searchCachedCoins(q);
      return NextResponse.json(cachedResults, {
        headers: { 'x-tradepotion-search-source': 'cached-db' },
      });
    } catch {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
  }
}
