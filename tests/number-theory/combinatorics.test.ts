
import {
  factorial,
  permutations,
  combinations,
  binomial,
  multinomial,
  combinationsWithRepetition,
  derangements,
  stirlingSecond,
  stirlingFirst,
  bell,
  catalan,
  partition,
  generatePermutations,
  generateCombinations,
} from '../../src/number-theory/combinatorics';

describe('Combinatorics', () => {
  describe('factorial', () => {
    test('should compute factorials', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
      expect(factorial(10)).toBe(3628800);
    });

    test('should throw for negative numbers', () => {
      expect(() => factorial(-1)).toThrow();
    });
  });

  describe('permutations', () => {
    test('should compute permutations P(n,k)', () => {
      expect(permutations(5, 2)).toBe(20);
      expect(permutations(4, 4)).toBe(24);
      expect(permutations(10, 3)).toBe(720);
    });

    test('should return 0 when k > n', () => {
      expect(permutations(3, 5)).toBe(0);
    });

    test('should handle k = 0', () => {
      expect(permutations(5, 0)).toBe(1);
    });
  });

  describe('combinations', () => {
    test('should compute combinations C(n,k)', () => {
      expect(combinations(5, 2)).toBe(10);
      expect(combinations(10, 3)).toBe(120);
      expect(combinations(6, 3)).toBe(20);
    });

    test('should use symmetry C(n,k) = C(n,n-k)', () => {
      expect(combinations(10, 7)).toBe(combinations(10, 3));
    });

    test('should return 0 when k > n', () => {
      expect(combinations(3, 5)).toBe(0);
    });

    test('should handle edge cases', () => {
      expect(combinations(5, 0)).toBe(1);
      expect(combinations(5, 5)).toBe(1);
    });
  });

  describe('binomial', () => {
    test('should be alias for combinations', () => {
      expect(binomial(5, 2)).toBe(combinations(5, 2));
      expect(binomial(10, 3)).toBe(combinations(10, 3));
    });
  });

  describe('multinomial', () => {
    test('should compute multinomial coefficients', () => {
      expect(multinomial(10, [3, 3, 4])).toBe(4200);
      expect(multinomial(5, [2, 2, 1])).toBe(30);
    });

    test('should handle equal groups', () => {
      expect(multinomial(6, [2, 2, 2])).toBe(90);
    });

    test('should throw when sum does not equal n', () => {
      expect(() => multinomial(10, [3, 3, 3])).toThrow();
    });
  });

  describe('combinationsWithRepetition', () => {
    test('should compute combinations with repetition', () => {
      expect(combinationsWithRepetition(3, 2)).toBe(6);
      expect(combinationsWithRepetition(4, 3)).toBe(20);
    });
  });

  describe('derangements', () => {
    test('should compute derangements', () => {
      expect(derangements(0)).toBe(1);
      expect(derangements(1)).toBe(0);
      expect(derangements(2)).toBe(1);
      expect(derangements(3)).toBe(2);
      expect(derangements(4)).toBe(9);
    });
  });

  describe('stirlingSecond', () => {
    test('should compute Stirling numbers of second kind', () => {
      expect(stirlingSecond(4, 2)).toBe(7);
      expect(stirlingSecond(5, 3)).toBe(25);
    });

    test('should handle edge cases', () => {
      expect(stirlingSecond(0, 0)).toBe(1);
      expect(stirlingSecond(5, 0)).toBe(0);
      expect(stirlingSecond(5, 1)).toBe(1);
      expect(stirlingSecond(5, 5)).toBe(1);
    });

    test('should return 0 when k > n', () => {
      expect(stirlingSecond(3, 5)).toBe(0);
    });
  });

  describe('stirlingFirst', () => {
    test('should compute Stirling numbers of first kind', () => {
      expect(stirlingFirst(4, 2)).toBe(11);
      expect(stirlingFirst(5, 3)).toBe(35);
    });

    test('should handle signed version', () => {
      expect(Math.abs(stirlingFirst(4, 2, true))).toBe(11);
    });

    test('should handle edge cases', () => {
      expect(stirlingFirst(0, 0)).toBe(1);
      expect(stirlingFirst(5, 0)).toBe(0);
    });
  });

  describe('bell', () => {
    test('should compute Bell numbers', () => {
      expect(bell(0)).toBe(1);
      expect(bell(1)).toBe(1);
      expect(bell(2)).toBe(2);
      expect(bell(3)).toBe(5);
      expect(bell(4)).toBe(15);
    });
  });

  describe('catalan', () => {
    test('should compute Catalan numbers', () => {
      expect(catalan(0)).toBe(1);
      expect(catalan(1)).toBe(1);
      expect(catalan(2)).toBe(2);
      expect(catalan(3)).toBe(5);
      expect(catalan(4)).toBe(14);
      expect(catalan(5)).toBe(42);
    });
  });

  describe('partition', () => {
    test('should compute partition function', () => {
      expect(partition(0)).toBe(1);
      expect(partition(1)).toBe(1);
      expect(partition(2)).toBe(2); // 2, 1+1
      expect(partition(3)).toBe(3); // 3, 2+1, 1+1+1
      expect(partition(4)).toBe(5);
      expect(partition(5)).toBe(7);
    });
  });

  describe('generatePermutations', () => {
    test('should generate all permutations', () => {
      const perms = generatePermutations([1, 2, 3]);
      expect(perms.length).toBe(6);
      expect(perms).toContainEqual([1, 2, 3]);
      expect(perms).toContainEqual([3, 2, 1]);
    });

    test('should handle empty array', () => {
      expect(generatePermutations([])).toEqual([[]]);
    });

    test('should handle single element', () => {
      expect(generatePermutations([1])).toEqual([[1]]);
    });
  });

  describe('generateCombinations', () => {
    test('should generate all combinations', () => {
      const combs = generateCombinations([1, 2, 3, 4], 2);
      expect(combs.length).toBe(6);
      expect(combs).toContainEqual([1, 2]);
      expect(combs).toContainEqual([3, 4]);
    });

    test('should handle k = 0', () => {
      expect(generateCombinations([1, 2, 3], 0)).toEqual([[]]);
    });

    test('should return empty when k > n', () => {
      expect(generateCombinations([1, 2], 3)).toEqual([]);
    });
  });
});
