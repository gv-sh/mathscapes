/**
 * Integer Factorization Algorithms
 *
 * This module provides functions for factoring integers:
 * - Trial division
 * - Pollard's rho algorithm
 * - Prime factorization
 */

import { isPrime } from './primes';
import { gcd } from './gcd';

/**
 * Factor a number using trial division
 * Time complexity: O(√n)
 *
 * @param n - Number to factor
 * @returns Array of prime factors (with multiplicity)
 *
 * @example
 * ```ts
 * trialDivision(60); // [2, 2, 3, 5]
 * trialDivision(17); // [17]
 * ```
 */
export function trialDivision(n: number): number[] {
  if (n < 2) return [];

  n = Math.floor(Math.abs(n));
  const factors: number[] = [];

  // Factor out 2s
  while (n % 2 === 0) {
    factors.push(2);
    n /= 2;
  }

  // Try odd divisors up to √n
  let divisor = 3;
  while (divisor * divisor <= n) {
    while (n % divisor === 0) {
      factors.push(divisor);
      n /= divisor;
    }
    divisor += 2;
  }

  // If n > 1, then it's a prime factor
  if (n > 1) {
    factors.push(n);
  }

  return factors;
}

/**
 * Pollard's rho algorithm for integer factorization
 * Efficient for finding small factors of large numbers
 * Time complexity: O(n^(1/4)) expected
 *
 * @param n - Number to factor
 * @param maxIterations - Maximum iterations before giving up
 * @returns A non-trivial factor of n, or null if none found
 *
 * @example
 * ```ts
 * pollardsRho(8051); // Returns a factor like 83 or 97
 * ```
 */
export function pollardsRho(
  n: number,
  maxIterations: number = 100000
): number | null {
  if (n <= 1) return null;
  if (n % 2 === 0) return 2;
  if (isPrime(n)) return null;

  n = Math.floor(n);

  // Function f(x) = (x^2 + c) mod n
  const c = Math.floor(Math.random() * (n - 1)) + 1;
  const f = (x: number) => (x * x + c) % n;

  let x = 2;
  let y = 2;
  let d = 1;
  let iterations = 0;

  while (d === 1 && iterations < maxIterations) {
    x = f(x);
    y = f(f(y));
    d = gcd(Math.abs(x - y), n);
    iterations++;
  }

  if (d === n) {
    return null; // Failed to find factor
  }

  return d === 1 ? null : d;
}

/**
 * Factorize using Pollard's rho with fallback to trial division
 *
 * @param n - Number to factor
 * @returns Array of prime factors
 */
export function factorize(n: number): number[] {
  if (n < 2) return [];
  if (n === 2) return [2];
  if (isPrime(n)) return [n];

  n = Math.floor(Math.abs(n));

  // For small numbers, use trial division
  if (n < 10000) {
    return trialDivision(n);
  }

  // For larger numbers, try Pollard's rho
  const factors: number[] = [];
  const queue: number[] = [n];

  while (queue.length > 0) {
    const current = queue.pop()!;

    if (current === 1) continue;

    if (isPrime(current)) {
      factors.push(current);
      continue;
    }

    // Try to find a factor
    const factor = pollardsRho(current);

    if (factor === null) {
      // Fallback to trial division
      const trialFactors = trialDivision(current);
      factors.push(...trialFactors);
    } else {
      // Continue factoring
      queue.push(factor);
      queue.push(current / factor);
    }
  }

  return factors.sort((a, b) => a - b);
}

/**
 * Prime factorization represented as {prime: exponent} pairs
 */
export interface PrimeFactorization {
  [prime: number]: number;
}

/**
 * Compute prime factorization as a map of {prime: exponent}
 *
 * @param n - Number to factor
 * @returns Object mapping each prime to its exponent
 *
 * @example
 * ```ts
 * primeFactorization(60); // {2: 2, 3: 1, 5: 1} (60 = 2^2 * 3 * 5)
 * primeFactorization(100); // {2: 2, 5: 2} (100 = 2^2 * 5^2)
 * ```
 */
export function primeFactorization(n: number): PrimeFactorization {
  const factors = factorize(n);
  const factorMap: PrimeFactorization = {};

  for (const factor of factors) {
    factorMap[factor] = (factorMap[factor] || 0) + 1;
  }

  return factorMap;
}

/**
 * Convert prime factorization object back to number
 *
 * @param factorization - Prime factorization object
 * @returns The number represented by the factorization
 *
 * @example
 * ```ts
 * fromPrimeFactorization({2: 2, 3: 1, 5: 1}); // 60
 * ```
 */
export function fromPrimeFactorization(factorization: PrimeFactorization): number {
  let result = 1;

  for (const [prime, exponent] of Object.entries(factorization)) {
    result *= Math.pow(Number(prime), exponent);
  }

  return result;
}

/**
 * Find the smallest prime factor of n
 *
 * @param n - Number to check
 * @returns Smallest prime factor
 *
 * @example
 * ```ts
 * smallestPrimeFactor(15); // 3
 * smallestPrimeFactor(17); // 17 (prime)
 * ```
 */
export function smallestPrimeFactor(n: number): number {
  if (n < 2) throw new Error('n must be at least 2');

  n = Math.floor(n);

  if (n % 2 === 0) return 2;

  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return i;
  }

  return n; // n is prime
}

/**
 * Find the largest prime factor of n
 *
 * @param n - Number to check
 * @returns Largest prime factor
 *
 * @example
 * ```ts
 * largestPrimeFactor(60); // 5
 * largestPrimeFactor(17); // 17 (prime)
 * ```
 */
export function largestPrimeFactor(n: number): number {
  const factors = factorize(n);
  return factors.length > 0 ? factors[factors.length - 1] : n;
}

/**
 * Count the number of distinct prime factors of n (ω(n))
 *
 * @param n - Number to check
 * @returns Number of distinct prime factors
 *
 * @example
 * ```ts
 * distinctPrimeFactors(60); // 3 (primes: 2, 3, 5)
 * distinctPrimeFactors(100); // 2 (primes: 2, 5)
 * ```
 */
export function distinctPrimeFactors(n: number): number {
  return Object.keys(primeFactorization(n)).length;
}

/**
 * Count the total number of prime factors with multiplicity (Ω(n))
 *
 * @param n - Number to check
 * @returns Total number of prime factors (with multiplicity)
 *
 * @example
 * ```ts
 * totalPrimeFactors(60); // 4 (60 = 2 * 2 * 3 * 5)
 * totalPrimeFactors(100); // 4 (100 = 2 * 2 * 5 * 5)
 * ```
 */
export function totalPrimeFactors(n: number): number {
  return factorize(n).length;
}

/**
 * Check if n is square-free (no repeated prime factors)
 *
 * @param n - Number to check
 * @returns true if n is square-free
 *
 * @example
 * ```ts
 * isSquareFree(30); // true (30 = 2 * 3 * 5)
 * isSquareFree(12); // false (12 = 2^2 * 3)
 * ```
 */
export function isSquareFree(n: number): boolean {
  const factors = primeFactorization(n);
  return Object.values(factors).every((exp) => exp === 1);
}

/**
 * Check if n is a prime power (n = p^k for some prime p and k ≥ 1)
 *
 * @param n - Number to check
 * @returns {isPrimePower: boolean, prime?: number, exponent?: number}
 *
 * @example
 * ```ts
 * isPrimePower(8); // {isPrimePower: true, prime: 2, exponent: 3}
 * isPrimePower(12); // {isPrimePower: false}
 * ```
 */
export function isPrimePower(n: number): {
  isPrimePower: boolean;
  prime?: number;
  exponent?: number;
} {
  const factors = primeFactorization(n);
  const primes = Object.keys(factors);

  if (primes.length !== 1) {
    return { isPrimePower: false };
  }

  const prime = Number(primes[0]);
  const exponent = factors[prime];

  return { isPrimePower: true, prime, exponent };
}

/**
 * Compute the radical of n (product of distinct prime factors)
 *
 * @param n - Number
 * @returns Product of distinct prime factors
 *
 * @example
 * ```ts
 * radical(12); // 6 (12 = 2^2 * 3, radical = 2 * 3 = 6)
 * radical(30); // 30 (30 = 2 * 3 * 5, radical = 2 * 3 * 5 = 30)
 * ```
 */
export function radical(n: number): number {
  const factors = primeFactorization(n);
  let result = 1;

  for (const prime of Object.keys(factors)) {
    result *= Number(prime);
  }

  return result;
}

/**
 * Möbius function μ(n)
 * Returns:
 *  1 if n is square-free with an even number of prime factors
 * -1 if n is square-free with an odd number of prime factors
 *  0 if n is not square-free
 *
 * @param n - Number
 * @returns μ(n)
 *
 * @example
 * ```ts
 * mobius(30); // -1 (square-free with 3 prime factors)
 * mobius(12); // 0 (not square-free)
 * mobius(6); // 1 (square-free with 2 prime factors)
 * ```
 */
export function mobius(n: number): number {
  if (n === 1) return 1;

  const factors = primeFactorization(n);

  // Check if square-free
  for (const exp of Object.values(factors)) {
    if (exp > 1) return 0;
  }

  // Count number of prime factors
  const numFactors = Object.keys(factors).length;
  return numFactors % 2 === 0 ? 1 : -1;
}
