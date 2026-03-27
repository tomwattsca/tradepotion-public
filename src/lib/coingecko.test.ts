import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterCategories } from './coingecko';

describe('filterCategories', () => {
  it('removes FTX Holdings from any coin', () => {
    const result = filterCategories('ethereum', ['DeFi', 'FTX Holdings', 'Smart Contract Platform']);
    expect(result).toEqual(['DeFi', 'Smart Contract Platform']);
  });

  it('removes per-coin blocklisted categories for bitcoin', () => {
    const result = filterCategories('bitcoin', [
      'Cryptocurrency',
      'Smart Contract Platform',
      'FTX Holdings',
    ]);
    expect(result).toEqual(['Cryptocurrency']);
  });

  it('removes per-coin blocklisted categories for litecoin', () => {
    const result = filterCategories('litecoin', ['Payment', 'Smart Contract Platform']);
    expect(result).toEqual(['Payment']);
  });

  it('removes per-coin blocklisted categories for dogecoin', () => {
    const result = filterCategories('dogecoin', ['Meme', 'Smart Contract Platform']);
    expect(result).toEqual(['Meme']);
  });

  it('removes per-coin blocklisted categories for bitcoin-cash', () => {
    const result = filterCategories('bitcoin-cash', ['Payment', 'Smart Contract Platform']);
    expect(result).toEqual(['Payment']);
  });

  it('passes through categories for unknown coins', () => {
    const cats = ['DeFi', 'Layer 2', 'Gaming'];
    const result = filterCategories('some-random-coin', cats);
    expect(result).toEqual(cats);
  });

  it('handles empty categories array', () => {
    expect(filterCategories('bitcoin', [])).toEqual([]);
  });

  it('removes multiple blocklisted categories at once', () => {
    const result = filterCategories('bitcoin', [
      'Cryptocurrency',
      'Smart Contract Platform',
      'FTX Holdings',
      'Store of Value',
    ]);
    expect(result).toEqual(['Cryptocurrency', 'Store of Value']);
  });
});
