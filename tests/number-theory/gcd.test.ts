
import {
  gcd,
  gcdMultiple,
  lcm,
  lcmMultiple,
  extendedGCD,
  areCoprime,
  eulerTotient,
  solveDiophantine,
  divisors,
  divisorCount,
  divisorSum,
  isPerfect,
} from '../../src/number-theory/gcd';

describe('GCD and LCM Operations', () => {
  describe('gcd', () => {
    test('should compute gcd of two numbers', () => {
      expect(gcd(48, 18)).toBe(6);
      expect(gcd(100, 35)).toBe(5);
      expect(gcd(12, 8)).toBe(4);
    });

    test('should handle coprime numbers', () => {
      expect(gcd(7, 11)).toBe(1);
      expect(gcd(13, 17)).toBe(1);
    });

    test('should handle zeros', () => {
      expect(gcd(0, 5)).toBe(5);
      expect(gcd(5, 0)).toBe(5);
    });

    test('should handle negative numbers', () => {
      expect(gcd(-48, 18)).toBe(6);
      expect(gcd(48, -18)).toBe(6);
      expect(gcd(-48, -18)).toBe(6);
    });
  });

  describe('gcdMultiple', () => {
    test('should compute gcd of multiple numbers', () => {
      expect(gcdMultiple([48, 18, 30])).toBe(6);
      expect(gcdMultiple([12, 18, 24])).toBe(6);
    });

    test('should handle single number', () => {
      expect(gcdMultiple([42])).toBe(42);
    });

    test('should throw for empty array', () => {
      expect(() => gcdMultiple([])).toThrow();
    });
  });

  describe('lcm', () => {
    test('should compute lcm of two numbers', () => {
      expect(lcm(12, 18)).toBe(36);
      expect(lcm(21, 6)).toBe(42);
      expect(lcm(4, 6)).toBe(12);
    });

    test('should handle zeros', () => {
      expect(lcm(0, 5)).toBe(0);
      expect(lcm(5, 0)).toBe(0);
    });

    test('should handle coprime numbers', () => {
      expect(lcm(7, 11)).toBe(77);
    });
  });

  describe('lcmMultiple', () => {
    test('should compute lcm of multiple numbers', () => {
      expect(lcmMultiple([4, 6, 12])).toBe(12);
      expect(lcmMultiple([2, 3, 4])).toBe(12);
    });

    test('should handle single number', () => {
      expect(lcmMultiple([42])).toBe(42);
    });
  });

  describe('extendedGCD', () => {
    test('should find coefficients for Bézout identity', () => {
      const result = extendedGCD(240, 46);
      expect(result.gcd).toBe(2);
      // Verify: 240*x + 46*y = gcd
      expect(240 * result.x + 46 * result.y).toBe(result.gcd);
    });

    test('should handle coprime numbers', () => {
      const result = extendedGCD(35, 64);
      expect(result.gcd).toBe(1);
      expect(35 * result.x + 64 * result.y).toBe(1);
    });

    test('should handle when b divides a', () => {
      const result = extendedGCD(12, 4);
      expect(result.gcd).toBe(4);
    });
  });

  describe('areCoprime', () => {
    test('should identify coprime numbers', () => {
      expect(areCoprime(8, 15)).toBe(true);
      expect(areCoprime(7, 11)).toBe(true);
      expect(areCoprime(13, 17)).toBe(true);
    });

    test('should identify non-coprime numbers', () => {
      expect(areCoprime(12, 18)).toBe(false);
      expect(areCoprime(10, 15)).toBe(false);
    });
  });

  describe('eulerTotient', () => {
    test('should compute φ(n) correctly', () => {
      expect(eulerTotient(9)).toBe(6); // 1, 2, 4, 5, 7, 8
      expect(eulerTotient(10)).toBe(4); // 1, 3, 7, 9
      expect(eulerTotient(12)).toBe(4); // 1, 5, 7, 11
    });

    test('should handle primes', () => {
      expect(eulerTotient(7)).toBe(6); // φ(p) = p-1
      expect(eulerTotient(11)).toBe(10);
      expect(eulerTotient(13)).toBe(12);
    });

    test('should handle powers of primes', () => {
      expect(eulerTotient(8)).toBe(4); // φ(2^3) = 2^2 * (2-1) = 4
      expect(eulerTotient(9)).toBe(6); // φ(3^2) = 3 * (3-1) = 6
    });

    test('should throw for non-positive numbers', () => {
      expect(() => eulerTotient(0)).toThrow();
      expect(() => eulerTotient(-5)).toThrow();
    });
  });

  describe('solveDiophantine', () => {
    test('should solve linear Diophantine equations', () => {
      const sol = solveDiophantine(3, 5, 1);
      expect(sol).not.toBeNull();
      if (sol) {
        expect(3 * sol.x + 5 * sol.y).toBe(1);
      }
    });

    test('should return null when no solution exists', () => {
      const sol = solveDiophantine(4, 6, 5);
      expect(sol).toBeNull(); // gcd(4,6)=2, doesn't divide 5
    });

    test('should handle solvable equations', () => {
      const sol = solveDiophantine(12, 18, 6);
      expect(sol).not.toBeNull();
      if (sol) {
        expect(12 * sol.x + 18 * sol.y).toBe(6);
      }
    });
  });

  describe('divisors', () => {
    test('should find all divisors', () => {
      expect(divisors(12)).toEqual([1, 2, 3, 4, 6, 12]);
      expect(divisors(28)).toEqual([1, 2, 4, 7, 14, 28]);
    });

    test('should handle prime numbers', () => {
      expect(divisors(7)).toEqual([1, 7]);
      expect(divisors(13)).toEqual([1, 13]);
    });

    test('should handle perfect squares', () => {
      const divs = divisors(16);
      expect(divs).toEqual([1, 2, 4, 8, 16]);
    });

    test('should throw for non-positive numbers', () => {
      expect(() => divisors(0)).toThrow();
      expect(() => divisors(-5)).toThrow();
    });
  });

  describe('divisorCount', () => {
    test('should count divisors', () => {
      expect(divisorCount(12)).toBe(6);
      expect(divisorCount(28)).toBe(6);
      expect(divisorCount(16)).toBe(5);
    });

    test('should handle primes', () => {
      expect(divisorCount(7)).toBe(2);
      expect(divisorCount(13)).toBe(2);
    });
  });

  describe('divisorSum', () => {
    test('should sum all divisors', () => {
      expect(divisorSum(12)).toBe(28); // 1+2+3+4+6+12
      expect(divisorSum(6)).toBe(12); // 1+2+3+6
    });

    test('should handle primes', () => {
      expect(divisorSum(7)).toBe(8); // 1+7
    });
  });

  describe('isPerfect', () => {
    test('should identify perfect numbers', () => {
      expect(isPerfect(6)).toBe(true); // 1+2+3 = 6
      expect(isPerfect(28)).toBe(true); // 1+2+4+7+14 = 28
    });

    test('should identify non-perfect numbers', () => {
      expect(isPerfect(12)).toBe(false);
      expect(isPerfect(100)).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isPerfect(1)).toBe(false);
      expect(isPerfect(0)).toBe(false);
    });
  });
});
