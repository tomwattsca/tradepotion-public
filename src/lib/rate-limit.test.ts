import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('checkRateLimit', () => {
  // Use unique keys per test to avoid cross-test state
  let keyIndex = 0;
  function uniqueKey() {
    return `test-ip-${++keyIndex}-${Date.now()}`;
  }

  it('allows requests under the limit', () => {
    const key = uniqueKey();
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('tracks remaining count correctly', () => {
    const key = uniqueKey();
    checkRateLimit(key, 3, 60_000);
    checkRateLimit(key, 3, 60_000);
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('rejects requests over the limit', () => {
    const key = uniqueKey();
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60_000);
    }
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.resetMs).toBeGreaterThan(0);
  });

  it('uses separate windows per key', () => {
    const keyA = uniqueKey();
    const keyB = uniqueKey();
    for (let i = 0; i < 3; i++) {
      checkRateLimit(keyA, 3, 60_000);
    }
    const resultA = checkRateLimit(keyA, 3, 60_000);
    const resultB = checkRateLimit(keyB, 3, 60_000);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it('allows requests after window expires', async () => {
    const key = uniqueKey();
    // Fill up with a 100ms window
    for (let i = 0; i < 2; i++) {
      checkRateLimit(key, 2, 100);
    }
    expect(checkRateLimit(key, 2, 100).allowed).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 150));
    const result = checkRateLimit(key, 2, 100);
    expect(result.allowed).toBe(true);
  });
});
