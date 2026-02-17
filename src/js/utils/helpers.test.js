/* global describe, test, expect */
import GameHelpers from './helpers.js';

describe('GameHelpers', () => {
  describe('randomInt', () => {
    test('returns integer within range', () => {
      const min = 1;
      const max = 10;
      const result = GameHelpers.randomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('handles negative ranges', () => {
      const result = GameHelpers.randomInt(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    });

    test('returns same value when min equals max', () => {
      expect(GameHelpers.randomInt(7, 7)).toBe(7);
    });
  });

  describe('clamp', () => {
    test('returns value within bounds', () => {
      expect(GameHelpers.clamp(5, 0, 10)).toBe(5);
      expect(GameHelpers.clamp(-1, 0, 10)).toBe(0);
      expect(GameHelpers.clamp(11, 0, 10)).toBe(10);
    });
  });
});
