// cron-worker.js — Standalone poller, runs as a separate Railway service  
// Calls /api/cron/poll every 5 minutes

const POLL_URL = process.env.POLL_URL || (process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/cron/poll`
  : 'http://localhost:3000/api/cron/poll');
  
const CRON_SECRET = process.env.CRON_SECRET || '';
const INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '300000', 10); // 5 min default

async function poll() {
  try {
    const res = await fetch(POLL_URL, {
      headers: { 'x-cron-secret': CRON_SECRET },
    });
    const body = await res.json().catch(() => ({}));
    console.log(`[${new Date().toISOString()}] poll ${res.status}`, body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] poll error:`, err.message);
  }
}

console.log(`Starting cron worker — polling ${POLL_URL} every ${INTERVAL_MS / 1000}s`);
poll(); // immediate first run
setInterval(poll, INTERVAL_MS);
