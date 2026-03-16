export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = (await import('node-cron')).default;
    const CRON_SECRET = process.env.CRON_SECRET || '';
    const PORT = process.env.PORT || '3000';
    const BASE_URL = `http://localhost:${PORT}`;

    cron.schedule('*/10 * * * *', async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cron/poll`, {
          headers: { 'x-cron-secret': CRON_SECRET },
        });
        const body = await res.json().catch(() => ({}));
        console.log(`[cron] poll ${res.status}`, JSON.stringify(body));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[cron] poll error:', msg);
      }
    });

    console.log(`[cron] Price polling scheduled — */10 * * * * → ${BASE_URL}/api/cron/poll`);
  }
}
