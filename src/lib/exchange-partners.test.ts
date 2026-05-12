import { describe, expect, it } from 'vitest';
import { enabledExchangePartners, exchangePartnerRel, exchangePartners } from './exchange-partners';

describe('exchange partner config', () => {
  it('keeps public exchange links enabled without placeholder referral tracking', () => {
    expect(enabledExchangePartners.length).toBeGreaterThan(0);

    for (const partner of exchangePartners) {
      const url = partner.buildUrl('akt');

      expect(url).toContain('AKT');
      expect(url).not.toMatch(/TRADEPOTION|ref=|affiliate|rcode|utm_/i);
      expect(partner.disclosure).toMatch(/no referral tracking/i);
      expect(partner.sponsored).toBe(false);
      expect(exchangePartnerRel(partner)).toBe('noopener noreferrer');
    }
  });
});
