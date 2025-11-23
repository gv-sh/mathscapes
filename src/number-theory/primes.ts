/**
 * Prime Number Operations
 *
 * This module provides functions for prime number testing and generation:
 * - Trial division for small numbers
 * - Sieve of Eratosthenes for generating primes up to n
 * - Miller-Rabin primality test for large numbers
 * - Prime generation and enumeration
 */

/**
 * Test if a number is prime using trial division
 * Time complexity: O(√n)
 *
 * @param n - Number to test
 * @returns true if n is prime, false otherwise
 *
 * @example
 * ```ts
 * isPrime(17); // true
 * isPrime(18); // false
 * ```
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;

  const sqrt = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false;
  }

  return true;
}

/**
 * Generate all prime numbers up to n using Sieve of Eratosthenes
 * Time complexity: O(n log log n)
 * Space complexity: O(n)
 *
 * @param n - Upper bound (inclusive)
 * @returns Array of all primes up to n
 *
 * @example
 * ```ts
 * sieveOfEratosthenes(30); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
 * ```
 */
export function sieveOfEratosthenes(n: number): number[] {
  if (n < 2) return [];

  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }

  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
  }

  return primes;
}

/**
 * Modular exponentiation: compute (base^exp) mod m efficiently
 * Time complexity: O(log exp)
 *
 * @param base - Base number
 * @param exp - Exponent
 * @param mod - Modulus
 * @returns (base^exp) mod m
 */
function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0;

  let result = 1;
  base = base % mod;

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }

  return result;
}

/**
 * Miller-Rabin primality test
 * Probabilistic algorithm with configurable accuracy
 *
 * @param n - Number to test
 * @param k - Number of rounds (higher = more accurate)
 * @returns true if n is probably prime, false if definitely composite
 *
 * @example
 * ```ts
 * millerRabin(1000000007, 5); // true
 * millerRabin(1000000008, 5); // false
 * ```
 */
export function millerRabin(n: number, k: number = 5): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0) return false;

  // Write n-1 as 2^r * d
  let d = n - 1;
  let r = 0;
  while (d % 2 === 0) {
    d /= 2;
    r++;
  }

  // Witness loop
  witnessLoop: for (let i = 0; i < k; i++) {
    const a = 2 + Math.floor(Math.random() * (n - 3));
    let x = modPow(a, d, n);

    if (x === 1 || x === n - 1) {
      continue;
    }

    for (let j = 0; j < r - 1; j++) {
      x = modPow(x, 2, n);
      if (x === n - 1) {
        continue witnessLoop;
      }
    }

    return false;
  }

  return true;
}

/**
 * Deterministic Miller-Rabin for numbers up to 3,317,044,064,679,887,385,961,981
 * Uses predetermined witnesses
 *
 * @param n - Number to test
 * @returns true if n is prime, false otherwise
 */
export function millerRabinDeterministic(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0) return false;

  // Small primes for numbers < 2^64
  const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

  // Write n-1 as 2^r * d
  let d = n - 1;
  let r = 0;
  while (d % 2 === 0) {
    d /= 2;
    r++;
  }

  // Test with each witness
  for (const a of witnesses) {
    if (a >= n) continue;

    let x = modPow(a, d, n);

    if (x === 1 || x === n - 1) {
      continue;
    }

    let composite = true;
    for (let j = 0; j < r - 1; j++) {
      x = modPow(x, 2, n);
      if (x === n - 1) {
        composite = false;
        break;
      }
    }

    if (composite) {
      return false;
    }
  }

  return true;
}

/**
 * Generate the first n prime numbers
 *
 * @param n - Number of primes to generate
 * @returns Array of first n primes
 *
 * @example
 * ```ts
 * generatePrimes(10); // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
 * ```
 */
export function generatePrimes(n: number): number[] {
  if (n <= 0) return [];

  const primes: number[] = [];
  let candidate = 2;

  while (primes.length < n) {
    if (isPrime(candidate)) {
      primes.push(candidate);
    }
    candidate++;
  }

  return primes;
}

/**
 * Find the next prime number greater than n
 *
 * @param n - Starting number
 * @returns Next prime after n
 *
 * @example
 * ```ts
 * nextPrime(10); // 11
 * nextPrime(17); // 19
 * ```
 */
export function nextPrime(n: number): number {
  let candidate = Math.floor(n) + 1;

  while (!isPrime(candidate)) {
    candidate++;
  }

  return candidate;
}

/**
 * Find the previous prime number less than n
 *
 * @param n - Starting number
 * @returns Previous prime before n, or null if none exists
 *
 * @example
 * ```ts
 * prevPrime(10); // 7
 * prevPrime(17); // 13
 * ```
 */
export function prevPrime(n: number): number | null {
  let candidate = Math.floor(n) - 1;

  while (candidate >= 2) {
    if (isPrime(candidate)) {
      return candidate;
    }
    candidate--;
  }

  return null;
}

/**
 * Count the number of primes less than or equal to n (Prime counting function π(n))
 *
 * @param n - Upper bound
 * @returns Number of primes ≤ n
 *
 * @example
 * ```ts
 * primeCount(10); // 4 (primes: 2, 3, 5, 7)
 * primeCount(100); // 25
 * ```
 */
export function primeCount(n: number): number {
  return sieveOfEratosthenes(n).length;
}

/**
 * Find the nth prime number (1-indexed)
 *
 * @param n - Index (1 for first prime)
 * @returns The nth prime
 *
 * @example
 * ```ts
 * nthPrime(1); // 2
 * nthPrime(10); // 29
 * ```
 */
export function nthPrime(n: number): number {
  if (n <= 0) throw new Error('n must be positive');
  return generatePrimes(n)[n - 1];
}

/**
 * Generate twin primes up to n
 * Twin primes are pairs (p, p+2) where both are prime
 *
 * @param n - Upper bound
 * @returns Array of twin prime pairs
 *
 * @example
 * ```ts
 * twinPrimes(20); // [[3, 5], [5, 7], [11, 13], [17, 19]]
 * ```
 */
export function twinPrimes(n: number): [number, number][] {
  const primes = sieveOfEratosthenes(n);
  const twins: [number, number][] = [];

  for (let i = 0; i < primes.length - 1; i++) {
    if (primes[i + 1] - primes[i] === 2) {
      twins.push([primes[i], primes[i + 1]]);
    }
  }

  return twins;
}
