import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const layoutSource = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');

describe('Tradepotion delegated analytics tracking', () => {
  it('wires existing data-event hooks into GA4 with non-PII properties', () => {
    expect(layoutSource).toContain('id="delegated-event-tracking"');
    expect(layoutSource).toContain("event.target.closest('[data-event]')");
    expect(layoutSource).toContain('price_alert_click: true');
    expect(layoutSource).toContain('exchange_outbound_click: true');
    expect(layoutSource).toContain('internal_link_click: true');
    expect(layoutSource).toContain('data-cta-location');
    expect(layoutSource).toContain('data-coin-id');
    expect(layoutSource).toContain('data-exchange-name');
    expect(layoutSource).toContain('page_location: window.location.pathname');
    expect(layoutSource).toContain("window.gtag('event', eventName, params)");
  });

  it('keeps outbound partner URLs out of GA4 link_url parameters', () => {
    expect(layoutSource).toContain('url.origin !== window.location.origin');
    expect(layoutSource).toContain('return undefined;');
    expect(layoutSource).toContain('if (/@/.test(value)) return undefined;');
  });
});
