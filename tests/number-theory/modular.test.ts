
import {
  modPow,
  modInverse,
  mod,
  modAdd,
  modSub,
  modMul,
  modDiv,
  chineseRemainder,
  isQuadraticResidue,
  legendreSymbol,
  modSqrt,
  discreteLog,
} from '../../src/number-theory/modular';

describe('Modular Arithmetic', () => {
  describe('modPow', () => {
    test('should compute modular exponentiation', () => {
      expect(modPow(2, 10, 1000)).toBe(24); // 2^10 = 1024 ≡ 24 (mod 1000)
      expect(modPow(3, 7, 11)).toBe(9);
      expect(modPow(5, 3, 13)).toBe(8);
    });

    test('should handle zero exponent', () => {
      expect(modPow(5, 0, 7)).toBe(1);
    });

    test('should handle mod 1', () => {
      expect(modPow(100, 100, 1)).toBe(0);
    });
  });

  describe('modInverse', () => {
    test('should compute modular multiplicative inverse', () => {
      expect(modInverse(3, 11)).toBe(4); // 3*4 = 12 ≡ 1 (mod 11)
      expect(modInverse(7, 11)).toBe(8); // 7*8 = 56 ≡ 1 (mod 11)
    });

    test('should return null when inverse does not exist', () => {
      expect(modInverse(2, 4)).toBeNull(); // gcd(2,4) = 2 ≠ 1
      expect(modInverse(6, 9)).toBeNull();
    });

    test('should handle inverse of 1', () => {
      expect(modInverse(1, 7)).toBe(1);
    });
  });

  describe('mod', () => {
    test('should compute modulo with positive result', () => {
      expect(mod(17, 5)).toBe(2);
      expect(mod(-3, 5)).toBe(2); // Not -3
      expect(mod(-8, 5)).toBe(2);
    });
  });

  describe('modAdd', () => {
    test('should perform modular addition', () => {
      expect(modAdd(7, 8, 10)).toBe(5); // (7+8) mod 10 = 5
      expect(modAdd(3, 4, 5)).toBe(2);
    });
  });

  describe('modSub', () => {
    test('should perform modular subtraction', () => {
      expect(modSub(5, 8, 10)).toBe(7); // (5-8) mod 10 = 7
      expect(modSub(2, 5, 7)).toBe(4);
    });
  });

  describe('modMul', () => {
    test('should perform modular multiplication', () => {
      expect(modMul(7, 8, 10)).toBe(6); // (7*8) mod 10 = 6
      expect(modMul(3, 4, 11)).toBe(1);
    });
  });

  describe('modDiv', () => {
    test('should perform modular division', () => {
      const result = modDiv(8, 3, 11);
      expect(result).not.toBeNull();
      if (result !== null) {
        expect(modMul(result, 3, 11)).toBe(8);
      }
    });

    test('should return null when divisor has no inverse', () => {
      expect(modDiv(5, 2, 4)).toBeNull();
    });
  });

  describe('chineseRemainder', () => {
    test('should solve system of congruences', () => {
      const result = chineseRemainder([2, 3, 2], [3, 5, 7]);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.solution % 3).toBe(2);
        expect(result.solution % 5).toBe(3);
        expect(result.solution % 7).toBe(2);
      }
    });

    test('should handle two congruences', () => {
      const result = chineseRemainder([1, 4], [3, 5]);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.solution % 3).toBe(1);
        expect(result.solution % 5).toBe(4);
      }
    });
  });

  describe('isQuadraticResidue', () => {
    test('should identify quadratic residues', () => {
      expect(isQuadraticResidue(4, 7)).toBe(true); // 2^2 ≡ 4 (mod 7)
      expect(isQuadraticResidue(1, 7)).toBe(true);
    });

    test('should identify non-residues', () => {
      expect(isQuadraticResidue(3, 7)).toBe(false);
      expect(isQuadraticResidue(5, 7)).toBe(false);
    });
  });

  describe('legendreSymbol', () => {
    test('should compute Legendre symbol', () => {
      expect(legendreSymbol(4, 7)).toBe(1);
      expect(legendreSymbol(3, 7)).toBe(-1);
      expect(legendreSymbol(0, 7)).toBe(0);
    });
  });

  describe('modSqrt', () => {
    test('should compute modular square roots', () => {
      const result = modSqrt(4, 7);
      expect(result).not.toBeNull();
      if (result !== null) {
        expect((result * result) % 7).toBe(4);
      }
    });

    test('should return null for non-residues', () => {
      expect(modSqrt(3, 7)).toBeNull();
    });
  });

  describe('discreteLog', () => {
    test('should compute discrete logarithm', () => {
      const result = discreteLog(2, 8, 11);
      expect(result).toBe(3); // 2^3 ≡ 8 (mod 11)
    });

    test('should handle base cases', () => {
      expect(discreteLog(2, 1, 11)).toBe(0);
    });
  });
});
