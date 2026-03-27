import { describe, it, expect } from 'vitest';
import { formatPrice, formatMarketCap, formatPct, pctColor, clamp } from './utils';

describe('formatPrice', () => {
  it('returns dash for null/undefined', () => {
    expect(formatPrice(null as unknown as number)).toBe('$—');
    expect(formatPrice(undefined as unknown as number)).toBe('$—');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats very small prices (<0.000001) with up to 10 decimals', () => {
    const result = formatPrice(0.000000106);
    expect(result).toBe('$0.000000106');
  });

  it('formats small prices (<0.0001) with 8 decimals', () => {
    expect(formatPrice(0.00005432)).toBe('$0.00005432');
  });

  it('formats medium prices (<0.01) with 6 decimals', () => {
    expect(formatPrice(0.005678)).toBe('$0.005678');
  });

  it('formats sub-dollar prices with 4 decimals', () => {
    expect(formatPrice(0.5432)).toBe('$0.5432');
  });

  it('formats standard prices with 2 decimals', () => {
    const result = formatPrice(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('formats large prices (>10K) with no decimals', () => {
    const result = formatPrice(65432);
    expect(result).toContain('65,432');
    expect(result).not.toContain('.');
  });
});

describe('formatMarketCap', () => {
  it('returns dash for falsy values', () => {
    expect(formatMarketCap(0)).toBe('—');
    expect(formatMarketCap(null as unknown as number)).toBe('—');
  });

  it('formats trillions', () => {
    expect(formatMarketCap(2.5e12)).toBe('$2.50T');
  });

  it('formats billions', () => {
    expect(formatMarketCap(1.23e9)).toBe('$1.23B');
  });

  it('formats millions', () => {
    expect(formatMarketCap(456e6)).toBe('$456.00M');
  });

  it('formats values below 1M with locale string', () => {
    const result = formatMarketCap(999999);
    expect(result).toContain('999,999');
  });
});

describe('formatPct', () => {
  it('returns dash for null/undefined', () => {
    expect(formatPct(null as unknown as number)).toBe('—');
    expect(formatPct(undefined as unknown as number)).toBe('—');
  });

  it('formats positive percentages with + sign', () => {
    expect(formatPct(12.345)).toBe('+12.35%');
  });

  it('formats negative percentages with - sign', () => {
    expect(formatPct(-5.678)).toBe('-5.68%');
  });

  it('formats zero as +0.00%', () => {
    expect(formatPct(0)).toBe('+0.00%');
  });
});

describe('pctColor', () => {
  it('returns emerald for positive', () => {
    expect(pctColor(5)).toBe('text-emerald-400');
  });

  it('returns red for negative', () => {
    expect(pctColor(-3)).toBe('text-red-400');
  });

  it('returns zinc for zero', () => {
    expect(pctColor(0)).toBe('text-zinc-400');
  });
});

describe('clamp', () => {
  it('clamps below minimum', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('returns value when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('handles edge cases at boundaries', () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});
