import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/alerts — create a price alert
export async function POST(req: NextRequest) {
  let body: { email?: string; coin_id?: string; target_price?: number; direction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, coin_id, target_price, direction } = body;

  if (!email || !coin_id || target_price === undefined || !direction) {
    return NextResponse.json(
      { error: 'Required: email, coin_id, target_price, direction (above|below)' },
      { status: 400 }
    );
  }

  if (!['above', 'below'].includes(direction)) {
    return NextResponse.json({ error: 'direction must be "above" or "below"' }, { status: 400 });
  }

  if (typeof target_price !== 'number' || target_price <= 0) {
    return NextResponse.json({ error: 'target_price must be a positive number' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const rows = await query<{ id: string }>(
    `INSERT INTO price_alerts (email, coin_id, target_price, direction)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, coin_id, target_price, direction]
  );

  return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
}

// GET /api/alerts?email=x — list alerts for an email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email query param required' }, { status: 400 });
  }

  const alerts = await query(
    `SELECT id, coin_id, target_price, direction, triggered, triggered_at, created_at
     FROM price_alerts
     WHERE email = $1
     ORDER BY created_at DESC`,
    [email]
  );

  return NextResponse.json(alerts);
}
