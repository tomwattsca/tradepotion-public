export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/newsletter/unsubscribe?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing unsubscribe token.', { status: 400 });
  }

  const rows = await query<{ id: string }>(
    `UPDATE newsletter_subscribers
     SET status = 'unsubscribed', unsubscribed_at = NOW()
     WHERE unsubscribe_token = $1 AND status = 'active'
     RETURNING id`,
    [token]
  );

  if (rows.length === 0) {
    return new NextResponse(unsubscribePage('Already unsubscribed or invalid link.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse(unsubscribePage('You have been unsubscribed from Trade Potion newsletter.'), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

function unsubscribePage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — Trade Potion</title>
<style>body{font-family:system-ui,sans-serif;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{text-align:center;max-width:400px;padding:2rem}h1{font-size:1.25rem;margin-bottom:.5rem}p{color:#a1a1aa;font-size:.875rem}
a{color:#8b5cf6;text-decoration:none}</style></head>
<body><div class="card"><h1>${message}</h1><p><a href="https://tradepotion.com">Back to Trade Potion</a></p></div></body></html>`;
}
