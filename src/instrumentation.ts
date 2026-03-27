// Self-contained cron: polls /api/cron/poll on a timer inside the Next.js process.
// Replaces the standalone cron-worker.js service.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');

    const CRON_SECRET = process.env.CRON_SECRET || '';
    const INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '300000', 10);
    const PORT = process.env.PORT || '3000';
    const BASE_URL = `http://localhost:${PORT}`;

    async function poll() {
      try {
        const res = await fetch(`${BASE_URL}/api/cron/poll`, {
          headers: { 'x-cron-secret': CRON_SECRET },
        });
        const body = await res.json().catch(() => ({}));
        console.log(`[cron] poll ${res.status}`, body);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[cron] poll error: ${message}`);
      }
    }

    // Delay first poll to let the server fully start
    setTimeout(() => {
      console.log(`[cron] Starting in-process poller — every ${INTERVAL_MS / 1000}s`);
      poll();
      setInterval(poll, INTERVAL_MS);
    }, 10_000);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
