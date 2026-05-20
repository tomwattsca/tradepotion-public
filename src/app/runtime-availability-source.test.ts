import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const instrumentationSource = readFileSync('src/instrumentation.ts', 'utf8');
const cronPollSource = readFileSync('src/app/api/cron/poll/route.ts', 'utf8');

describe('public web runtime availability posture', () => {
  it('does not run the market-data poller inside the public web service unless explicitly enabled', () => {
    expect(instrumentationSource).toContain('ENABLE_IN_PROCESS_CRON');
    expect(instrumentationSource).toContain('IN_PROCESS_CRON_ENABLED');
    expect(instrumentationSource).toContain('In-process poller disabled');
    expect(instrumentationSource).toContain('return;');
  });

  it('keeps cron polling from rerunning database migrations on every request', () => {
    expect(cronPollSource).toContain("export const dynamic = 'force-dynamic'");
    expect(cronPollSource).not.toContain('runMigrations');
    expect(cronPollSource).toContain('Runtime web requests should not run schema migrations');
    expect(cronPollSource).toContain('fetchCoinGeckoMarkets');
  });
});
