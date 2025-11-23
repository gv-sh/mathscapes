/**
 * Modular Arithmetic Operations
 *
 * This module provides functions for modular arithmetic:
 * - Modular exponentiation
 * - Modular multiplicative inverse
 * - Chinese Remainder Theorem
 * - Modular square roots
 */

import { extendedGCD } from './gcd';

/**
 * Modular exponentiation: compute (base^exp) mod m efficiently
 * Uses binary exponentiation for O(log exp) complexity
 *
 * @param base - Base number
 * @param exp - Exponent (must be non-negative)
 * @param mod - Modulus (must be positive)
 * @returns (base^exp) mod m
 *
 * @example
 * ```ts
 * modPow(2, 10, 1000); // 24 (2^10 = 1024 ≡ 24 mod 1000)
 * modPow(3, 7, 11); // 9
 * ```
 */
export function modPow(base: number, exp: number, mod: number): number {
  if (mod <= 0) throw new Error('Modulus must be positive');
  if (exp < 0) throw new Error('Exponent must be non-negative');

  if (mod === 1) return 0;

  let result = 1;
  base = ((base % mod) + mod) % mod; // Handle negative base

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
 * Compute modular multiplicative inverse of a modulo m
 * Returns x such that (a * x) ≡ 1 (mod m)
 * Only exists if gcd(a, m) = 1
 *
 * @param a - Number to invert
 * @param m - Modulus
 * @returns Modular inverse, or null if it doesn't exist
 *
 * @example
 * ```ts
 * modInverse(3, 11); // 4 (because 3 * 4 = 12 ≡ 1 mod 11)
 * modInverse(2, 4); // null (gcd(2, 4) = 2 ≠ 1)
 * ```
 */
export function modInverse(a: number, m: number): number | null {
  if (m <= 0) throw new Error('Modulus must be positive');

  const { gcd, x } = extendedGCD(a, m);

  if (gcd !== 1) {
    return null; // Inverse doesn't exist
  }

  // Ensure result is positive
  return ((x % m) + m) % m;
}

/**
 * Compute a mod m, ensuring positive result
 *
 * @param a - Number
 * @param m - Modulus
 * @returns a mod m (always non-negative)
 *
 * @example
 * ```ts
 * mod(17, 5); // 2
 * mod(-3, 5); // 2 (not -3)
 * ```
 */
export function mod(a: number, m: number): number {
  if (m <= 0) throw new Error('Modulus must be positive');
  return ((a % m) + m) % m;
}

/**
 * Modular addition: (a + b) mod m
 *
 * @param a - First number
 * @param b - Second number
 * @param m - Modulus
 * @returns (a + b) mod m
 */
export function modAdd(a: number, b: number, m: number): number {
  return mod(mod(a, m) + mod(b, m), m);
}

/**
 * Modular subtraction: (a - b) mod m
 *
 * @param a - First number
 * @param b - Second number
 * @param m - Modulus
 * @returns (a - b) mod m
 */
export function modSub(a: number, b: number, m: number): number {
  return mod(mod(a, m) - mod(b, m), m);
}

/**
 * Modular multiplication: (a * b) mod m
 *
 * @param a - First number
 * @param b - Second number
 * @param m - Modulus
 * @returns (a * b) mod m
 */
export function modMul(a: number, b: number, m: number): number {
  return mod(mod(a, m) * mod(b, m), m);
}

/**
 * Modular division: (a / b) mod m = (a * b^(-1)) mod m
 *
 * @param a - Dividend
 * @param b - Divisor
 * @param m - Modulus
 * @returns (a / b) mod m, or null if b has no inverse mod m
 */
export function modDiv(a: number, b: number, m: number): number | null {
  const bInv = modInverse(b, m);
  if (bInv === null) return null;
  return modMul(a, bInv, m);
}

/**
 * Result of Chinese Remainder Theorem
 */
export interface CRTResult {
  /** Solution x such that x ≡ a_i (mod m_i) for all i */
  solution: number;
  /** Product of all moduli */
  modulus: number;
}

/**
 * Chinese Remainder Theorem
 * Solve system of congruences:
 * x ≡ a[0] (mod m[0])
 * x ≡ a[1] (mod m[1])
 * ...
 * x ≡ a[n-1] (mod m[n-1])
 *
 * Moduli must be pairwise coprime
 *
 * @param remainders - Array of remainders [a_0, a_1, ..., a_n]
 * @param moduli - Array of moduli [m_0, m_1, ..., m_n]
 * @returns Solution and combined modulus, or null if no solution
 *
 * @example
 * ```ts
 * const result = chineseRemainder([2, 3, 2], [3, 5, 7]);
 * // Find x such that x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
 * // result.solution = 23
 * ```
 */
export function chineseRemainder(
  remainders: number[],
  moduli: number[]
): CRTResult | null {
  if (remainders.length !== moduli.length) {
    throw new Error('Arrays must have same length');
  }

  if (remainders.length === 0) {
    throw new Error('Arrays must not be empty');
  }

  const n = remainders.length;

  // Compute product of all moduli
  const M = moduli.reduce((acc, m) => acc * m, 1);

  let solution = 0;

  for (let i = 0; i < n; i++) {
    const Mi = M / moduli[i];
    const yi = modInverse(Mi, moduli[i]);

    if (yi === null) {
      return null; // Moduli are not pairwise coprime
    }

    solution = mod(solution + remainders[i] * Mi * yi, M);
  }

  return { solution, modulus: M };
}

/**
 * Check if a is a quadratic residue modulo p (prime)
 * Uses Euler's criterion: a^((p-1)/2) ≡ 1 (mod p)
 *
 * @param a - Number to test
 * @param p - Prime modulus
 * @returns true if a is a quadratic residue mod p
 *
 * @example
 * ```ts
 * isQuadraticResidue(4, 7); // true (2^2 ≡ 4 mod 7)
 * isQuadraticResidue(3, 7); // false
 * ```
 */
export function isQuadraticResidue(a: number, p: number): boolean {
  if (p === 2) return true;

  a = mod(a, p);
  if (a === 0) return true;

  // Euler's criterion
  return modPow(a, Math.floor((p - 1) / 2), p) === 1;
}

/**
 * Compute Legendre symbol (a/p)
 * Returns:
 *  1 if a is a quadratic residue mod p and a ≢ 0 (mod p)
 *  0 if a ≡ 0 (mod p)
 * -1 if a is not a quadratic residue mod p
 *
 * @param a - Number
 * @param p - Prime modulus
 * @returns Legendre symbol value
 */
export function legendreSymbol(a: number, p: number): number {
  a = mod(a, p);
  if (a === 0) return 0;

  const result = modPow(a, Math.floor((p - 1) / 2), p);
  return result === 1 ? 1 : -1;
}

/**
 * Tonelli-Shanks algorithm for computing modular square roots
 * Find r such that r^2 ≡ a (mod p) where p is an odd prime
 *
 * @param a - Number to find square root of
 * @param p - Odd prime modulus
 * @returns Square root r, or null if a is not a quadratic residue
 *
 * @example
 * ```ts
 * modSqrt(4, 7); // 2 (because 2^2 ≡ 4 mod 7)
 * modSqrt(3, 7); // null (3 is not a quadratic residue mod 7)
 * ```
 */
export function modSqrt(a: number, p: number): number | null {
  a = mod(a, p);

  if (a === 0) return 0;
  if (p === 2) return a;

  // Check if a is a quadratic residue
  if (!isQuadraticResidue(a, p)) {
    return null;
  }

  // Special case: p ≡ 3 (mod 4)
  if (p % 4 === 3) {
    return modPow(a, Math.floor((p + 1) / 4), p);
  }

  // Tonelli-Shanks algorithm for p ≡ 1 (mod 4)
  // Write p - 1 = 2^s * q where q is odd
  let q = p - 1;
  let s = 0;
  while (q % 2 === 0) {
    q /= 2;
    s++;
  }

  // Find a quadratic non-residue z
  let z = 2;
  while (isQuadraticResidue(z, p)) {
    z++;
  }

  let m = s;
  let c = modPow(z, q, p);
  let t = modPow(a, q, p);
  let r = modPow(a, Math.floor((q + 1) / 2), p);

  while (t !== 1) {
    // Find the least i such that t^(2^i) = 1
    let i = 1;
    let temp = modMul(t, t, p);
    while (temp !== 1) {
      temp = modMul(temp, temp, p);
      i++;
    }

    const b = modPow(c, Math.pow(2, m - i - 1), p);
    m = i;
    c = modMul(b, b, p);
    t = modMul(t, c, p);
    r = modMul(r, b, p);
  }

  return r;
}

/**
 * Compute discrete logarithm using baby-step giant-step algorithm
 * Find x such that base^x ≡ target (mod m)
 * Time complexity: O(√m)
 *
 * @param base - Base
 * @param target - Target value
 * @param m - Modulus
 * @returns x such that base^x ≡ target (mod m), or null if no solution
 *
 * @example
 * ```ts
 * discreteLog(2, 8, 11); // 3 (because 2^3 ≡ 8 mod 11)
 * ```
 */
export function discreteLog(
  base: number,
  target: number,
  m: number
): number | null {
  base = mod(base, m);
  target = mod(target, m);

  if (base === 0) return target === 0 ? 0 : null;
  if (target === 1) return 0;

  const n = Math.ceil(Math.sqrt(m));

  // Baby step: compute base^j mod m for j = 0, 1, ..., n-1
  const table = new Map<number, number>();
  let power = 1;

  for (let j = 0; j < n; j++) {
    if (!table.has(power)) {
      table.set(power, j);
    }
    power = modMul(power, base, m);
  }

  // Giant step: compute target * (base^(-n))^i for i = 0, 1, ..., n-1
  const baseInvN = modInverse(modPow(base, n, m), m);
  if (baseInvN === null) return null;

  let gamma = target;
  for (let i = 0; i < n; i++) {
    if (table.has(gamma)) {
      return i * n + table.get(gamma)!;
    }
    gamma = modMul(gamma, baseInvN, m);
  }

  return null;
}
