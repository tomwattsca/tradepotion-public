import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'fail'> = {};

  try {
    await query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'fail';
  }

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks },
    { status: healthy ? 200 : 503 }
  );
}
