
import {
  gamma,
  lnGamma,
  beta,
  lnBeta,
  regularizedGammaP,
  regularizedGammaQ,
  digamma,
  regularizedBeta,
} from '../../src/special/gamma';

describe('Gamma and Beta Functions', () => {
  describe('gamma', () => {
    test('should compute gamma function for integers', () => {
      expect(gamma(1)).toBeCloseTo(1, 10);
      expect(gamma(2)).toBeCloseTo(1, 10); // Γ(2) = 1! = 1
      expect(gamma(3)).toBeCloseTo(2, 10); // Γ(3) = 2! = 2
      expect(gamma(4)).toBeCloseTo(6, 10); // Γ(4) = 3! = 6
      expect(gamma(5)).toBeCloseTo(24, 10); // Γ(5) = 4! = 24
    });

    test('should compute gamma function for half-integers', () => {
      expect(gamma(0.5)).toBeCloseTo(Math.sqrt(Math.PI), 8);
      expect(gamma(1.5)).toBeCloseTo(Math.sqrt(Math.PI) / 2, 8);
      expect(gamma(2.5)).toBeCloseTo((3 * Math.sqrt(Math.PI)) / 4, 8);
    });

    test('should handle non-integer values', () => {
      expect(gamma(3.5)).toBeCloseTo(3.323, 2);
      expect(gamma(4.7)).toBeGreaterThan(0);
    });

    test('should throw for non-positive integers', () => {
      expect(() => gamma(0)).toThrow();
      expect(() => gamma(-1)).toThrow();
      expect(() => gamma(-2)).toThrow();
    });
  });

  describe('lnGamma', () => {
    test('should compute log gamma function', () => {
      expect(lnGamma(1)).toBeCloseTo(0, 10);
      expect(lnGamma(2)).toBeCloseTo(0, 10);
      expect(lnGamma(3)).toBeCloseTo(Math.log(2), 10);
      expect(lnGamma(5)).toBeCloseTo(Math.log(24), 10);
    });

    test('should handle large values without overflow', () => {
      const result = lnGamma(100);
      expect(result).toBeGreaterThan(0);
      expect(isFinite(result)).toBe(true);
    });
  });

  describe('beta', () => {
    test('should compute beta function', () => {
      expect(beta(1, 1)).toBeCloseTo(1, 10);
      expect(beta(2, 3)).toBeCloseTo(1 / 12, 8);
      expect(beta(0.5, 0.5)).toBeCloseTo(Math.PI, 8);
    });

    test('should be symmetric', () => {
      expect(beta(2, 3)).toBeCloseTo(beta(3, 2), 10);
      expect(beta(1.5, 2.5)).toBeCloseTo(beta(2.5, 1.5), 10);
    });

    test('should throw for non-positive parameters', () => {
      expect(() => beta(0, 1)).toThrow();
      expect(() => beta(1, -1)).toThrow();
    });
  });

  describe('lnBeta', () => {
    test('should compute log beta function', () => {
      expect(lnBeta(1, 1)).toBeCloseTo(0, 10);
      expect(lnBeta(2, 3)).toBeCloseTo(Math.log(1 / 12), 8);
    });

    test('should handle large parameters without overflow', () => {
      const result = lnBeta(50, 50);
      expect(isFinite(result)).toBe(true);
    });
  });

  describe('regularizedGammaP', () => {
    test('should compute regularized incomplete gamma P', () => {
      expect(regularizedGammaP(1, 0)).toBeCloseTo(0, 10);
      expect(regularizedGammaP(1, 1)).toBeCloseTo(1 - Math.exp(-1), 8);
    });

    test('should return values in [0, 1]', () => {
      const result = regularizedGammaP(2, 3);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('regularizedGammaQ', () => {
    test('should compute regularized incomplete gamma Q', () => {
      expect(regularizedGammaQ(1, 0)).toBeCloseTo(1, 10);
      expect(regularizedGammaQ(1, 1)).toBeCloseTo(Math.exp(-1), 8);
    });

    test('should satisfy P + Q = 1', () => {
      const s = 2;
      const x = 3;
      const p = regularizedGammaP(s, x);
      const q = regularizedGammaQ(s, x);
      expect(p + q).toBeCloseTo(1, 10);
    });
  });

  describe('digamma', () => {
    test('should compute digamma function', () => {
      // ψ(1) = -γ (Euler-Mascheroni constant ≈ -0.5772)
      expect(digamma(1)).toBeCloseTo(-0.5772, 3);
      expect(digamma(2)).toBeCloseTo(1 - 0.5772, 3);
    });

    test('should throw for non-positive integers', () => {
      expect(() => digamma(0)).toThrow();
      expect(() => digamma(-1)).toThrow();
    });
  });

  describe('regularizedBeta', () => {
    test('should compute regularized incomplete beta', () => {
      expect(regularizedBeta(0, 1, 1)).toBeCloseTo(0, 10);
      expect(regularizedBeta(1, 1, 1)).toBeCloseTo(1, 10);
      expect(regularizedBeta(0.5, 1, 1)).toBeCloseTo(0.5, 8);
    });

    test('should compute regularized beta for valid inputs', () => {
      const result = regularizedBeta(0.5, 2, 2);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(isFinite(result)).toBe(true);
    });
  });
});
