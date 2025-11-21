import {
  isPrime,
  sieveOfEratosthenes,
  millerRabin,
  millerRabinDeterministic,
  generatePrimes,
  nextPrime,
  prevPrime,
  primeCount,
  nthPrime,
  twinPrimes,
} from '../../src/number-theory/primes';

describe('Prime Number Operations', () => {
  describe('isPrime', () => {
    test('should correctly identify small primes', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(5)).toBe(true);
      expect(isPrime(7)).toBe(true);
      expect(isPrime(11)).toBe(true);
      expect(isPrime(13)).toBe(true);
    });

    test('should correctly identify composites', () => {
      expect(isPrime(0)).toBe(false);
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(6)).toBe(false);
      expect(isPrime(8)).toBe(false);
      expect(isPrime(9)).toBe(false);
      expect(isPrime(10)).toBe(false);
    });

    test('should handle larger primes', () => {
      expect(isPrime(97)).toBe(true);
      expect(isPrime(101)).toBe(true);
      expect(isPrime(1009)).toBe(true);
    });

    test('should handle larger composites', () => {
      expect(isPrime(100)).toBe(false);
      expect(isPrime(1000)).toBe(false);
      expect(isPrime(1001)).toBe(false);
    });
  });

  describe('sieveOfEratosthenes', () => {
    test('should generate primes up to n', () => {
      const primes = sieveOfEratosthenes(30);
      expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    });

    test('should return empty array for n < 2', () => {
      expect(sieveOfEratosthenes(1)).toEqual([]);
      expect(sieveOfEratosthenes(0)).toEqual([]);
    });

    test('should handle n = 2', () => {
      expect(sieveOfEratosthenes(2)).toEqual([2]);
    });

    test('should generate many primes efficiently', () => {
      const primes = sieveOfEratosthenes(100);
      expect(primes.length).toBe(25);
      expect(primes[0]).toBe(2);
      expect(primes[primes.length - 1]).toBe(97);
    });
  });

  describe('millerRabin', () => {
    test('should identify primes with high probability', () => {
      expect(millerRabin(2, 5)).toBe(true);
      expect(millerRabin(3, 5)).toBe(true);
      expect(millerRabin(5, 5)).toBe(true);
      expect(millerRabin(7, 5)).toBe(true);
      expect(millerRabin(11, 5)).toBe(true);
    });

    test('should identify composites', () => {
      expect(millerRabin(4, 5)).toBe(false);
      expect(millerRabin(6, 5)).toBe(false);
      expect(millerRabin(8, 5)).toBe(false);
      expect(millerRabin(9, 5)).toBe(false);
    });

    test('should handle large primes', () => {
      expect(millerRabin(104729, 5)).toBe(true); // 10000th prime
      expect(millerRabin(15485863, 5)).toBe(true); // millionth prime
    });

    test('should handle edge cases', () => {
      expect(millerRabin(0, 5)).toBe(false);
      expect(millerRabin(1, 5)).toBe(false);
    });
  });

  describe('millerRabinDeterministic', () => {
    test('should deterministically identify primes', () => {
      expect(millerRabinDeterministic(2)).toBe(true);
      expect(millerRabinDeterministic(3)).toBe(true);
      expect(millerRabinDeterministic(17)).toBe(true);
      expect(millerRabinDeterministic(97)).toBe(true);
    });

    test('should deterministically identify composites', () => {
      expect(millerRabinDeterministic(4)).toBe(false);
      expect(millerRabinDeterministic(15)).toBe(false);
      expect(millerRabinDeterministic(100)).toBe(false);
    });
  });

  describe('generatePrimes', () => {
    test('should generate first n primes', () => {
      const primes = generatePrimes(10);
      expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    });

    test('should return empty array for n = 0', () => {
      expect(generatePrimes(0)).toEqual([]);
    });

    test('should handle n = 1', () => {
      expect(generatePrimes(1)).toEqual([2]);
    });

    test('should generate single prime', () => {
      expect(generatePrimes(5)).toEqual([2, 3, 5, 7, 11]);
    });
  });

  describe('nextPrime', () => {
    test('should find next prime after given number', () => {
      expect(nextPrime(10)).toBe(11);
      expect(nextPrime(11)).toBe(13);
      expect(nextPrime(14)).toBe(17);
    });

    test('should handle primes as input', () => {
      expect(nextPrime(2)).toBe(3);
      expect(nextPrime(7)).toBe(11);
    });
  });

  describe('prevPrime', () => {
    test('should find previous prime before given number', () => {
      expect(prevPrime(10)).toBe(7);
      expect(prevPrime(13)).toBe(11);
      expect(prevPrime(20)).toBe(19);
    });

    test('should handle primes as input', () => {
      expect(prevPrime(17)).toBe(13);
      expect(prevPrime(7)).toBe(5);
    });

    test('should return null when no previous prime exists', () => {
      expect(prevPrime(2)).toBe(null);
      expect(prevPrime(1)).toBe(null);
    });
  });

  describe('primeCount', () => {
    test('should count primes up to n', () => {
      expect(primeCount(10)).toBe(4); // 2, 3, 5, 7
      expect(primeCount(20)).toBe(8);
      expect(primeCount(100)).toBe(25);
    });

    test('should handle small values', () => {
      expect(primeCount(1)).toBe(0);
      expect(primeCount(2)).toBe(1);
    });
  });

  describe('nthPrime', () => {
    test('should return nth prime (1-indexed)', () => {
      expect(nthPrime(1)).toBe(2);
      expect(nthPrime(2)).toBe(3);
      expect(nthPrime(5)).toBe(11);
      expect(nthPrime(10)).toBe(29);
    });

    test('should throw for non-positive n', () => {
      expect(() => nthPrime(0)).toThrow();
      expect(() => nthPrime(-1)).toThrow();
    });
  });

  describe('twinPrimes', () => {
    test('should find twin primes up to n', () => {
      const twins = twinPrimes(20);
      expect(twins).toEqual([
        [3, 5],
        [5, 7],
        [11, 13],
        [17, 19],
      ]);
    });

    test('should return empty array when no twin primes exist', () => {
      expect(twinPrimes(2)).toEqual([]);
    });

    test('should handle larger ranges', () => {
      const twins = twinPrimes(100);
      expect(twins.length).toBeGreaterThan(0);
      // Verify all pairs differ by 2
      twins.forEach(([p1, p2]) => {
        expect(p2 - p1).toBe(2);
      });
    });
  });
});
