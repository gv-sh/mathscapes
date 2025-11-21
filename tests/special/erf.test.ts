
import { erf, erfc, erfInv, erfcx, erfi, dawson } from '../../src/special/erf';

describe('Error Functions', () => {
  describe('erf', () => {
    test('should compute error function', () => {
      expect(erf(0)).toBeCloseTo(0, 10);
      expect(erf(1)).toBeCloseTo(0.8427, 3);
      expect(erf(-1)).toBeCloseTo(-0.8427, 3);
      expect(erf(2)).toBeCloseTo(0.9953, 3);
    });

    test('should be antisymmetric', () => {
      expect(erf(-1)).toBeCloseTo(-erf(1), 10);
      expect(erf(-2)).toBeCloseTo(-erf(2), 10);
    });

    test('should approach ±1 for large |x|', () => {
      expect(erf(5)).toBeCloseTo(1, 5);
      expect(erf(-5)).toBeCloseTo(-1, 5);
      expect(erf(Infinity)).toBe(1);
      expect(erf(-Infinity)).toBe(-1);
    });

    test('should return values in [-1, 1]', () => {
      const values = [-3, -2, -1, 0, 1, 2, 3];
      values.forEach((x) => {
        const result = erf(x);
        expect(result).toBeGreaterThanOrEqual(-1);
        expect(result).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('erfc', () => {
    test('should compute complementary error function', () => {
      expect(erfc(0)).toBeCloseTo(1, 10);
      expect(erfc(1)).toBeCloseTo(0.1573, 3);
      expect(erfc(2)).toBeCloseTo(0.0047, 3);
    });

    test('should satisfy erfc(x) = 1 - erf(x)', () => {
      const values = [0, 0.5, 1, 2, 3];
      values.forEach((x) => {
        expect(erfc(x)).toBeCloseTo(1 - erf(x), 8);
      });
    });

    test('should approach 0 for large positive x', () => {
      expect(erfc(5)).toBeLessThan(0.001);
      expect(erfc(Infinity)).toBe(0);
    });

    test('should approach 2 for large negative x', () => {
      expect(erfc(-5)).toBeCloseTo(2, 5);
      expect(erfc(-Infinity)).toBe(2);
    });
  });

  describe('erfInv', () => {
    test('should be inverse of erf', () => {
      const values = [0, 0.5, -0.5];
      values.forEach((y) => {
        const x = erfInv(y);
        expect(erf(x)).toBeCloseTo(y, 5);
      });
    });

    test('should return 0 for input 0', () => {
      expect(erfInv(0)).toBe(0);
    });

    test('should handle boundary values', () => {
      expect(erfInv(1)).toBe(Infinity);
      expect(erfInv(-1)).toBe(-Infinity);
    });

    test('should return NaN for out of range input', () => {
      expect(erfInv(1.5)).toBeNaN();
      expect(erfInv(-1.5)).toBeNaN();
    });
  });

  describe('erfcx', () => {
    test('should compute scaled complementary error function', () => {
      expect(erfcx(0)).toBeCloseTo(1, 10);
      expect(erfcx(1)).toBeGreaterThan(0);
    });

    test('should avoid overflow for large x', () => {
      const result = erfcx(10);
      expect(isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    test('should satisfy erfcx(x) = exp(x²) * erfc(x) for small x', () => {
      const x = 0.2;
      expect(erfcx(x)).toBeCloseTo(Math.exp(x * x) * erfc(x), 6);
    });
  });

  describe('erfi', () => {
    test('should compute imaginary error function', () => {
      expect(erfi(0)).toBeCloseTo(0, 10);
      expect(erfi(1)).toBeCloseTo(1.6504, 3);
    });

    test('should be antisymmetric', () => {
      expect(erfi(-1)).toBeCloseTo(-erfi(1), 8);
    });

    test('should grow exponentially for large x', () => {
      expect(erfi(2)).toBeGreaterThan(erfi(1));
      expect(erfi(3)).toBeGreaterThan(erfi(2));
    });
  });

  describe('dawson', () => {
    test('should compute Dawson function', () => {
      expect(dawson(0)).toBeCloseTo(0, 10);
      expect(dawson(1)).toBeCloseTo(0.5380, 3);
    });

    test('should be antisymmetric', () => {
      expect(dawson(-1)).toBeCloseTo(-dawson(1), 8);
    });

    test('should satisfy D(x) = (√π/2) * exp(-x²) * erfi(x) for small x', () => {
      const x = 0.5;
      const expected = (Math.sqrt(Math.PI) / 2) * Math.exp(-x * x) * erfi(x);
      expect(dawson(x)).toBeCloseTo(expected, 6);
    });
  });
});
