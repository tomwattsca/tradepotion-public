import { NextResponse } from 'next/server';

export function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = '/api/vol-spikes';
  return NextResponse.redirect(url.toString(), 308);
}
