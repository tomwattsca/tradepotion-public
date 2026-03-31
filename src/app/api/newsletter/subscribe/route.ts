export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/mailer';
import crypto from 'crypto';

// POST /api/newsletter/subscribe
export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString('hex');

  // Upsert: if already subscribed, reactivate; if new, insert
  const rows = await query<{ id: string; status: string }>(
    `INSERT INTO newsletter_subscribers (email, unsubscribe_token, status)
     VALUES ($1, $2, 'active')
     ON CONFLICT (email) DO UPDATE SET
       status = 'active',
       unsubscribed_at = NULL,
       unsubscribe_token = EXCLUDED.unsubscribe_token
     RETURNING id, status`,
    [email.toLowerCase().trim(), token]
  );

  // Send welcome email (fire-and-forget, don't block response)
  sendWelcomeEmail({ to: email.toLowerCase().trim(), unsubscribeToken: token }).catch((err) =>
    console.error('[newsletter] Failed to send welcome email:', err)
  );

  return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
}
