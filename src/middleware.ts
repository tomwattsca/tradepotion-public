import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Public API routes that should be rate-limited
const RATE_LIMITED_PREFIXES = [
  '/api/search',
  '/api/alerts',
  '/api/coins',
  '/api/trending',
  '/api/gainers',
  '/api/vol-spikes',
  '/api/volume-spikes',
  '/api/new-listings',
  '/api/correlation',
  '/api/chart',
];

// Skip rate limiting for internal/infra routes
const EXEMPT_PREFIXES = ['/api/health', '/api/cron'];

// 60 requests per minute per IP
const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    '127.0.0.1'
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // Skip exempt routes
  if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only rate-limit known public API routes
  if (!RATE_LIMITED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const result = checkRateLimit(ip, RATE_LIMIT, WINDOW_MS);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetMs / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
