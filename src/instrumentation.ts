export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const CRON_SECRET = process.env.CRON_SECRET || '';

    // Use Railway's internal networking for self-calls (avoids external roundtrip)
    const BASE_URL = process.env.RAILWAY_PRIVATE_DOMAIN
      ? `http://${process.env.RAILWAY_PRIVATE_DOMAIN}:${process.env.PORT || 3000}`
      : `http://localhost:${process.env.PORT || 3000}`;

    cron.schedule('*/10 * * * *', async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cron/poll`, {
          headers: { 'x-cron-secret': CRON_SECRET },
        });
        const body = await res.json().catch(() => ({}));
        console.log(`[cron] poll ${res.status}`, JSON.stringify(body));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[cron] poll error:`, msg);
      }
    });

    console.log(`[cron] Price polling scheduled — */10 * * * * → ${BASE_URL}/api/cron/poll`);
  }
}
